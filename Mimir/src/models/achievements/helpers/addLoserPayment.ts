import { RoundEntity } from '../../../entities/Round.entity';
import { SessionState } from '../../../helpers/SessionState';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';

export type PaymentList = Map<number, { sum: number; count: number }>;

export function addLoserPayment(
  round: RoundEntity,
  lastSessionState: SessionState,
  currentSessionState: SessionState,
  payments: PaymentList
): PaymentList {
  if (
    currentSessionState.getLastOutcome() !== RoundOutcome.ROUND_OUTCOME_RON &&
    currentSessionState.getLastOutcome() !== RoundOutcome.ROUND_OUTCOME_MULTIRON
  ) {
    return payments;
  }

  const loserId = round.hands[0].loserId;
  if (!loserId) {
    return payments;
  }

  const loserHasRiichi = round.riichi?.includes(loserId) ?? false;
  const lastScore = lastSessionState.getScores()[loserId];
  const currentScore = currentSessionState.getScores()[loserId];
  const payment = lastScore - currentScore - (loserHasRiichi ? 1000 : 0);

  if (!payments.has(loserId)) {
    payments.set(loserId, { sum: 0, count: 0 });
  }

  payments.get(loserId)!.sum += payment;
  payments.get(loserId)!.count += round.hands.length;
  return payments;
}
