import { correctSessionSeating } from './correctSessionSeating.js';
import { SessionState } from './SessionState.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { EventEntity } from '../entities/Event.entity.js';
import { roundFixtures } from '../tests/roundFixtures.js';
import { Round, RonResult, TsumoResult } from 'tsclients/proto/atoms.pb.js';

function fixture(data: Round[] = roundFixtures.map(([, round]) => round), sanma = false) {
  const ruleset = RulesetEntity.createRuleset(sanma ? 'sanma' : 'ema');
  if (!sanma) ruleset.rules.startPoints = 25000;
  ruleset.rules.withAbortives = true;
  ruleset.rules.withTobi = false;
  ruleset.rules.withLeadingDealerGameOver = false;
  const players = sanma ? [1, 2, 3] : [1, 2, 3, 4];
  const state = new SessionState(ruleset, players);
  // Preserve the seed snapshot, including nondefault history and ancillary state.
  state.state.honba = 2;
  state.state.chips = { 1: 3 };
  state.state.replacements = { 2: 20 };
  const rounds = data.map((round, index) => {
    const entity = RoundEntity.fromMessage(
      new SessionEntity(),
      new EventEntity(),
      round,
      state.state.clone()
    );
    entity.id = index + 10;
    entity.round = state.getRound();
    entity.honba = state.getHonba();
    state.update(entity);
    if (index === 0) state.state.lastHandStarted = true;
    return entity;
  });
  return { ruleset, players, rounds, current: state.state };
}

it.each(roundFixtures)('recalculates %s without modifying its saved outcome', (_name, round) => {
  const f = fixture([round]);
  const before = structuredClone(f.rounds);
  const replay = correctSessionSeating(f.ruleset, f.current, f.rounds, [2, 1, 3, 4]);
  const expected = new SessionState(f.ruleset, [2, 1, 3, 4], f.rounds[0].lastSessionState);
  expected.state.playerIds = [2, 1, 3, 4];
  expected.update(f.rounds[0]);
  expected.state.lastHandStarted = true;
  expect(replay.state).toEqual(expected.state);
  expect(structuredClone(f.rounds)).toEqual(before);
  expect(replay.snapshots[0].chips).toEqual({ 1: 3 });
  expect(replay.snapshots[0].replacements).toEqual({ 2: 20 });
});

it('changes dealer payments/progression and remains deterministic across repeated corrections', () => {
  const f = fixture([roundFixtures[0][1], roundFixtures[1][1]]);
  const first = correctSessionSeating(f.ruleset, f.current, f.rounds, [2, 1, 3, 4]);
  expect(first.state.scores).not.toEqual(f.current.scores);
  expect(first.snapshots[1].round).toBe(1);
  expect(first.snapshots[1].honba).toBe(3);
  const changed = f.rounds.map((round, index) =>
    Object.assign(new RoundEntity(), round, { lastSessionState: first.snapshots[index] })
  );
  expect(correctSessionSeating(f.ruleset, first.state, changed, [2, 1, 3, 4])).toEqual(first);
  const restored = correctSessionSeating(f.ruleset, first.state, changed, f.players);
  expect(restored.state).toEqual(f.current);
});

it('preserves each historical timer decision without reading the clock', () => {
  const f = fixture([roundFixtures[0][1], roundFixtures[2][1]]);
  const now = vi.spyOn(Date, 'now').mockImplementation(() => {
    throw new Error('Clock read');
  });
  try {
    const result = correctSessionSeating(f.ruleset, f.current, f.rounds, [2, 1, 3, 4]);
    expect(result.snapshots[0].lastHandStarted).toBeUndefined();
    expect(result.snapshots[1].lastHandStarted).toBe(true);
    expect(result.state.lastHandStarted).toBe(true);
  } finally {
    now.mockRestore();
  }
});

it('supports sanma with exactly three real seats', () => {
  const f = fixture([roundFixtures[0][1]], true);
  const result = correctSessionSeating(f.ruleset, f.current, f.rounds, [2, 3, 1]);
  expect(result.state.playerIds).toEqual([2, 3, 1]);
  expect(Object.keys(result.state.scores)).toHaveLength(3);
});

it('rejects missing snapshots and histories that would end, before or at the final hand', () => {
  const f = fixture([roundFixtures[0][1], roundFixtures[2][1]]);
  f.rounds[0].lastSessionState = undefined;
  expect(() => correctSessionSeating(f.ruleset, f.current, f.rounds, f.players)).toThrow('saved');
  const final = fixture([roundFixtures[0][1]]);
  final.current.prematurelyFinished = true;
  expect(() =>
    correctSessionSeating(final.ruleset, final.current, final.rounds, final.players)
  ).toThrow('ending condition');
  const early = fixture([roundFixtures[0][1], roundFixtures[2][1]]);
  early.rounds[1].lastSessionState!.prematurelyFinished = true;
  expect(() =>
    correctSessionSeating(early.ruleset, early.current, early.rounds, early.players)
  ).toThrow('ending condition');
});

it('supports empty histories and rejects a natural terminal state', () => {
  const f = fixture([]);
  expect(correctSessionSeating(f.ruleset, f.current, [], [2, 1, 3, 4]).state.scores).toEqual(
    f.current.scores
  );
  f.current.round = 13;
  expect(() => correctSessionSeating(f.ruleset, f.current, [], f.players)).toThrow(
    'ending condition'
  );
});

it('assigns the carried riichi pot to the nearest winner in the corrected ring', () => {
  const f = fixture([]);
  f.current.honba = 0;
  f.current.riichiBets = 2;
  f.current.scores[3] = 23000;
  const round = RoundEntity.fromMessage(
    new SessionEntity(),
    new EventEntity(),
    {
      multiron: {
        roundIndex: 1,
        honba: 0,
        riichiBets: [],
        loserId: 1,
        multiRon: 2,
        wins: [2, 4].map((winnerId) =>
          RonResult.initialize({ winnerId, loserId: 1, han: 1, fu: 30, yaku: [8] })
        ),
      },
    },
    f.current.clone()
  );
  const old = new SessionState(f.ruleset, f.players, f.current);
  old.update(round);
  expect(old.getScores()).toEqual({ 1: 23000, 2: 28000, 3: 23000, 4: 26000 });
  const corrected = correctSessionSeating(f.ruleset, old.state, [round], [1, 4, 3, 2]);
  expect(corrected.state.scores).toEqual({ 1: 23000, 2: 26000, 3: 23000, 4: 28000 });
  expect(corrected.state.riichiBets).toBe(0);
});

it('recalculates a sanma mangan tsumo when the winner becomes dealer', () => {
  const f = fixture([], true);
  f.current.honba = 0;
  const round = RoundEntity.fromMessage(
    new SessionEntity(),
    new EventEntity(),
    {
      tsumo: TsumoResult.initialize({ winnerId: 2, han: 5, fu: 30, yaku: [8], roundIndex: 1 }),
    },
    f.current.clone()
  );
  const old = new SessionState(f.ruleset, f.players, f.current);
  old.update(round);
  expect(old.getScores()).toEqual({ 1: 31000, 2: 41000, 3: 33000 });
  const corrected = correctSessionSeating(f.ruleset, old.state, [round], [2, 1, 3]);
  expect(corrected.state.scores).toEqual({ 1: 31000, 2: 43000, 3: 31000 });
  expect(corrected.state.round).toBe(1);
  expect(corrected.state.honba).toBe(1);
});

it('rotates a corrected noten dealer and retains original yakitori flags', () => {
  const f = fixture([]);
  f.ruleset.rules.withYakitori = true;
  f.current.yakitori = { 1: true, 2: true, 3: false, 4: true };
  const round = RoundEntity.fromMessage(
    new SessionEntity(),
    new EventEntity(),
    {
      draw: { roundIndex: 1, honba: 2, riichiBets: [], tempai: [1] },
    },
    f.current.clone()
  );
  const old = new SessionState(f.ruleset, f.players, f.current);
  old.update(round);
  expect(old.getRound()).toBe(1);
  const corrected = correctSessionSeating(f.ruleset, old.state, [round], [2, 1, 3, 4]);
  expect(corrected.state.scores).toEqual({ 1: 28000, 2: 24000, 3: 24000, 4: 24000 });
  expect(corrected.state.round).toBe(2);
  expect(corrected.state.honba).toBe(3);
  expect(corrected.state.roundJustChanged).toBe(true);
  expect(corrected.state.yakitori).toEqual({ 1: true, 2: true, 3: false, 4: true });
});

it.each([false, true])('rejects a corrected tobi ending with more recorded hands=%s', (more) => {
  const f = fixture([]);
  f.ruleset.rules.withTobi = true;
  f.current.honba = 0;
  f.current.scores[3] = 1200;
  const original = new SessionState(f.ruleset, f.players, f.current);
  const first = RoundEntity.fromMessage(
    new SessionEntity(),
    new EventEntity(),
    {
      ron: RonResult.initialize({
        winnerId: 2,
        loserId: 3,
        han: 1,
        fu: 30,
        yaku: [8],
        roundIndex: 1,
      }),
    },
    original.state.clone()
  );
  original.update(first);
  expect(original.isFinished()).toBe(false);
  const rounds = [first];
  if (more) {
    const second = RoundEntity.fromMessage(
      new SessionEntity(),
      new EventEntity(),
      {
        abort: { roundIndex: 2, honba: 0, riichiBets: [] },
      },
      original.state.clone()
    );
    rounds.push(second);
    original.update(second);
  }
  const before = structuredClone(rounds);
  expect(() => correctSessionSeating(f.ruleset, original.state, rounds, [2, 1, 3, 4])).toThrow(
    'ending condition'
  );
  expect(structuredClone(rounds)).toEqual(before);
});
