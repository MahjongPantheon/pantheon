import { vi } from 'vitest';
import { GHOST_PLAYER_ID } from '../../../../Common/constants.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionPlayerEntity } from '../../entities/SessionPlayer.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { Repository } from '../../services/Repository.js';
import { init } from '../../tests/initOrm.js';
import { makePlayer } from '../../tests/playerFixtures.js';
import { Model } from '../Model.js';
import { SessionModel } from '../SessionModel.js';
import { SessionResultsModel } from '../SessionResultsModel.js';
import { PlayerModel } from '../PlayerModel.js';

const orm = await init();
const repo = Repository.instance({}, orm);
const sessions = Model.getModel(repo, SessionModel);
const results = Model.getModel(repo, SessionResultsModel);
const players = Model.getModel(repo, PlayerModel);

function makeEvent(): EventEntity {
  return Object.assign(new EventEntity(), { id: 1, ruleset: RulesetEntity.createRuleset('sanma') });
}

describe('Sanma sessions and results', () => {
  beforeAll(() => repo.cache.connect());
  afterAll(() => repo.destroy());
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });

  it('stores a North ghost seat while initializing only three real scores', () => {
    const event = makeEvent();
    const persist = vi.spyOn(repo.em, 'persist');
    const ids = [1, 2, 3];
    const session = sessions.startSession(event, ids, 1);
    expect(ids).toEqual([1, 2, 3]);
    expect(session.intermediateResults?.playerIds).toEqual([1, 2, 3]);
    expect(session.intermediateResults?.scores).toEqual({ 1: 35000, 2: 35000, 3: 35000 });
    const seats = [
      ...new Set(
        persist.mock.calls
          .flatMap(([value]) => (Array.isArray(value) ? value : [value]))
          .filter((value): value is SessionPlayerEntity => value instanceof SessionPlayerEntity)
      ),
    ];
    expect(seats.map((seat) => [seat.playerId, seat.order])).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
      [GHOST_PLAYER_ID, 4],
    ]);
  });

  it.each([
    [1, 2],
    [1, 2, 3, 4],
    [1, 1, 3],
    [1, 2, GHOST_PLAYER_ID],
  ])('rejects invalid real-player list %j', (...ids) => {
    expect(() => sessions.startSession(makeEvent(), ids, null)).toThrow('3 distinct real players');
  });

  it('looks up the ghost locally without sending its ID to Frey', async () => {
    const fetch = jest
      .spyOn(repo.frey, 'GetPersonalInfo')
      .mockResolvedValue({ people: [makePlayer(1), makePlayer(2), makePlayer(3)] });
    vi.spyOn(repo.cache.client, 'set').mockResolvedValue('OK');
    const result = await players.findById([1, 2, 3, GHOST_PLAYER_ID], true);
    expect(fetch).toHaveBeenCalledWith({ ids: [1, 2, 3] });
    expect(result.map((player) => player.id)).toEqual([1, 2, 3, GHOST_PLAYER_ID]);
  });

  it('keeps the ghost in the overview with zero score and out of the score map', async () => {
    const event = makeEvent();
    const session = Object.assign(new SessionEntity(), {
      id: 1,
      event,
      representationalHash: 'sanma',
      intermediateResults: new SessionState(event.ruleset, [1, 2, 3]).state,
    });
    vi.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
    vi.spyOn(sessions, 'findByRepresentationalHash').mockResolvedValue([session]);
    vi.spyOn(players, 'findPlayersForSessions').mockResolvedValue({
      playersData: { players: [1, 2, 3, GHOST_PLAYER_ID].map(makePlayer), replaceMap: new Map() },
      playerBySession: [],
    });
    // Event/timer lookups are independent from the synthetic player lookup.
    const { EventModel } = await import('../EventModel.js');
    const events = Model.getModel(repo, EventModel);
    vi.spyOn(events, 'findById').mockResolvedValue([event]);
    vi.spyOn(events, 'getTimerStateForSessions').mockResolvedValue({});
    const overview = await sessions.getSessionOverview('sanma');
    expect(overview.players.find((player) => player.id === GHOST_PLAYER_ID)?.score).toBe(0);
    expect(overview.state?.scores.map((score) => score.playerId)).toEqual([1, 2, 3]);
  });

  it('calculates only real-player results, splitting leftover riichi among tied leaders', () => {
    const rules = RulesetEntity.createRuleset('sanma');
    const state = new SessionState(rules, [1, 2, 3, GHOST_PLAYER_ID]);
    state.setScores({ 1: 40000, 2: 25000, 3: 40000 });
    state.state.riichiBets = 1;
    const items = results.getUnfinishedSessionResults(rules, 1, 1, state, [
      1,
      2,
      3,
      GHOST_PLAYER_ID,
    ]);
    expect(items.map((item) => item.playerId)).toEqual([1, 2, 3]);
    expect(items.map((item) => item.score)).toEqual([40500, 25000, 40500]);
    expect(items.map((item) => item.ratingDelta)).toEqual([13000, -25000, 13000]);
  });

  it('uses sanma draw payments when replaying a saved round for payment logs', async () => {
    const { RoundModel } = await import('../RoundModel.js');
    const roundModel = Model.getModel(repo, RoundModel);
    const event = makeEvent();
    event.ruleset.rules.sanmaDrawPayments = 4000;
    const state = new SessionState(event.ruleset, [1, 2, 3]);
    const session = Object.assign(new SessionEntity(), { event, intermediateResults: state.state });
    const round = Object.assign(new RoundEntity(), {
      outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
      lastSessionState: state.state,
      hands: [{ tempai: [1] }],
      riichi: [],
    });
    expect(roundModel.getRoundPaymentsInfo(event, session, round).direct).toEqual({
      '1<-2': 2000,
      '1<-3': 2000,
    });
  });
});
