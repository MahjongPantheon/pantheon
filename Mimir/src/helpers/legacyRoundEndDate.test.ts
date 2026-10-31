import { legacyRoundEndDate } from './legacyRoundEndDate.js';

describe('legacy round end dates', () => {
  it('converts pg Date objects to strings without changing the instant', () => {
    const date = new Date('2021-10-26T14:20:18.123+03:00');
    expect(legacyRoundEndDate(date)).toBe('2021-10-26T11:20:18.123Z');
  });

  it('preserves timestamps already returned as strings', () => {
    const date = '2021-10-26 11:20:18.123456';
    expect(legacyRoundEndDate(date)).toBe(date);
  });

  it.each([null, undefined])('leaves an absent timestamp unset (%s)', (date) => {
    expect(legacyRoundEndDate(date)).toBeUndefined();
  });
});
