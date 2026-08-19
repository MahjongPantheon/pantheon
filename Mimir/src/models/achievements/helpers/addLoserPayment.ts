import { RoundEntity } from '../../../entities/Round.entity';
import { SessionState } from '../../../helpers/SessionState';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';

export type PaymentList = Map<number, { sum: number; count: number }>;

export function addLoserPayment(
  currentRound: RoundEntity,
  currentSessionState: SessionState,
  nextSessionState: SessionState,
  payments: PaymentList
): PaymentList {
  if (
    nextSessionState.getLastOutcome() !== RoundOutcome.ROUND_OUTCOME_RON &&
    nextSessionState.getLastOutcome() !== RoundOutcome.ROUND_OUTCOME_MULTIRON
  ) {
    return payments;
  }

  const loserId = currentRound.hands[0].loserId;
  if (!loserId) {
    return payments;
  }

  const loserHasRiichi = currentRound.riichi?.includes(loserId) ?? false;
  const lastScore = currentSessionState.getScores()[loserId];
  const currentScore = nextSessionState.getScores()[loserId];
  const payment = lastScore - currentScore - (loserHasRiichi ? 1000 : 0);

  if (!payments.has(loserId)) {
    payments.set(loserId, { sum: 0, count: 0 });
  }

  payments.get(loserId)!.sum += payment;
  payments.get(loserId)!.count += currentRound.hands.length;
  return payments;
}
