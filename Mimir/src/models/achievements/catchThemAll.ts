import { Repository } from '../../services/Repository';
import { EventEntity } from '../../entities/Event.entity';
import { getRoundsOfSessions } from './helpers/getRoundsOfSessions';
import { getGamesOfEvent } from './helpers/getGamesOfEvent';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';
import { Yaku } from '../../helpers/yaku';

export async function getCatchThemAll(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  const yakuCollected = new Map<number, Set<number>>();

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
        if (!yakuCollected.has(hand.winnerId!)) {
          yakuCollected.set(hand.winnerId!, new Set());
        }
        const yakuList = (hand.yaku ?? []).map((y) => {
          if (y === Yaku.YAKUHAI2 || y === Yaku.YAKUHAI3 || y === Yaku.YAKUHAI4) {
            return Yaku.YAKUHAI1; // all yakuhais are counted as single yaku
          }
          return y;
        });
        yakuCollected.set(
          hand.winnerId!,
          yakuCollected.get(hand.winnerId!)!.union(new Set(yakuList))
        );
      }
    }
  }

  const bestCountsSorted = [...yakuCollected.entries()].sort((a, b) => b[1].size - a[1].size);
  const bestCount = bestCountsSorted[0][1].size;
  const playerIds = [];
  for (const [playerId, yakuList] of bestCountsSorted) {
    if (yakuList.size === bestCount) {
      playerIds.push(playerId);
    } else {
      break;
    }
  }

  return { count: bestCount, playerIds };
}
