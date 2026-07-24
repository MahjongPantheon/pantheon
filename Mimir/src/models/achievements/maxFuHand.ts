import { EventEntity } from '../../entities/Event.entity';
import { RoundEntity } from '../../entities/Round.entity';
import { Repository } from '../../services/Repository';

export async function getMaxFuHand(eventId: number, repo: Repository) {
  const rounds = await repo.db.em.findAll(RoundEntity, {
    fields: ['hands.fu', 'hands.winnerId'],
    populate: ['hands'],
    where: {
      event: repo.db.em.getReference(EventEntity, eventId),
      hands: {
        $not: {
          fu: null,
        },
      },
    },
    orderBy: {
      hands: {
        fu: -1,
      },
    },
    limit: 20,
  });

  let maxFu = 0;
  let playerIds = [];
  for (const round of rounds) {
    for (const hand of round.hands) {
      if (!hand.winnerId) {
        continue;
      }
      if (hand.fu && hand.fu > maxFu) {
        maxFu = hand.fu;
        playerIds = [];
        playerIds.push(hand.winnerId);
      }
      if (hand.fu === maxFu) {
        playerIds.push(hand.winnerId);
      }
    }
  }

  return {
    playerIds,
    fu: maxFu,
  };
}
