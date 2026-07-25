import { Repository } from '../../services/Repository';
import { EventEntity } from '../../entities/Event.entity';
import { getRoundsOfSessions } from './helpers/getRoundsOfSessions';
import { getGamesOfEvent } from './helpers/getGamesOfEvent';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';
import { PointsCalc } from '../../helpers/PointsCalc';

export async function getImpossibleWait(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  const throwAmounts: {
    playerId: number;
    amount: number;
    hand: { han: number; fu?: number };
  }[] = [];

  for (const session of sessions) {
    const sessionPlayersOrdered = [...session.players].sort((p1, p2) => p1.order - p2.order);
    for (const round of rounds[session.id]) {
      if (
        round.outcome !== RoundOutcome.ROUND_OUTCOME_RON &&
        round.outcome !== RoundOutcome.ROUND_OUTCOME_MULTIRON
      ) {
        continue;
      }
      const currentDealerId = sessionPlayersOrdered[(round.round - 1) % 4].playerId;

      for (const hand of round.hands) {
        if ((round.riichi ?? []).includes(hand.loserId!)) {
          continue;
        }
        const calc = new PointsCalc();
        calc.ron(
          event.ruleset.rules,
          hand.winnerId === currentDealerId,
          Object.fromEntries(sessionPlayersOrdered.map((id) => [id, 0])),
          hand.winnerId!,
          hand.loserId!,
          hand.han!,
          hand.fu!,
          [],
          0,
          0,
          null,
          null,
          0
        );
        const payment = calc.lastPaymentsInfo().direct[`${hand.winnerId!}<-${hand.loserId!}`];
        throwAmounts.push({
          playerId: hand.loserId!,
          amount: payment,
          hand: { han: hand.han!, fu: hand.fu },
        });
      }
    }
  }

  return throwAmounts.sort((a, b) => b.amount - a.amount).slice(0, 10);
}
