import { RoundEntity } from '../entities/Round.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionStateEntity } from '../entities/SessionState.entity.js';
import { SessionState } from './SessionState.js';
import { checkRiichiPoints } from './roundValidation.js';

/** Calculate before touching managed entities. Outcome participants remain unchanged. */
export function correctSessionSeating(
  ruleset: RulesetEntity,
  current: SessionStateEntity,
  rounds: RoundEntity[],
  playerIds: number[]
) {
  const original = rounds.map((round) => {
    if (!round.lastSessionState) throw new Error('Round has no saved session state');
    return round.lastSessionState.clone();
  });
  const final = current.clone();
  const initial = (original[0] ?? final).clone();
  initial.playerIds = [...playerIds];
  const state = new SessionState(ruleset, playerIds, initial);
  const snapshots: SessionStateEntity[] = [];
  for (const [index, round] of rounds.entries()) {
    if (state.isFinished()) throw new Error('Corrected history reaches the ending condition');
    snapshots.push(state.state.clone());
    checkRiichiPoints(ruleset, state.getScores(), round);
    state.update(round);
    // Timer decisions were made when each hand was recorded. Never consult today's
    // clock, event timer (which may have restarted), or subsequently added extra time.
    const after = original[index + 1] ?? final;
    state.state.lastHandStarted = after.lastHandStarted;
    state.state.prematurelyFinished = after.prematurelyFinished;
  }
  if (state.isFinished()) throw new Error('Corrected history reaches the ending condition');
  return { state: state.state, snapshots };
}
