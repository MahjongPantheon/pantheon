import { complexUma, equalizedUma } from './ruleset.js';

describe('Equalize uma', () => {
  it('should output zero uma for all equal scores', () => {
    expect(equalizedUma([30000, 30000, 30000, 30000], [15000, 5000, -5000, -15000])).toEqual([
      0, 0, 0, 0,
    ]);
  });
  it('should equalize uma for three equal scores', () => {
    expect(equalizedUma([33000, 29000, 29000, 29000], [15000, 5000, -5000, -15000])).toEqual([
      15000, -5000, -5000, -5000,
    ]);
    expect(equalizedUma([27000, 31000, 31000, 31000], [15000, 5000, -5000, -15000])).toEqual([
      5000, 5000, 5000, -15000,
    ]);
  });
  it('should equalize uma for two equal scores', () => {
    expect(equalizedUma([33000, 33000, 27000, 27000], [15000, 5000, -5000, -15000])).toEqual([
      10000, 10000, -10000, -10000,
    ]);
    expect(equalizedUma([33000, 33000, 29000, 25000], [15000, 5000, -5000, -15000])).toEqual([
      10000, 10000, -5000, -15000,
    ]);
    expect(equalizedUma([33000, 30000, 30000, 27000], [15000, 5000, -5000, -15000])).toEqual([
      15000, 0, 0, -15000,
    ]);
    expect(equalizedUma([33000, 31000, 28000, 28000], [15000, 5000, -5000, -15000])).toEqual([
      15000, 5000, -10000, -10000,
    ]);
  });
  it('should output original uma in case of all different scores', () => {
    expect(equalizedUma([33000, 31000, 29000, 27000], [15000, 5000, -5000, -15000])).toEqual([
      15000, 5000, -5000, -15000,
    ]);
  });
});

describe('Complex uma', () => {
  const umaDef = {
    3: [12000, -1000, -3000, -8000],
    1: [8000, 3000, 1000, -12000],
    default: [8000, 4000, -4000, -8000],
  };
  it('should output complex uma for three negative scores', () => {
    expect(complexUma([36000, 29000, 28000, 27000], umaDef, 30000)).toEqual(umaDef['3']);
  });
  it('should output complex uma for one negative score', () => {
    expect(complexUma([33000, 32000, 31000, 24000], umaDef, 30000)).toEqual(umaDef['1']);
  });
  it('should output complex uma for two negative scores', () => {
    expect(complexUma([33000, 32000, 28000, 27000], umaDef, 30000)).toEqual(umaDef.default);
  });
  it('should output complex uma for all equal scores', () => {
    expect(complexUma([30000, 30000, 30000, 30000], umaDef, 30000)).toEqual(umaDef.default);
  });
  it('should output complex uma for all negative scores', () => {
    expect(complexUma([29500, 29300, 29200, 29000], umaDef, 30000)).toEqual(umaDef.default);
  });
});
