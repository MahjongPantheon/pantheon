import { Repository } from "../../services/Repository";
import { EventEntity } from "../../entities/Event.entity";
import { getRoundsOfSessions } from "./helpers/getRoundsOfSessions";
import { getGamesOfEvent } from "./helpers/getGamesOfEvent";
import { RoundOutcome } from "tsclients/proto/atoms.pb";

export async function getFavoriteAsapinApprentice(
  event: EventEntity,
  repo: Repository,
) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo,
  );

  const tempaiWinAmounts = new Map<number, number>();

  for (const session of sessions) {
    for (const round of rounds[session.id]) {
      if (round.outcome !== RoundOutcome.ROUND_OUTCOME_DRAW) {
        continue;
      }
      const tempaiPayment =
        {
          0: 0,
          1: 3000,
          2: 1500,
          3: 1000,
        }[(round.hands[0].tempai ?? []).length] ?? 0;

      for (const playerId of round.hands[0].tempai ?? []) {
        if (!tempaiWinAmounts.has(playerId)) {
          tempaiWinAmounts.set(playerId, 0);
        }
        tempaiWinAmounts.set(
          playerId,
          tempaiWinAmounts.get(playerId)! + tempaiPayment,
        );
      }
    }
  }

  return [...tempaiWinAmounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([playerId, score]) => ({ playerId, score }));
}
