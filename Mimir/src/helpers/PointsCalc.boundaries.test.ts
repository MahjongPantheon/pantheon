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

it('combines reverse-mangan payments for every chombo player without changing the input', () => {
  const rules = RulesetEntity.createRuleset('ema').rules;
  rules.extraChomboPayments = true;
  const original = { 1: 30000, 2: 30000, 3: 30000, 4: 30000 };
  const calc = new PointsCalc();
  expect(calc.chomboForPlayers(rules, 1, [1, 2], original)).toEqual({
    1: 22000,
    2: 26000,
    3: 36000,
    4: 36000,
  });
  expect(calc.lastPaymentsInfo().direct).toEqual({
    '3<-1': 4000,
    '4<-1': 4000,
    '3<-2': 2000,
    '4<-2': 2000,
  });
  expect(original).toEqual({ 1: 30000, 2: 30000, 3: 30000, 4: 30000 });
  expect(() => calc.chomboForPlayers(rules, 1, [1, 1], original)).toThrow('distinct');
});

it.each([
  { losers: [2, 3], direct: { '1<-2': 4000, '4<-2': 2000, '1<-3': 4000, '4<-3': 2000 } },
  { losers: [1, 2, 3], direct: { '4<-1': 4000, '4<-2': 2000, '4<-3': 2000 } },
  { losers: [1, 2, 3, 4], direct: {} },
  { losers: [2], direct: { '1<-2': 4000, '3<-2': 2000, '4<-2': 2000 } },
])('shows only outstanding chombo transfers for $losers', ({ losers, direct }) => {
  const rules = RulesetEntity.createRuleset('ema').rules;
  rules.extraChomboPayments = true;
  const initial = { 1: 30000, 2: 30000, 3: 30000, 4: 30000 };
  const calc = new PointsCalc();
  const final = calc.chomboForPlayers(rules, 1, losers, initial);
  expect(calc.lastPaymentsInfo().direct).toEqual(direct);
  // Following the displayed transfers must reproduce the calculated scores.
  const transferred: Record<number, number> = { ...initial };
  for (const [key, amount] of Object.entries(calc.lastPaymentsInfo().direct)) {
    const [recipient, payer] = key.split('<-').map(Number);
    transferred[recipient] += amount;
    transferred[payer] -= amount;
  }
  expect(transferred).toEqual(final);
});

it.each([6000, 2500])('cancels simultaneous sanma chombo transfers at %i points', (payment) => {
  const rules = RulesetEntity.createRuleset('sanma').rules;
  rules.extraChomboPayments = true;
  rules.sanmaChomboPayments = payment;
  const initial = { 1: 35000, 2: 35000, 3: 35000 };
  const calc = new PointsCalc();
  expect(calc.chomboForPlayers(rules, 1, [1, 2], initial)).toEqual({
    1: 35000 - payment,
    2: 35000 - payment,
    3: 35000 + 2 * payment,
  });
  expect(calc.lastPaymentsInfo().direct).toEqual({ '3<-1': payment, '3<-2': payment });
  expect(calc.chomboForPlayers(rules, 1, [1, 2, 3], initial)).toEqual(initial);
  expect(calc.lastPaymentsInfo().direct).toEqual({});
});
