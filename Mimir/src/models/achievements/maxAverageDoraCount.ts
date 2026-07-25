import { Repository } from '../../services/Repository';
import { EventEntity } from '../../entities/Event.entity';
import { getRoundsOfSessions } from './helpers/getRoundsOfSessions';
import { getGamesOfEvent } from './helpers/getGamesOfEvent';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';

export async function getMaxAverageDoraCount(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  const doraStats = new Map<number, { total: number; handsWon: number }>();

  for (const session of sessions) {
    for (const round of rounds[session.id]) {
      if (
        round.outcome !== RoundOutcome.ROUND_OUTCOME_RON &&
        round.outcome !== RoundOutcome.ROUND_OUTCOME_MULTIRON &&
        round.outcome !== RoundOutcome.ROUND_OUTCOME_TSUMO
      ) {
        continue;
      }

      for (const hand of round.hands) {
        if (!doraStats.has(hand.winnerId!)) {
          doraStats.set(hand.winnerId!, { total: 0, handsWon: 0 });
        }
        doraStats.set(hand.winnerId!, {
          total: doraStats.get(hand.winnerId!)!.total + (hand.dora ?? 0),
          handsWon: doraStats.get(hand.winnerId!)!.handsWon + 1,
        });
      }
    }
  }

  const bestAveragesSorted = [...doraStats.entries()]
    .sort((a, b) => b[1].total / b[1].handsWon - a[1].total / a[1].handsWon)
    .slice(0, 5);
  return bestAveragesSorted.map(([playerId, { total, handsWon }]) => ({
    playerId,
    average: +(total / handsWon).toFixed(2),
  }));
}
