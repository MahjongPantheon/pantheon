import { PointsCalc } from './PointsCalc.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';

const scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
it.each([
  [false, -1, 32000, -16000, -16000],
  [false, -2, 64000, -48000, -16000],
  [true, -2, 96000, -72000, -24000],
] as const)('splits pao liability for dealer=%s and han=%s', (dealer, han, winner, loser, pao) => {
  const rules = RulesetEntity.createRuleset('ema').rules;
  const result = new PointsCalc().ron(rules, dealer, scores, 1, 2, han, 0, [], 0, 0, 3);
  expect(result).toEqual({ 1: winner, 2: loser, 3: pao, 4: 0 });
  expect(scores).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0 });
});
it.each([
  [3, 60, false, 7700],
  [3, 60, true, 8000],
  [4, 30, false, 7700],
  [4, 30, true, 8000],
  [3, 30, true, 3900],
] as const)(
  'applies kiriage=%s only at the supported han/fu boundaries',
  (han, fu, kiriage, expected) => {
    const rules = RulesetEntity.createRuleset('ema').rules;
    rules.withKiriageMangan = kiriage;
    expect(new PointsCalc().ron(rules, false, scores, 1, 2, han, fu, [], 0, 0)[1]).toBe(expected);
  }
);
it('rejects missing winners, losers and four simultaneous nagashi winners', () => {
  const rules = RulesetEntity.createRuleset('ema').rules;
  expect(() => new PointsCalc().ron(rules, false, scores, 0, 2, 1, 30, [], 0, 0)).toThrow(
    'winner and loser'
  );
  expect(() => new PointsCalc().ron(rules, false, scores, 1, 0, 1, 30, [], 0, 0)).toThrow(
    'winner and loser'
  );
  expect(() => new PointsCalc().tsumo(rules, 1, scores, 0, 1, 30, [], 0, 0)).toThrow('winner');
  expect(() => new PointsCalc().chombo(rules, 1, 0, scores)).toThrow('loser');
  expect(() => new PointsCalc().nagashi(scores, 1, [], [1, 2, 3, 4])).toThrow('More than 3');
});
