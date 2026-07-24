import { Repository } from "../../services/Repository";
import { EventEntity } from "../../entities/Event.entity";
import { getRoundsOfSessions } from "./helpers/getRoundsOfSessions";
import { getGamesOfEvent } from "./helpers/getGamesOfEvent";
import { RoundOutcome } from "tsclients/proto/atoms.pb";
import { Yaku } from "../../helpers/yaku";

export async function getYakumans(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo,
  );

  const yakumans: { playerId: number; yakuman?: number[]; kazoe?: boolean }[] =
    [];

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
        if ((hand.han ?? 0) < 0) {
          yakumans.push({
            playerId: hand.winnerId!,
            yakuman: hand.yaku!.filter((y) =>
              [
                Yaku.DAISANGEN,
                Yaku.DAISUUSHII,
                Yaku.KOKUSHIMUSOU,
                Yaku.RYUUIISOU,
                Yaku.SUUANKOU,
                Yaku.SUUKANTSU,
                Yaku.TENHOU,
                Yaku.TSUUIISOU,
                Yaku.CHINROTO,
                Yaku.CHIHOU,
                Yaku.CHUURENPOUTO,
                Yaku.SHOSUUSHII,
                Yaku.SUUANKOUTANKI,
                Yaku.CHUURENPOUTOPURE,
                Yaku.KOKUSHIMUSOU13,
              ].includes(y),
            ),
          });
        }
        if ((hand.han ?? 0) >= 13 && event.ruleset.rules.withKazoe) {
          yakumans.push({
            playerId: hand.winnerId!,
            kazoe: true,
          });
        }
      }
    }
  }

  return yakumans;
}
