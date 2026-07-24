import { RoundOutcome } from "tsclients/proto/atoms.pb";
import { EventEntity } from "../../entities/Event.entity";
import { Repository } from "../../services/Repository";
import { getGamesOfEvent } from "./helpers/getGamesOfEvent";
import { getRoundsOfSessions } from "./helpers/getRoundsOfSessions";

export async function getBestShithander(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo,
  );

  let ids: Record<number, number> = {};
  for (const session of sessions) {
    for (const round of rounds[session.id]) {
      if (
        round.outcome === RoundOutcome.ROUND_OUTCOME_RON ||
        round.outcome === RoundOutcome.ROUND_OUTCOME_TSUMO ||
        round.outcome === RoundOutcome.ROUND_OUTCOME_MULTIRON
      ) {
        for (const hand of round.hands) {
          if (hand.han === 1 && hand.fu === 30 && !hand.dora) {
            ids[hand.winnerId!] ??= 0;
            ids[hand.winnerId!] += 1;
          }
        }
      }
    }
  }

  const sorted = Object.entries(ids).sort((a, b) => b[1] - a[1]);
  let max = sorted[0][1];
  const best: number[] = [];
  for (const [id, count] of sorted) {
    if (count === max) {
      best.push(+id);
    } else {
      break;
    }
  }

  return {
    handsCount: max,
    playerIds: best,
  };
}
