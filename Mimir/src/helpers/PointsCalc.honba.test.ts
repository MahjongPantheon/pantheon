import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { PointsCalc } from './PointsCalc.js';

it.each(['ema', 'sanma'] as const)('uses 100 points per opponent by default for %s', (preset) => {
  expect(RulesetEntity.createRuleset(preset).rules.honbaValuePerPlayer).toBe(100);
});

it.each(['ema', 'sanma'] as const)(
  'charges each tsumo payer independently and conserves points for %s',
  (preset) => {
    const rules = RulesetEntity.createRuleset(preset);
    const scores = Object.fromEntries(
      Array.from({ length: rules.playerCount }, (_, index) => [index + 1, 30000])
    );
    for (const value of [0, 100, 200]) {
      rules.rules.honbaValuePerPlayer = value;
      const calc = new PointsCalc();
      const result = calc.tsumo(rules.rules, 1, scores, 2, 1, 30, [], 2, 0);
      const base = new PointsCalc().tsumo(rules.rules, 1, scores, 2, 1, 30, [], 0, 0);
      for (const id of Object.keys(scores).map(Number)) {
        expect(result[id] - base[id]).toBe(
          id === 2 ? value * 2 * (rules.playerCount - 1) : 0 - value * 2
        );
        if (id !== 2) expect(calc.lastPaymentsInfo().honba[`2<-${id}`]).toBe(value * 2);
      }
      expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(30000 * rules.playerCount);
    }
  }
);

it.each(['ema', 'sanma'] as const)(
  'charges all honba shares to the ron discarder for %s',
  (preset) => {
    const rules = RulesetEntity.createRuleset(preset);
    const scores = Object.fromEntries(
      Array.from({ length: rules.playerCount }, (_, index) => [index + 1, 30000])
    );
    const calc = new PointsCalc();
    const result = calc.ron(rules.rules, false, scores, 2, 1, 1, 30, [], 2, 0);
    const payment = 200 * (rules.playerCount - 1);
    expect(calc.lastPaymentsInfo().honba).toEqual({ '2<-1': payment });
    expect(result[1]).toBe(30000 - 1000 - payment);
    expect(result[2]).toBe(30000 + 1000 + payment);

    calc.tsumo(rules.rules, 1, scores, 2, -1, 0, [], 2, 0, 3);
    expect(calc.lastPaymentsInfo().honba).toEqual({ '2<-3': payment });
  }
);
