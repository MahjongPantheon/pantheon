import { createRuleset } from 'src/rulesets/ruleset.js';
import { SessionResultsModel } from './SessionResultsModel.js';
import { Model } from './Model.js';

import config from '../mikro-orm.config.js';
import { MikroORM } from '@mikro-orm/postgresql';
import { Repository } from 'src/services/Repository.js';

const orm = await MikroORM.init(config());

describe('SessionResults', () => {
  const mdl = Model.getModel(Repository.instance({}, orm), SessionResultsModel);

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

  it('should calculate rating delta', () => {
    const ruleset = createRuleset('ema');
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
    expect(mdl.calcRatingDelta(ruleset, placesMap, scores, replacements)).toEqual(expected);
  });
});
