import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { SessionStateEntity } from '../entities/SessionState.entity.js';
import { SessionState } from './SessionState.js';

/** Reconstruct before awarding: the saved final scores may already include a payout. */
export function repairedRiichiScores(
  ruleset: RulesetEntity,
  saved: SessionStateEntity,
  lastRound: RoundEntity
): Record<number, number> {
  if (!ruleset.rules.riichiGoesToWinner) {
    return { ...saved.scores };
  }
  if (!lastRound.lastSessionState) {
    throw new Error('Last round has no saved starting state');
  }
  const state = new SessionState(ruleset, [], lastRound.lastSessionState);
  state.update(lastRound);
  if (state.getRiichiBets() !== saved.riichiBets) {
    throw new Error('Reconstructed riichi pot differs from the final snapshot');
  }
  const scores = state.getScores();
  const playerIds = saved.playerIds;
  if (
    playerIds.length !== 4 ||
    new Set(playerIds).size !== 4 ||
    Object.keys(scores).length !== 4 ||
    Object.keys(saved.scores).length !== 4 ||
    playerIds.some(
      (id) => !Number.isSafeInteger(scores[id]) || !Number.isSafeInteger(saved.scores[id])
    ) ||
    !Number.isSafeInteger(saved.riichiBets) ||
    saved.riichiBets < 0
  ) {
    throw new Error('Invalid final player scores or riichi pot');
  }
  if (state.getRiichiBets() === 0) {
    // There is no end-of-game payout to repair. Preserve unrelated score adjustments.
    return { ...saved.scores };
  }
  const highestScore = Math.max(...playerIds.map((id) => scores[id]));
  const winners = playerIds.filter((id) => scores[id] === highestScore);
  const share = Math.floor((state.getRiichiBets() * 1000) / winners.length);
  for (const id of winners) {
    scores[id] += share;
  }
  return scores;
}
