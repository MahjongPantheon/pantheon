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
import { calcRiichiStat } from './helpers/getRiichiStat.js';
import { getMaxStolenRiichiBetsCount } from './maxStolenRiichiBetsCount.js';
import { getMinLostRiichiBetsCount } from './minLostRiichiBetsCount.js';
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

  it('selects tied maximum tsumo counts within a single session rather than event totals', async () => {
    const { event, session: first } = fixture();
    const second = Object.assign(new SessionEntity(), { id: ++fixtureId });
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
    });
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
