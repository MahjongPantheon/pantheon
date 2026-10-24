import { getDieHard } from './dieHard.js';
import { jest } from '@jest/globals';
import { Model } from '../Model.js';
import { SessionModel } from '../SessionModel.js';
import { RoundModel } from '../RoundModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { SessionResultsModel } from '../SessionResultsModel.js';
import { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { SessionResultsEntity } from '../../entities/SessionResults.entity.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { HandEntity } from '../../entities/Hand.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { getBestTsumoistInSingleSession } from './bestTsumoist.js';
import { getBestHandOfEvent } from './bestHandOfEvent.js';
import { getMaxFuHand } from './maxFuHand.js';
import { getYakumans } from './yakumans.js';
import { getImpossibleWait } from './impossibleWait.js';
import { getNeedMoreGold } from './needMoreGold.js';
import { getBestDealer } from './bestDealer.js';
import { calcRiichiStat } from './helpers/getRiichiStat.js';
import { getMaxStolenRiichiBetsCount } from './maxStolenRiichiBetsCount.js';
import { getMinLostRiichiBetsCount } from './minLostRiichiBetsCount.js';
import { getHonoredDonor } from './honoredDonor.js';
import { init } from '../../tests/initOrm.js';
import { makePlayer } from '../../tests/playerFixtures.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';

const orm = await init();
const repo = Repository.instance({}, orm);
const sessionModel = Model.getModel(repo, SessionModel);
const roundModel = Model.getModel(repo, RoundModel);
const playerModel = Model.getModel(repo, PlayerModel);
const resultsModel = Model.getModel(repo, SessionResultsModel);
let fixtureId = 5000;

function fixture() {
  const event = Object.assign(new EventEntity(), {
    id: ++fixtureId,
    ruleset: RulesetEntity.createRuleset('ema'),
  });
  const state = new SessionState(event.ruleset, [1, 2, 3, 4]).state;
  const session = Object.assign(new SessionEntity(), {
    id: ++fixtureId,
    representationalHash: `game-${fixtureId}`,
    event,
    intermediateResults: state,
    players: [1, 2, 3, 4].map((playerId, order) => ({ playerId, order: order + 1 })),
  });
  return { event, session };
}

function round(
  session: SessionEntity,
  outcome: RoundOutcome,
  winnerIds: number[],
  riichi: number[] = []
) {
  return Object.assign(new RoundEntity(), {
    session,
    round: 1,
    outcome,
    riichi,
    lastSessionState: { riichiBets: 0, honba: 0 },
    hands: winnerIds.map((winnerId) => Object.assign(new HandEntity(), { winnerId, loserId: 3 })),
  });
}

describe('Achievement calculations', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  afterAll(() => repo.destroy());

  it('uses three-seat dealer rotation and excludes the ghost from achievements', async () => {
    const { event, session } = fixture();
    event.ruleset = RulesetEntity.createRuleset('sanma');
    session.players[3].playerId = -1;
    const first = round(session, RoundOutcome.ROUND_OUTCOME_RON, [1]);
    first.round = 4;
    first.hands[0].han = 5;
    first.hands[0].fu = 0;
    const second = round(session, RoundOutcome.ROUND_OUTCOME_RON, [2]);
    second.round = 5;
    second.hands[0].han = 5;
    second.hands[0].fu = 0;
    const third = round(session, RoundOutcome.ROUND_OUTCOME_RON, [3]);
    third.round = 6;
    third.hands[0].han = 5;
    third.hands[0].fu = 0;
    first.hands[0].loserId = 2;
    second.hands[0].loserId = 3;
    third.hands[0].loserId = 1;
    jest.spyOn(sessionModel, 'findByEventAndStatus').mockResolvedValue([session]);
    jest.spyOn(roundModel, 'findBySessionIds').mockResolvedValue([first, second, third]);
    expect(await getBestDealer(event, repo)).toEqual({ bestWinCount: 1, playerIds: [1, 2, 3] });
    expect((await getImpossibleWait(event, repo)).map((item) => item.amount)).toEqual([
      12000, 12000, 12000,
    ]);
    expect(await getDieHard(event, repo)).toEqual({ count: 1, playerIds: [1, 2, 3] });
  });

  it('selects tied maximum tsumo counts within a single session rather than event totals', async () => {
    const { event, session: first } = fixture();
    const second = Object.assign(new SessionEntity(), {
      id: ++fixtureId,
      representationalHash: `game-${fixtureId}`,
    });
    jest.spyOn(sessionModel, 'findByEventAndStatus').mockResolvedValue([first, second]);
    jest
      .spyOn(roundModel, 'findBySessionIds')
      .mockResolvedValue([
        round(first, RoundOutcome.ROUND_OUTCOME_TSUMO, [1]),
        round(first, RoundOutcome.ROUND_OUTCOME_TSUMO, [1]),
        round(first, RoundOutcome.ROUND_OUTCOME_TSUMO, [2]),
        round(first, RoundOutcome.ROUND_OUTCOME_RON, [3]),
        round(second, RoundOutcome.ROUND_OUTCOME_TSUMO, [1]),
        round(second, RoundOutcome.ROUND_OUTCOME_TSUMO, [2]),
        round(second, RoundOutcome.ROUND_OUTCOME_TSUMO, [2]),
        round(second, RoundOutcome.ROUND_OUTCOME_TSUMO, [4]),
      ]);
    await expect(getBestTsumoistInSingleSession(event, repo)).resolves.toEqual({
      tsumo: 2,
      playerIds: [1, 2],
      gamesByPlayer: { 1: [first.representationalHash], 2: [second.representationalHash] },
    });
  });

  it('retains all tied hand maxima and their games, excluding superseded results', async () => {
    const { event, session: first } = fixture();
    const { session: second } = fixture();
    const low = round(first, RoundOutcome.ROUND_OUTCOME_RON, [3]);
    const high = round(first, RoundOutcome.ROUND_OUTCOME_MULTIRON, [1, 2]);
    const tied = round(second, RoundOutcome.ROUND_OUTCOME_TSUMO, [1]);
    low.hands[0].han = 1;
    for (const r of [high, tied]) {
      for (const hand of r.hands) {
        hand.han = 6;
        hand.fu = 80;
      }
    }
    jest.spyOn(sessionModel, 'findByEventAndStatus').mockResolvedValue([first, second]);
    jest.spyOn(roundModel, 'findBySessionIds').mockResolvedValue([low, high, tied]);
    const gamesByPlayer = {
      1: [first.representationalHash, second.representationalHash],
      2: [first.representationalHash],
    };
    await expect(getBestHandOfEvent(event, repo)).resolves.toEqual({
      han: 6,
      playerIds: [1, 2],
      gamesByPlayer,
    });
    const query = jest.spyOn(repo.em, 'findAll').mockResolvedValue([high, tied, low]);
    await expect(getMaxFuHand(event.id, repo)).resolves.toEqual({
      fu: 80,
      playerIds: [1, 2],
      gamesByPlayer,
    });
    expect(query).toHaveBeenCalledWith(
      RoundEntity,
      expect.objectContaining({ populate: ['hands', 'session'] })
    );
  });

  it('keeps every tied session maximum for a player', async () => {
    const { event, session: first } = fixture();
    const { session: second } = fixture();
    jest.spyOn(sessionModel, 'findByEventAndStatus').mockResolvedValue([first, second]);
    jest
      .spyOn(roundModel, 'findBySessionIds')
      .mockResolvedValue([
        round(first, RoundOutcome.ROUND_OUTCOME_TSUMO, [1]),
        round(second, RoundOutcome.ROUND_OUTCOME_TSUMO, [1]),
      ]);
    await expect(getBestTsumoistInSingleSession(event, repo)).resolves.toEqual({
      tsumo: 1,
      playerIds: [1],
      gamesByPlayer: { 1: [first.representationalHash, second.representationalHash] },
    });
  });

  it('attaches individual game references without linking event-wide dealer totals', async () => {
    const { event, session } = fixture();
    // The production player orders are one-based; dealer calculation sorts them.
    const win = round(session, RoundOutcome.ROUND_OUTCOME_RON, [1]);
    win.hands[0].han = 13;
    win.hands[0].fu = 0;
    event.ruleset.rules.withKazoe = true;
    jest.spyOn(sessionModel, 'findByEventAndStatus').mockResolvedValue([session]);
    jest.spyOn(roundModel, 'findBySessionIds').mockResolvedValue([win]);
    await expect(getYakumans(event, repo)).resolves.toEqual([
      { playerId: 1, kazoe: true, sessionHash: session.representationalHash },
    ]);
    const dealIns = await getImpossibleWait(event, repo);
    expect(dealIns).toHaveLength(1);
    expect(dealIns[0]).toEqual(
      expect.objectContaining({ playerId: 3, sessionHash: session.representationalHash })
    );
    await expect(getBestDealer(event, repo)).resolves.toEqual({
      bestWinCount: 1,
      playerIds: [1],
    });
    jest
      .spyOn(repo.em, 'findAll')
      .mockResolvedValue([
        Object.assign(new SessionResultsEntity(), { playerId: 1, score: 65000, session }),
      ]);
    await expect(getNeedMoreGold(event, repo)).resolves.toEqual([
      { playerId: 1, score: 65000, sessionHash: session.representationalHash },
    ]);
  });

  it('accounts for wins, losses, carried bets, multi-ron and leftover bets', async () => {
    const { event, session } = fixture();
    event.ruleset.rules.riichiGoesToWinner = true;
    event.ruleset.rules.doubleronRiichiAtamahane = true;
    session.intermediateResults.riichiBets = 2;
    jest.spyOn(playerModel, 'findPlayersForEvents').mockResolvedValue({
      players: [1, 2, 3, 4].map(makePlayer),
      replaceMap: new Map(),
    });
    jest.spyOn(sessionModel, 'findByEventAndStatus').mockResolvedValue([session]);
    jest
      .spyOn(resultsModel, 'findBySession')
      .mockResolvedValue([
        Object.assign(new SessionResultsEntity(), { session, playerId: 4, place: 1 }),
      ]);
    const ron = round(session, RoundOutcome.ROUND_OUTCOME_RON, [2], [2, 3]);
    ron.lastSessionState.riichiBets = 1;
    const multiron = round(session, RoundOutcome.ROUND_OUTCOME_MULTIRON, [1, 2], [1, 2, 4]);
    multiron.lastSessionState.riichiBets = 2;
    jest
      .spyOn(roundModel, 'findBySessionIds')
      .mockResolvedValue([
        ron,
        round(session, RoundOutcome.ROUND_OUTCOME_TSUMO, [4], [1]),
        round(session, RoundOutcome.ROUND_OUTCOME_DRAW, [], [1]),
        round(session, RoundOutcome.ROUND_OUTCOME_ABORT, [], [3]),
        multiron,
      ]);
    const stats = await calcRiichiStat(repo, event);
    expect(multiron.riichi).toEqual([1, 2, 4]);
    expect([...stats.data.values()]).toEqual([
      { playerId: 1, won: 1, lost: 2, stole: 4 },
      { playerId: 2, won: 1, lost: 1, stole: 2 },
      { playerId: 3, won: 0, lost: 2, stole: 0 },
      { playerId: 4, won: 0, lost: 1, stole: 3 },
    ]);
    await expect(getMaxStolenRiichiBetsCount(event, repo)).resolves.toEqual([
      { playerId: 1, count: 4 },
      { playerId: 4, count: 3 },
      { playerId: 2, count: 2 },
    ]);
    await expect(getMinLostRiichiBetsCount(event, repo)).resolves.toEqual([
      { playerId: 2, count: 1 },
      { playerId: 4, count: 1 },
      { playerId: 1, count: 2 },
      { playerId: 3, count: 2 },
    ]);
    await expect(calcRiichiStat(repo, event)).resolves.toBe(stats);
  });

  it.each([false, true])(
    'excludes registrations without completed sessions from riichi achievements (has sessions: %s)',
    async (hasSessions) => {
      const { event, session } = fixture();
      jest.spyOn(playerModel, 'findPlayersForEvents').mockResolvedValue({
        players: [5, 6, 7, 8, 9, 10, 1, 2, 3, 4].map(makePlayer),
        replaceMap: new Map(),
      });
      jest
        .spyOn(sessionModel, 'findByEventAndStatus')
        .mockResolvedValue(hasSessions ? [session] : []);
      jest
        .spyOn(roundModel, 'findBySessionIds')
        .mockResolvedValue(
          hasSessions ? [round(session, RoundOutcome.ROUND_OUTCOME_DRAW, [])] : []
        );
      jest.spyOn(resultsModel, 'findBySession').mockResolvedValue([]);
      event.ruleset.rules.riichiGoesToWinner = false;

      const expected = hasSessions ? [1, 2, 3, 4].map((playerId) => ({ playerId, count: 0 })) : [];
      const stats = await calcRiichiStat(repo, event);
      expect([...stats.data.keys()]).toEqual(hasSessions ? [1, 2, 3, 4] : []);
      await expect(getMinLostRiichiBetsCount(event, repo)).resolves.toEqual(expected);
      await expect(getHonoredDonor(event, repo)).resolves.toEqual(expected);
      await expect(getMaxStolenRiichiBetsCount(event, repo)).resolves.toEqual([]);
    }
  );

  it.each([
    [false, false],
    [false, true],
    [true, false],
  ])(
    'handles sessions with missing results or rounds (results: %s, rounds: %s)',
    async (hasResults, hasRounds) => {
      const { event, session } = fixture();
      const { session: completeSession } = fixture();
      completeSession.event = event;
      event.ruleset.rules.riichiGoesToWinner = true;
      session.intermediateResults.riichiBets = 2;
      completeSession.intermediateResults.riichiBets = 1;
      jest.spyOn(playerModel, 'findPlayersForEvents').mockResolvedValue({
        players: [1, 2, 3, 4, 5].map(makePlayer),
        replaceMap: new Map(),
      });
      jest
        .spyOn(sessionModel, 'findByEventAndStatus')
        .mockResolvedValue([session, completeSession]);
      jest.spyOn(resultsModel, 'findBySession').mockResolvedValue([
        Object.assign(new SessionResultsEntity(), {
          session: completeSession,
          playerId: 4,
          place: 1,
        }),
        ...(hasResults
          ? [Object.assign(new SessionResultsEntity(), { session, playerId: 4, place: 1 })]
          : []),
      ]);
      jest
        .spyOn(roundModel, 'findBySessionIds')
        .mockResolvedValue([
          round(completeSession, RoundOutcome.ROUND_OUTCOME_RON, [2], [1]),
          ...(hasRounds ? [round(session, RoundOutcome.ROUND_OUTCOME_RON, [2], [1])] : []),
        ]);

      const stats = await calcRiichiStat(repo, event);
      expect([...stats.data.values()]).toEqual([
        { playerId: 1, won: 0, lost: hasRounds ? 2 : 1, stole: 0 },
        { playerId: 2, won: 0, lost: 0, stole: hasRounds ? 2 : 1 },
        { playerId: 3, won: 0, lost: 0, stole: 0 },
        { playerId: 4, won: 0, lost: 0, stole: hasResults ? 3 : 1 },
      ]);
      await expect(getMaxStolenRiichiBetsCount(event, repo)).resolves.toHaveLength(2);
      await expect(getMinLostRiichiBetsCount(event, repo)).resolves.toHaveLength(4);
    }
  );

  it('refreshes cached statistics after two minutes', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const { event } = fixture();
    const players = jest
      .spyOn(playerModel, 'findPlayersForEvents')
      .mockResolvedValue({ players: [], replaceMap: new Map() });
    jest.spyOn(sessionModel, 'findByEventAndStatus').mockResolvedValue([]);
    jest.spyOn(roundModel, 'findBySessionIds').mockResolvedValue([]);
    jest.spyOn(resultsModel, 'findBySession').mockResolvedValue([]);
    const first = await calcRiichiStat(repo, event);
    expect(await calcRiichiStat(repo, event)).toBe(first);
    jest.setSystemTime(new Date('2026-01-01T00:02:01Z'));
    expect(await calcRiichiStat(repo, event)).not.toBe(first);
    expect(players).toHaveBeenCalledTimes(2);
  });

  it('returns empty rankings when source data cannot be loaded', async () => {
    const { event } = fixture();
    jest
      .spyOn(playerModel, 'findPlayersForEvents')
      .mockRejectedValue(new Error('storage unavailable'));
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(getMaxStolenRiichiBetsCount(event, repo)).resolves.toEqual([]);
    await expect(getMinLostRiichiBetsCount(event, repo)).resolves.toEqual([]);
    expect(error).toHaveBeenCalledTimes(2);
  });
});
