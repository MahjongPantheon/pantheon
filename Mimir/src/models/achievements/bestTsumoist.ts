import { Repository } from '../../services/Repository';
import { EventEntity } from '../../entities/Event.entity';
import { getRoundsOfSessions } from './helpers/getRoundsOfSessions';
import { getGamesOfEvent } from './helpers/getGamesOfEvent';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';

export async function getBestTsumoistInSingleSession(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  const bestTsumoCounts = new Map<number, number>();

  for (const session of sessions) {
    const tsumoCount = new Map<number, number>();
    for (const round of rounds[session.id]) {
      if (round.outcome !== RoundOutcome.ROUND_OUTCOME_TSUMO) {
        continue;
      }

      if (!tsumoCount.has(round.hands[0].winnerId!)) {
        tsumoCount.set(round.hands[0].winnerId!, 1);
      } else {
        tsumoCount.set(round.hands[0].winnerId!, tsumoCount.get(round.hands[0].winnerId!)! + 1);
      }
    }

    for (const [playerId, count] of tsumoCount.entries()) {
      if (!bestTsumoCounts.has(playerId) || count > bestTsumoCounts.get(playerId)!) {
        bestTsumoCounts.set(playerId, count);
      }
    }
  }

  const bestTsumoCountsSorted = [...bestTsumoCounts.entries()].sort((a, b) => b[1] - a[1]);
  const bestTsumoCount = bestTsumoCountsSorted[0][1];
  const playerIds = [];
  for (const [playerId, count] of bestTsumoCountsSorted) {
    if (count === bestTsumoCount) {
      playerIds.push(playerId);
    } else {
      break;
    }
  }

  return { tsumo: bestTsumoCount, playerIds };
}
