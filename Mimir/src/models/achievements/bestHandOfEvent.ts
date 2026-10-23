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
  const ids = new Set<number>();
  const gamesByPlayer: Record<number, string[]> = {};
  for (const session of sessions) {
    for (const round of rounds[session.id]) {
      if (
        round.outcome === RoundOutcome.ROUND_OUTCOME_RON ||
        round.outcome === RoundOutcome.ROUND_OUTCOME_TSUMO ||
        round.outcome === RoundOutcome.ROUND_OUTCOME_MULTIRON
      ) {
        for (const hand of round.hands) {
          if (hand.han! > maxHan) {
            maxHan = hand.han!;
            ids.clear();
            Object.keys(gamesByPlayer).forEach((id) => delete gamesByPlayer[+id]);
          }
          if (hand.han! === maxHan) {
            ids.add(hand.winnerId!);
            const hashes = (gamesByPlayer[hand.winnerId!] ??= []);
            if (session.representationalHash && !hashes.includes(session.representationalHash)) {
              hashes.push(session.representationalHash);
            }
          }
        }
      }
    }
  }

  return {
    han: maxHan,
    gamesByPlayer,
    playerIds: Array.from(ids),
  };
}
