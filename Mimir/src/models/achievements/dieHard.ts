import { Repository } from "../../services/Repository";
import { EventEntity } from "../../entities/Event.entity";
import { getRoundsOfSessions } from "./helpers/getRoundsOfSessions";
import { getGamesOfEvent } from "./helpers/getGamesOfEvent";
import { RoundOutcome } from "tsclients/proto/atoms.pb";

export async function getDieHard(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo,
  );

  const throwCounts = new Map<number, number>();

  for (const session of sessions) {
    for (const p of session.players) {
      if (!throwCounts.has(p.playerId)) {
        throwCounts.set(p.playerId, 0);
      }
    }

    for (const round of rounds[session.id]) {
      if (
        round.outcome !== RoundOutcome.ROUND_OUTCOME_RON &&
        round.outcome !== RoundOutcome.ROUND_OUTCOME_MULTIRON
      ) {
        continue;
      }

      for (const hand of round.hands) {
        throwCounts.set(hand.loserId!, throwCounts.get(hand.loserId!)! + 1);
      }
    }
  }

  const bestCountsSorted = [...throwCounts.entries()].sort(
    (a, b) => a[1] - b[1],
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
