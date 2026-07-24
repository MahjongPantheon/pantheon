import { Repository } from "../../services/Repository";
import { EventEntity } from "../../entities/Event.entity";
import { getRoundsOfSessions } from "./helpers/getRoundsOfSessions";
import { getGamesOfEvent } from "./helpers/getGamesOfEvent";
import { RoundOutcome } from "tsclients/proto/atoms.pb";
import { Yaku } from "../../helpers/yaku";

export async function getFavoriteTsuchidaApprentice(
  event: EventEntity,
  repo: Repository,
) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo,
  );

  const chiitoitsuCounts = new Map<number, number>();

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
        if (
          !hand.yaku?.includes(Yaku.CHIITOITSU) ||
          (hand.han ?? 0) + (hand.dora ?? 0) <= 2
        ) {
          continue;
        }
        if (!chiitoitsuCounts.has(hand.winnerId!)) {
          chiitoitsuCounts.set(hand.winnerId!, 1);
        } else {
          chiitoitsuCounts.set(
            hand.winnerId!,
            chiitoitsuCounts.get(hand.winnerId!)! + 1,
          );
        }
      }
    }
  }

  return [...chiitoitsuCounts.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([playerId, count]) => ({ playerId, count }));
}
