import { Repository } from "../../services/Repository";
import { EventEntity } from "../../entities/Event.entity";
import { getRoundsOfSessions } from "./helpers/getRoundsOfSessions";
import { getGamesOfEvent } from "./helpers/getGamesOfEvent";
import { RoundOutcome } from "tsclients/proto/atoms.pb";
import { Yaku } from "../../helpers/yaku";

export async function getRiichiNomi(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo,
  );

  const riichiNomiCounts = new Map<number, number>();

  for (const session of sessions) {
    for (const round of rounds[session.id]) {
      if (
        round.outcome !== RoundOutcome.ROUND_OUTCOME_RON &&
        round.outcome !== RoundOutcome.ROUND_OUTCOME_MULTIRON
      ) {
        continue;
      }

      for (const hand of round.hands) {
        if (hand.han !== 1) {
          continue;
        }
        if (!hand.yaku?.includes(Yaku.RIICHI)) {
          continue;
        }
        if (!riichiNomiCounts.has(hand.winnerId!)) {
          riichiNomiCounts.set(hand.winnerId!, 0);
        }

        riichiNomiCounts.set(
          hand.winnerId!,
          riichiNomiCounts.get(hand.winnerId!)! + 1,
        );
      }
    }
  }

  const bestCountsSorted = [...riichiNomiCounts.entries()].sort(
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
