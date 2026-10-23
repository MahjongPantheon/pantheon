import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { EventEntity } from '../entities/Event.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { SessionState } from './SessionState.js';
import { repairedRiichiScores } from './repairRiichiScores.js';

function fixture(scores: number[], bets = 1) {
  const ruleset = RulesetEntity.createRuleset('ema');
  const state = new SessionState(ruleset, [1, 2, 3, 4]);
  state.setScores(Object.fromEntries(scores.map((score, index) => [index + 1, score])));
  state.state.riichiBets = bets;
  const round = RoundEntity.fromMessage(
    { id: 1 } as SessionEntity,
    { id: 1 } as EventEntity,
    { draw: { roundIndex: 8, honba: 0, riichiBets: [], tempai: [] } },
    state.state.clone()
  );
  state.update(round);
  return { ruleset, saved: state.state, round };
}

describe('riichi snapshot repair', () => {
  it('replaces the old payout and is safe to repeat', () => {
    const { ruleset, saved, round } = fixture([20000, 20000, 40000, 39000]);
    saved.scores = { 1: 20000, 2: 20000, 3: 40500, 4: 39500 };
    const before = structuredClone(saved);
    const expected = { 1: 20000, 2: 20000, 3: 41000, 4: 39000 };
    expect(repairedRiichiScores(ruleset, saved, round)).toEqual(expected);
    expect(saved).toEqual(before);
    saved.scores = expected;
    expect(repairedRiichiScores(ruleset, saved, round)).toEqual(expected);
  });

  it('splits between tied leaders even when the old payout broke the tie', () => {
    const { ruleset, saved, round } = fixture([10000, 49000, 49000, 10000], 2);
    saved.scores[2] += 2000;
    expect(repairedRiichiScores(ruleset, saved, round)).toEqual({
      1: 10000,
      2: 50000,
      3: 50000,
      4: 10000,
    });
  });

  it('includes riichi declared in the final draw and its noten payments', () => {
    const { ruleset, saved, round } = fixture([30000, 30000, 30000, 30000], 0);
    round.riichi = [2];
    round.hands[0].tempai = [2];
    saved.riichiBets = 1;
    expect(repairedRiichiScores(ruleset, saved, round)).toEqual({
      1: 29000,
      2: 33000,
      3: 29000,
      4: 29000,
    });
  });

  it.each([
    { scores: [29750, 29750, 29750, 29750], expected: [30000, 30000, 30000, 30000] },
    { scores: [17000, 34000, 34000, 34000], expected: [17000, 34333, 34333, 34333] },
  ])('uses whole point shares for $scores', ({ scores, expected }) => {
    const { ruleset, saved, round } = fixture(scores);
    expect(Object.values(repairedRiichiScores(ruleset, saved, round))).toEqual(expected);
  });

  it('preserves scores when disabled or when there is no pot', () => {
    const { ruleset, saved, round } = fixture([30000, 30000, 30000, 30000], 0);
    saved.scores[1] += 500;
    expect(repairedRiichiScores(ruleset, saved, round)).toEqual(saved.scores);
    ruleset.rules.riichiGoesToWinner = false;
    saved.riichiBets = 1;
    expect(repairedRiichiScores(ruleset, saved, round)).toEqual(saved.scores);
  });

  it('rejects snapshots that cannot be reconstructed reliably', () => {
    const { ruleset, saved, round } = fixture([30000, 30000, 30000, 30000]);
    saved.riichiBets = 2;
    expect(() => repairedRiichiScores(ruleset, saved, round)).toThrow('riichi pot differs');
    round.lastSessionState = undefined;
    expect(() => repairedRiichiScores(ruleset, saved, round)).toThrow('no saved starting state');
  });
});
