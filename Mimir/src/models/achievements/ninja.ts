import { Repository } from '../../services/Repository';
import { EventEntity } from '../../entities/Event.entity';
import { getRoundsOfSessions } from './helpers/getRoundsOfSessions';
import { getGamesOfEvent } from './helpers/getGamesOfEvent';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';

export async function getNinja(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  const damatenCounts = new Map<number, number>();

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
        if (hand.openHand || round.riichi?.includes(hand.winnerId!)) {
          continue;
        }
        if (!damatenCounts.has(hand.winnerId!)) {
          damatenCounts.set(hand.winnerId!, 0);
        }
        damatenCounts.set(hand.winnerId!, damatenCounts.get(hand.winnerId!)! + 1);
      }
    }
  }

  const bestCountsSorted = [...damatenCounts.entries()].sort((a, b) => b[1] - a[1]);
  const bestCount = bestCountsSorted[0][1];
  const playerIds = [];
  for (const [playerId, count] of bestCountsSorted) {
    if (count === bestCount) {
      playerIds.push(playerId);
    } else {
      break;
    }
  }

  return { count: bestCount, playerIds };
}
