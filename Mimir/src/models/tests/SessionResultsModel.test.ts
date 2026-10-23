import { SessionResultsModel } from '../SessionResultsModel.js';
import { Model } from '../Model.js';
import { Repository } from '../../services/Repository.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { init } from '../../tests/initOrm.js';
import { RulesetConfig } from 'tsclients/proto/atoms.pb.js';

const orm = await init();
describe('SessionResults', () => {
  const repo = Repository.instance({}, orm);
  const mdl = Model.getModel(repo, SessionResultsModel);

  afterAll(async () => {
    await repo.destroy();
  });

  it('should calculate places map', () => {
    const scores = {
      1: 100000,
      2: 90000,
      12: -10000,
      6: 50000,
      7: 40000,
      8: 30000,
      9: 20000,
      5: 60000,
      3: 80000,
      10: 10000,
      4: 70000,
      11: 0,
    };
    expect(mdl.calcPlacesMap(scores)).toEqual({
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      11: 11,
      12: 12,
    });
  });

  it.each([
    {
      name: 'a sole winner outside the first seat',
      scores: [20000, 20000, 40000, 39000],
      bets: 1,
      expected: [20000, 20000, 41000, 39000],
    },
    {
      name: 'two winners outside the first seat',
      scores: [10000, 49000, 49000, 10000],
      bets: 2,
      expected: [10000, 50000, 50000, 10000],
    },
    {
      name: 'three winners outside the first seat',
      scores: [18000, 33000, 33000, 33000],
      bets: 3,
      expected: [18000, 34000, 34000, 34000],
    },
    {
      name: 'four winners sharing a single bet',
      scores: [29750, 29750, 29750, 29750],
      bets: 1,
      expected: [30000, 30000, 30000, 30000],
    },
    {
      name: 'three winners sharing an indivisible pot in whole points',
      scores: [17000, 34000, 34000, 34000],
      bets: 1,
      expected: [17000, 34333, 34333, 34333],
      total: 119999,
    },
    {
      name: 'no leftover bets',
      scores: [20000, 20000, 40000, 40000],
      bets: 0,
      expected: [20000, 20000, 40000, 40000],
    },
  ])('awards leftover riichi to $name', ({ scores, bets, expected, total = 120000 }) => {
    const playerIds = [12, 4, 9, 2];
    const ruleset = RulesetEntity.createRuleset('ema');
    const state = new SessionState(ruleset, playerIds);
    state.setScores(Object.fromEntries(playerIds.map((id, index) => [id, scores[index]])));
    state.state.riichiBets = bets;

    const results = mdl.getUnfinishedSessionResults(ruleset, 19, 501, state, playerIds);

    expect(results.map((result) => result.score)).toEqual(expected);
    expect(results.reduce((sum, result) => sum + result.score, 0)).toBe(total);
    expect(results.reduce((sum, result) => sum + result.ratingDelta, 0)).toBe(total - 120000);
  });

  it('does not award leftover riichi when the setting is disabled', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.riichiGoesToWinner = false;
    const playerIds = [1, 2, 3, 4];
    const state = new SessionState(ruleset, playerIds);
    state.setScores({ 1: 20000, 2: 49000, 3: 49000, 4: 20000 });
    state.state.riichiBets = 2;

    const results = mdl.getUnfinishedSessionResults(ruleset, 19, 501, state, playerIds);

    expect(results.map((result) => result.score)).toEqual([20000, 49000, 49000, 20000]);
  });

  it('should calculate rating delta', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    const scores = {
      1: 100000,
      2: 90000,
      3: -10000,
      4: 50000,
    };
    const placesMap = {
      1: 1,
      2: 2,
      3: 4,
      4: 3,
    };
    const replacements = {
      3: 13,
    };
    const expected = {
      1: 100000 - 30000 + 15000,
      2: 90000 - 30000 + 5000,
      3: -30000, // replacement
      4: 50000 - 30000 - 5000,
    };
    expect(mdl.calcRatingDelta([1, 2, 3, 4], ruleset, placesMap, scores, replacements)).toEqual(
      expected
    );
  });

  it.each([1, 2, 3, 4])('applies the same replacement penalty at place %s', (place) => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.oka = 20000;
    ruleset.rules.chipsValue = 1000;
    ruleset.rules.withYakitori = true;
    const state = new SessionState(ruleset, [1, 2, 3, 4]);
    state.state.scores = { 1: 50000 - place * 10000, 2: 35000, 3: 25000, 4: 15000 };
    state.state.chips = { 1: 5, 2: 0, 3: 0, 4: 0 };
    state.state.chombo = { 1: -20000 };
    state.state.yakitori = { 1: true };
    state.setReplacements({ 1: 101 });

    const results = mdl.calc(ruleset, state, [1, 2, 3, 4], 19, 501);
    expect(results[0].place).toBe(place);
    expect(results[0].ratingDelta).toBe(-30000);
    expect(results.map((result) => result.playerId)).toEqual([1, 2, 3, 4]);
  });

  it('treats zero replacement penalties as fixed values', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.replacementPlayerFixedPoints = 0;
    ruleset.rules.replacementPlayerOverrideUma = 0;
    const scores = { 1: 60000, 2: 30000, 3: 20000, 4: 10000 };
    expect(
      mdl.calcRatingDelta([1, 2, 3, 4], ruleset, mdl.calcPlacesMap(scores), scores, { 1: 101 })[1]
    ).toBe(0);
  });

  it.each(['replacementPlayerFixedPoints', 'replacementPlayerOverrideUma'] as const)(
    'defaults an omitted %s to zero',
    (field) => {
      const ruleset = RulesetEntity.createRuleset('ema');
      delete (ruleset.rules as Partial<RulesetConfig>)[field];
      const scores = { 1: 60000, 2: 30000, 3: 20000, 4: 10000 };
      expect(
        mdl.calcRatingDelta([1, 2, 3, 4], ruleset, mdl.calcPlacesMap(scores), scores, { 1: 101 })[1]
      ).toBe(-15000);
    }
  );

  it.each<Record<number, number>>([{}, { 1: 2, 2: -2 }])(
    'treats missing saved chip counts as zero: %j',
    (chips) => {
      const ruleset = RulesetEntity.createRuleset('ema');
      ruleset.rules.startPoints = 25000;
      ruleset.rules.oka = 20000;
      ruleset.rules.chipsValue = 8000;
      const state = new SessionState(ruleset, [1, 2, 3, 4]);
      state.state.scores = { 1: 40200, 2: 24700, 3: 22100, 4: 13000 };
      state.state.chips = chips;

      const results = mdl.calc(ruleset, state, [1, 2, 3, 4], 29, 249);
      expect(results.map((result) => result.chips)).toEqual([chips[1] ?? 0, chips[2] ?? 0, 0, 0]);
      expect(results.map((result) => result.ratingDelta)).toEqual([
        45200 + (chips[1] ?? 0) * 8000,
        -300 + (chips[2] ?? 0) * 8000,
        -12900,
        -32000,
      ]);
    }
  );
});
