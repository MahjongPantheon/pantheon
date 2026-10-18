// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { isGoalPointsValid } from './validation';

describe('goal points validation', () => {
  it.each([0, 29999, '', NaN])('rejects an invalid goal score of %s', (goalPoints) => {
    expect(isGoalPointsValid(goalPoints, { startPoints: 30000, playAdditionalRounds: true })).toBe(
      false
    );
  });

  it.each([30000, 35000])('accepts a goal score of %s', (goalPoints) => {
    expect(isGoalPointsValid(goalPoints, { startPoints: 30000, playAdditionalRounds: true })).toBe(
      true
    );
  });

  it('checks the current initial points', () => {
    expect(isGoalPointsValid(30000, { startPoints: 35000, playAdditionalRounds: true })).toBe(
      false
    );
  });

  it('allows an unused goal score when additional rounds are disabled', () => {
    expect(isGoalPointsValid(0, { startPoints: 30000, playAdditionalRounds: false })).toBe(true);
  });
});
