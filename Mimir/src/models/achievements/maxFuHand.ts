import { EventEntity } from '../../entities/Event.entity';
import { RoundEntity } from '../../entities/Round.entity';
import { Repository } from '../../services/Repository';

export async function getMaxFuHand(eventId: number, repo: Repository) {
  const rounds = await repo.em.findAll(RoundEntity, {
    // Partial hands must not enter the identity map shared by the other achievements.
    disableIdentityMap: true,
    fields: ['hands.fu', 'hands.winnerId', 'session.representationalHash'],
    populate: ['hands', 'session'],
    where: {
      event: repo.em.getReference(EventEntity, eventId),
      hands: {
        fu: { $ne: null },
      },
    },
    orderBy: {
      hands: {
        fu: -1,
      },
    },
  });

  let maxFu = 0;
  const playerIds = new Set<number>();
  const gamesByPlayer: Record<number, string[]> = {};
  for (const round of rounds) {
    for (const hand of round.hands) {
      if (!hand.winnerId) {
        continue;
      }
      if (hand.fu && hand.fu > maxFu) {
        maxFu = hand.fu;
        playerIds.clear();
        Object.keys(gamesByPlayer).forEach((id) => delete gamesByPlayer[+id]);
        playerIds.add(hand.winnerId);
      }
      if (hand.fu === maxFu) {
        playerIds.add(hand.winnerId);
        gamesByPlayer[hand.winnerId] ??= [];
        const hashes = gamesByPlayer[hand.winnerId];
        const hash = round.session.representationalHash;
        if (hash && !hashes.includes(hash)) {
          hashes.push(hash);
        }
      }
    }
  }

  return {
    playerIds: Array.from(playerIds),
    fu: maxFu,
    gamesByPlayer,
  };
}
