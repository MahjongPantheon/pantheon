import { GHOST_PLAYER_ID } from '../../../Common/constants.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionState } from './SessionState.js';
import { PointsCalc } from './PointsCalc.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { HandEntity } from '../entities/Hand.entity.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';

const scores = { 1: 35000, 2: 35000, 3: 35000 };
function round(outcome: RoundOutcome, hand: Partial<HandEntity>): RoundEntity {
  return Object.assign(new RoundEntity(), {
    outcome,
    riichi: [],
    hands: [Object.assign(new HandEntity(), hand)],
  });
}

describe('Sanma scoring and session state', () => {
  it.each([
    [1, 1, 30, { 1: 36000, 2: 34500, 3: 34500 }],
    [2, 1, 30, { 1: 34500, 2: 35800, 3: 34700 }],
    [1, 5, 0, { 1: 43000, 2: 31000, 3: 31000 }],
    [2, 5, 0, { 1: 31000, 2: 41000, 3: 33000 }],
  ])('scores tsumo for player %s (%s han, %s fu) with tsumo loss', (winner, han, fu, expected) => {
    const calc = new PointsCalc();
    const rules = RulesetEntity.createRuleset('sanma').rules;
    expect(calc.tsumo(rules, 1, scores, winner, han, fu, [], 0, 0)).toEqual(expected);
    expect(scores).toEqual({ 1: 35000, 2: 35000, 3: 35000 });
  });

  it('splits the full honba value between two payers', () => {
    const calc = new PointsCalc();
    const result = calc.tsumo(
      RulesetEntity.createRuleset('sanma').rules,
      1,
      scores,
      2,
      1,
      30,
      [3],
      2,
      1
    );
    expect(result).toEqual({ 1: 34200, 2: 38400, 3: 33400 });
    expect(calc.lastPaymentsInfo().honba).toEqual({ '2<-1': 300, '2<-3': 300 });
    expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(106000);
  });

  it.each([
    [[], { 1: 35000, 2: 35000, 3: 35000 }],
    [[1], { 1: 38000, 2: 33500, 3: 33500 }],
    [[1, 2], { 1: 36500, 2: 36500, 3: 32000 }],
    [[1, 2, 3], { 1: 35000, 2: 35000, 3: 35000 }],
  ])('scores exhaustive draw with tenpai %j', (tenpai, expected) => {
    expect(
      new PointsCalc().draw(scores, tenpai, [], RulesetEntity.createRuleset('sanma').rules)
    ).toEqual(expected);
  });

  it('uses custom draw and chombo payments', () => {
    const rules = RulesetEntity.createRuleset('sanma').rules;
    rules.sanmaDrawPayments = 4000;
    rules.extraChomboPayments = true;
    rules.sanmaChomboPayments = 4000;
    expect(new PointsCalc().draw(scores, [1], [], rules)).toEqual({ 1: 39000, 2: 33000, 3: 33000 });
    expect(new PointsCalc().chombo(rules, 1, 2, scores)).toEqual({ 1: 39000, 2: 27000, 3: 39000 });
  });

  it('scores nagashi without a ghost payment', () => {
    expect(new PointsCalc().nagashi(scores, 1, [], [2])).toEqual({ 1: 31000, 2: 41000, 3: 33000 });
    expect(new PointsCalc().nagashi(scores, 1, [], [1])).toEqual({ 1: 43000, 2: 31000, 3: 31000 });
    expect(() => new PointsCalc().nagashi(scores, 1, [], [1, 2, 3])).toThrow();
  });

  it.each([false, true])(
    'rotates three dealers and finishes at the correct wind (tonpuusen=%s)',
    (tonpuusen) => {
      const rules = RulesetEntity.createRuleset('sanma');
      rules.rules.tonpuusen = tonpuusen;
      const state = new SessionState(rules, [1, 2, 3, GHOST_PLAYER_ID]);
      expect(state.state.playerIds).toEqual([1, 2, 3]);
      expect(state.getScores()).toEqual(scores);
      const lastRound = tonpuusen ? 3 : 6;
      for (let i = 1; i <= lastRound; i++) {
        expect(state.isFinished()).toBe(false);
        expect(state.getCurrentDealer()).toBe(((i - 1) % 3) + 1);
        state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [] }));
      }
      expect(state.isFinished()).toBe(true);
      const resumed = new SessionState(rules, [1, 2, 3, GHOST_PLAYER_ID], state.state);
      expect(resumed.state).toEqual(state.state);
      expect(resumed.state).not.toBe(state.state);
    }
  );

  it('allows exactly one extra wind, with three hands', () => {
    const rules = RulesetEntity.createRuleset('sanma');
    rules.rules.playAdditionalRounds = true;
    const state = new SessionState(rules, [1, 2, 3]);
    for (let i = 1; i <= 9; i++) {
      expect(state.isFinished()).toBe(false);
      state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [] }));
    }
    expect(state.isFinished()).toBe(true);
  });

  it('rejects ghost participation without changing state', () => {
    const state = new SessionState(RulesetEntity.createRuleset('sanma'), [1, 2, 3]);
    const saved = state.state.clone();
    expect(() =>
      state.update(
        round(RoundOutcome.ROUND_OUTCOME_TSUMO, { winnerId: GHOST_PLAYER_ID, han: 1, fu: 30 })
      )
    ).toThrow('real players');
    expect(state.state).toEqual(saved);
  });

  it('uses three places for uma and oka, including tied scores', () => {
    const rules = RulesetEntity.createRuleset('sanma');
    expect(rules.getUma([45000, 35000, 25000])).toEqual([15000, 0, -15000]);
    expect(rules.getUma([40000, 40000, 25000])).toEqual([7500, 7500, -15000]);
    expect(rules.getUma([45000, 30000, 30000])).toEqual([15000, -7500, -7500]);
    expect(rules.getUma([35000, 35000, 35000])).toEqual([0, 0, 0]);
    rules.rules.oka = 15000;
    expect([1, 2, 3].map((place) => rules.getOka(place))).toEqual([10000, -5000, -5000]);
  });
});
