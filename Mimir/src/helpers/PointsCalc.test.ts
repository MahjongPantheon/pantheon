import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { PointsCalc } from './PointsCalc.js';

describe('PointsCalc', () => {
  it('should calculate basic ron', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        2, // han
        50, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 3200, 2: 0, 3: -3200, 4: 0 });
  });

  it('should calculate basic dealer ron', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        2, // han
        50, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 4800, 2: 0, 3: -4800, 4: 0 });
  });

  it('should calculate limit ron', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        4, // han
        20, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 5200, 2: 0, 3: -5200, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        4, // han
        30, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 7700, 2: 0, 3: -7700, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        4, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 8000, 2: 0, 3: -8000, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        6, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 12000, 2: 0, 3: -12000, 4: 0 });
  });

  it('should calculate RonKiriage', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    ruleset.rules.withKiriageMangan = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        4, // han
        30, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 8000, 2: 0, 3: -8000, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        3, // han
        60, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 8000, 2: 0, 3: -8000, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        4, // han
        30, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 12000, 2: 0, 3: -12000, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        3, // han
        60, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 12000, 2: 0, 3: -12000, 4: 0 });
  });

  it('should calculate RonLimitDealer', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        4, // han
        20, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 7700, 2: 0, 3: -7700, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        4, // han
        30, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 11600, 2: 0, 3: -11600, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        4, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 12000, 2: 0, 3: -12000, 4: 0 });

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        6, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 18000, 2: 0, 3: -18000, 4: 0 });
  });

  it('should calculate Kazoe', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        14, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 32000, 2: 0, 3: -32000, 4: 0 });

    ruleset.rules.withKazoe = false;

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        14, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 24000, 2: 0, 3: -24000, 4: 0 });
  });

  it('should calculate TsumoBasic', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        1, // dealer id
        currentScores,
        2, // winner id
        2, // han
        50, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: -1600, 2: 3200, 3: -800, 4: -800 });
  });

  it('should calculate TsumoDealer', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        1, // dealer id
        currentScores,
        1, // winner id
        2, // han
        50, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 4800, 2: -1600, 3: -1600, 4: -1600 });
  });

  it('should calculate TsumoLimit', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        2, // dealer
        currentScores,
        1, // winner id
        4, // han
        20, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 5200, 2: -2600, 3: -1300, 4: -1300 });

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        2, // dealer
        currentScores,
        1, // winner id
        4, // han
        30, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 7900, 2: -3900, 3: -2000, 4: -2000 });

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        2, // dealer
        currentScores,
        1, // winner id
        4, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 8000, 2: -4000, 3: -2000, 4: -2000 });

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        2, // dealer
        currentScores,
        1, // winner id
        6, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 12000, 2: -6000, 3: -3000, 4: -3000 });
  });

  it('should calculate TsumoKiriage', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    ruleset.rules.withKiriageMangan = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        2, // dealer
        currentScores,
        1, // winner id
        4, // han
        30, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 8000, 2: -4000, 3: -2000, 4: -2000 });

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        2, // dealer
        currentScores,
        1, // winner id
        3, // han
        60, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 8000, 2: -4000, 3: -2000, 4: -2000 });

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        1, // dealer
        currentScores,
        1, // winner id
        4, // han
        30, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 12000, 2: -4000, 3: -4000, 4: -4000 });

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        1, // dealer
        currentScores,
        1, // winner id
        3, // han
        60, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 12000, 2: -4000, 3: -4000, 4: -4000 });
  });

  it('should calculate Draw', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(new PointsCalc().draw(currentScores, [], [])).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0 });

    expect(new PointsCalc().draw(currentScores, [1], [])).toEqual({
      1: 3000,
      2: -1000,
      3: -1000,
      4: -1000,
    });

    expect(new PointsCalc().draw(currentScores, [1, 3], [])).toEqual({
      1: 1500,
      2: -1500,
      3: 1500,
      4: -1500,
    });

    expect(new PointsCalc().draw(currentScores, [1, 3, 4], [])).toEqual({
      1: 1000,
      2: -3000,
      3: 1000,
      4: 1000,
    });

    expect(new PointsCalc().draw(currentScores, [1, 2, 3, 4], [1, 2, 4])).toEqual({
      1: -1000,
      2: -1000,
      3: 0,
      4: -1000,
    });
  });

  it('should calculate Abort', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(new PointsCalc().abort(currentScores, [1, 2, 4])).toEqual({
      1: -1000,
      2: -1000,
      3: 0,
      4: -1000,
    });
  });

  it('should calculate Chombo', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };
    ruleset.rules.extraChomboPayments = false;

    expect(new PointsCalc().chombo(ruleset.rules, 1, 2, currentScores)).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });

    expect(new PointsCalc().chombo(ruleset.rules, 1, 1, currentScores)).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });

    ruleset.rules.extraChomboPayments = true;

    expect(new PointsCalc().chombo(ruleset.rules, 1, 2, currentScores)).toEqual({
      1: 4000,
      2: -8000,
      3: 2000,
      4: 2000,
    });

    expect(new PointsCalc().chombo(ruleset.rules, 1, 1, currentScores)).toEqual({
      1: -12000,
      2: 4000,
      3: 4000,
      4: 4000,
    });
  });

  it('should calculate Honba', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        6, // han
        40, // fu
        [], // riichi list
        3, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 18900, 2: 0, 3: -18900, 4: 0 });

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        1, // dealer
        currentScores,
        1, // winner id
        5, // han
        30, // fu
        [], // riichi list
        4, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 13200, 2: -4400, 3: -4400, 4: -4400 });
  });

  it('should calculate RiichiBets', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        true, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        6, // han
        40, // fu
        [], // riichi list
        0, // honba
        3, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 21000, 2: 0, 3: -18000, 4: 0 });

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        1, // dealer
        currentScores,
        1, // winner id
        5, // han
        30, // fu
        [], // riichi list
        0, // honba
        4, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 16000, 2: -4000, 3: -4000, 4: -4000 });
  });

  it('should calculate Yakuman', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        3, // loser id
        -1, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        null // pao player id
      )
    ).toEqual({ 1: 32000, 2: 0, 3: -32000, 4: 0 });
  });

  it('should calculate PaoTsumo', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().tsumo(
        ruleset.rules,
        2, // dealer
        currentScores,
        1, // winner id
        -1, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        3 // pao player id
      )
    ).toEqual({ 1: 32000, 2: 0, 3: -32000, 4: 0 });
  });

  it('should calculate PaoRon', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(
      new PointsCalc().ron(
        ruleset.rules,
        false, // dealer
        currentScores,
        1, // winner id
        2, // loser id
        -1, // han
        40, // fu
        [], // riichi list
        0, // honba
        0, // riichi bets count
        3 // pao player id
      )
    ).toEqual({ 1: 32000, 2: -16000, 3: -16000, 4: 0 });
  });

  it('should calculate Nagashi', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(new PointsCalc().nagashi(currentScores, 1, [], [1])).toEqual({
      1: 12000,
      2: -4000,
      3: -4000,
      4: -4000,
    });

    expect(new PointsCalc().nagashi(currentScores, 1, [3, 4], [1])).toEqual({
      1: 12000,
      2: -4000,
      3: -5000,
      4: -5000,
    });

    expect(new PointsCalc().nagashi(currentScores, 1, [], [2])).toEqual({
      1: -4000,
      2: 8000,
      3: -2000,
      4: -2000,
    });

    expect(new PointsCalc().nagashi(currentScores, 1, [4], [2])).toEqual({
      1: -4000,
      2: 8000,
      3: -2000,
      4: -3000,
    });
  });

  it('should calculate NagashiMultiple', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const currentScores = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    expect(new PointsCalc().nagashi(currentScores, 1, [], [1, 2])).toEqual({
      1: 8000,
      2: 4000,
      3: -6000,
      4: -6000,
    });

    expect(new PointsCalc().nagashi(currentScores, 1, [2, 4], [1, 2])).toEqual({
      1: 8000,
      2: 3000,
      3: -6000,
      4: -7000,
    });

    expect(new PointsCalc().nagashi(currentScores, 1, [], [2, 3])).toEqual({
      1: -8000,
      2: 6000,
      3: 6000,
      4: -4000,
    });

    expect(new PointsCalc().nagashi(currentScores, 1, [1, 4], [2, 3])).toEqual({
      1: -9000,
      2: 6000,
      3: 6000,
      4: -5000,
    });

    expect(new PointsCalc().nagashi(currentScores, 1, [], [1, 2, 3])).toEqual({
      1: 4000,
      2: 2000,
      3: 2000,
      4: -8000,
    });

    expect(new PointsCalc().nagashi(currentScores, 1, [], [2, 3, 4])).toEqual({
      1: -12000,
      2: 4000,
      3: 4000,
      4: 4000,
    });
  });
});
