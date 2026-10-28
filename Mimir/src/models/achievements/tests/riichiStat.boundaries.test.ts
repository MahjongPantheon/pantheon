import { calcRiichiStat } from '../helpers/getRiichiStat.js';
import { getGamesOfEvent } from '../helpers/getGamesOfEvent.js';
import { getRoundsOfSessions } from '../helpers/getRoundsOfSessions.js';
import { Model } from '../../Model.js';
import { PlayerModel } from '../../PlayerModel.js';
import { Repository } from '../../../services/Repository.js';
import { EventEntity } from '../../../entities/Event.entity.js';
import { RulesetEntity } from '../../../entities/Ruleset.entity.js';
import { SessionEntity } from '../../../entities/Session.entity.js';
import { SessionResultsEntity } from '../../../entities/SessionResults.entity.js';
import { RoundEntity } from '../../../entities/Round.entity.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';

vi.mock('../helpers/getGamesOfEvent.js', () => ({ getGamesOfEvent: vi.fn() }));
vi.mock('../helpers/getRoundsOfSessions.js', () => ({ getRoundsOfSessions: vi.fn() }));
const repo = {} as Repository;
let event: EventEntity;
let session: SessionEntity;
let nextEvent = 10000;
beforeEach(() => {
  event = Object.assign(new EventEntity(), {
    id: nextEvent++,
    ruleset: RulesetEntity.createRuleset('ema'),
  });
  session = Object.assign(new SessionEntity(), {
    id: 10,
    players: [1, 2, 3, 4].map((playerId, order) => ({ playerId, order })),
  });
  const players = {
    findPlayersForEvents: vi
      .fn()
      .mockResolvedValue({ players: [1, 2, 3, 4, 5].map((id) => ({ id })) }),
  };
  const results = { findBySession: vi.fn().mockResolvedValue([]) };
  vi.spyOn(Model, 'getModel').mockImplementation(
    (_repo, model) => (model === PlayerModel ? players : results) as unknown as Model
  );
  vi.mocked(getGamesOfEvent).mockResolvedValue([session]);
  vi.mocked(getRoundsOfSessions).mockResolvedValue({});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('ignores players with no games and expires the two-minute calculation cache', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  const first = await calcRiichiStat(repo, event);
  expect([...first.data.keys()]).toEqual([1, 2, 3, 4]);
  expect(await calcRiichiStat(repo, event)).toBe(first);
  vi.setSystemTime(new Date('2026-01-01T00:02:01Z'));
  expect(await calcRiichiStat(repo, event)).not.toBe(first);
});

it.each([RoundOutcome.ROUND_OUTCOME_RON, RoundOutcome.ROUND_OUTCOME_TSUMO])(
  'counts known riichi winners and table bets for %s',
  async (outcome) => {
    vi.mocked(getRoundsOfSessions).mockResolvedValue({
      10: [
        Object.assign(new RoundEntity(), {
          outcome,
          riichi: [1, 9],
          hands: [{ winnerId: 1 }],
          lastSessionState: { riichiBets: 2 },
        }),
        Object.assign(new RoundEntity(), { outcome, riichi: [1, 9], hands: [{ winnerId: 9 }] }),
      ],
    });
    const stat = await calcRiichiStat(repo, event);
    expect(stat.data.get(1)).toEqual({ playerId: 1, won: 1, lost: 1, stole: 3 });
    expect(stat.data.has(9)).toBe(false);
  }
);

it.each([RoundOutcome.ROUND_OUTCOME_DRAW, RoundOutcome.ROUND_OUTCOME_ABORT])(
  'counts lost bets for known players after %s',
  async (outcome) => {
    vi.mocked(getRoundsOfSessions).mockResolvedValue({
      10: [
        Object.assign(new RoundEntity(), { outcome, riichi: [1, 9] }),
        Object.assign(new RoundEntity(), { outcome }),
      ],
    });
    const stat = await calcRiichiStat(repo, event);
    expect(stat.data.get(1)).toEqual({ playerId: 1, won: 0, lost: 1, stole: 0 });
  }
);

it.each([false, true])(
  'allocates double-ron bets using the configured head-bump rule (%s)',
  async (atamahane) => {
    event.ruleset.rules.doubleronRiichiAtamahane = atamahane;
    vi.mocked(getRoundsOfSessions).mockResolvedValue({
      10: [
        Object.assign(new RoundEntity(), {
          outcome: RoundOutcome.ROUND_OUTCOME_MULTIRON,
          riichi: [1, 2, 4, 9],
          hands: [
            { winnerId: 1, loserId: 3 },
            { winnerId: 2, loserId: 3 },
          ],
        }),
      ],
    });
    const stat = await calcRiichiStat(repo, event);
    expect(stat.data.get(1)?.won).toBe(1);
    expect(stat.data.get(2)?.won).toBe(atamahane ? 0 : 1);
    expect(stat.data.get(2)?.lost).toBe(atamahane ? 1 : 0);
    expect(stat.data.get(4)?.lost).toBe(1);
    expect(stat.data.has(9)).toBe(false);
  }
);

it('counts remaining table bets for the first place only when the player exists', async () => {
  event.ruleset.rules.riichiGoesToWinner = true;
  const results = {
    findBySession: vi
      .fn()
      .mockResolvedValue([
        Object.assign(new SessionResultsEntity(), { session, playerId: 1, place: 1 }),
      ]),
  };
  vi.mocked(Model.getModel).mockImplementation(
    (_repo, model) =>
      (model === PlayerModel
        ? { findPlayersForEvents: async () => ({ players: [{ id: 1 }] }) }
        : results) as unknown as Model
  );
  const stat = await calcRiichiStat(repo, event);
  expect(stat.data.get(1)?.stole).toBe(0);
});
