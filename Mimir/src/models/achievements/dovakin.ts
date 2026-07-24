import { Repository } from "../../services/Repository";
import { EventEntity } from "../../entities/Event.entity";
import { getRoundsOfSessions } from "./helpers/getRoundsOfSessions";
import { getGamesOfEvent } from "./helpers/getGamesOfEvent";
import { RoundOutcome } from "tsclients/proto/atoms.pb";
import { Yaku } from "../../helpers/yaku";

export async function getDovakin(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo,
  );

  const yakuhaiCounts = new Map<number, number>();

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
        if (!yakuhaiCounts.has(hand.winnerId!)) {
          yakuhaiCounts.set(hand.winnerId!, 0);
        }
        for (const yaku of hand.yaku ?? []) {
          switch (yaku) {
            case Yaku.YAKUHAI1:
              yakuhaiCounts.set(
                hand.winnerId!,
                yakuhaiCounts.get(hand.loserId!)! + 1,
              );
              break;
            case Yaku.YAKUHAI2:
              yakuhaiCounts.set(
                hand.winnerId!,
                yakuhaiCounts.get(hand.loserId!)! + 2,
              );
              break;
            case Yaku.YAKUHAI3:
              yakuhaiCounts.set(
                hand.winnerId!,
                yakuhaiCounts.get(hand.loserId!)! + 3,
              );
              break;
            case Yaku.YAKUHAI4:
              yakuhaiCounts.set(
                hand.winnerId!,
                yakuhaiCounts.get(hand.loserId!)! + 4,
              );
              break;
            default:
          }
        }
      }
    }
  }

  const bestCountsSorted = [...yakuhaiCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  );
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
