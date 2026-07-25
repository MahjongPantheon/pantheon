import { RoundOutcome } from 'tsclients/proto/atoms.pb';
import { EventEntity } from '../../entities/Event.entity';
import { Repository } from '../../services/Repository';
import { getGamesOfEvent } from './helpers/getGamesOfEvent';
import { getRoundsOfSessions } from './helpers/getRoundsOfSessions';

export async function getBestHandOfEvent(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  let maxHan = 0;
  let ids: number[] = [];
  for (const session of sessions) {
    for (const round of rounds[session.id]) {
      if (
        round.outcome === RoundOutcome.ROUND_OUTCOME_RON ||
        round.outcome === RoundOutcome.ROUND_OUTCOME_TSUMO ||
        round.outcome === RoundOutcome.ROUND_OUTCOME_MULTIRON
      ) {
        for (const hand of round.hands) {
          if (hand.han! + (hand.dora ?? 0) > maxHan) {
            maxHan = hand.han! + (hand.dora ?? 0);
            ids = [hand.winnerId!];
          } else if (hand.han! + (hand.dora ?? 0) === maxHan) {
            ids.push(hand.winnerId!);
          }
        }
      }
    }
  }

  return {
    han: maxHan,
    playerIds: ids,
  };
}
