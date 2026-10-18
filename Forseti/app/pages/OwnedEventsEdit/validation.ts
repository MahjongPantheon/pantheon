import type { RulesetConfigLocal } from './types';

export const isGoalPointsValid = (
  value: number | string,
  ruleset: Pick<RulesetConfigLocal, 'startPoints' | 'playAdditionalRounds'>
) => !ruleset.playAdditionalRounds || (typeof value === 'number' && value >= ruleset.startPoints);
