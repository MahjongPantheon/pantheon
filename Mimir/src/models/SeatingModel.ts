import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { Model } from './Model.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { PlayerModel } from './PlayerModel.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { PlayerInSessionModel } from './PlayerInSessionModel.js';
import { EventsGetCurrentSeatingResponse } from 'tsclients/proto/mimir.pb.js';

export class SeatingModel extends Model {
  public async getCurrentSeating(eventId: number): Promise<EventsGetCurrentSeatingResponse> {
    const event = await this.repo.em.findOne(EventEntity, eventId, {
      populate: ['ruleset'],
    });
    if (!event) {
      throw new Error('Event not found');
    }
    const startRating = event.ruleset?.rules.startRating;

    const registrations = await this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: this.repo.em.getReference(EventEntity, eventId), ignoreSeating: 0 },
    });

    const regIds = registrations.map((r) => r.id);

    const playerModel = this.getModel(PlayerModel);
    const players = await playerModel.findById(regIds);

    const historyModel = this.getModel(PlayerHistoryModel);
    const history = await historyModel.findLastByEvent([eventId]);

    const playerInSessionModel = this.getModel(PlayerInSessionModel);
    const seating = await playerInSessionModel.getPlayersSeatingInEvent(eventId, regIds.length);

    const ratings: Record<number, number> = {};
    for (const player of players) {
      ratings[player.id] = startRating;
    }
    for (const hItem of history) {
      if (hItem.rating) {
        ratings[hItem.playerId] = hItem.rating;
      }
    }

    const playerById = players.reduce(
      (acc, player) => {
        acc[player.id] = player;
        return acc;
      },
      {} as Record<number, (typeof players)[0]>
    );

    return {
      seating: seating
        .map((seat) => ({
          ...seat,
          rating: ratings[seat.player_id] ?? 0,
          title: playerById[seat.player_id]?.title,
          hasAvatar: playerById[seat.player_id]?.hasAvatar ?? false,
          lastUpdate: playerById[seat.player_id]?.lastUpdate,
        }))
        .filter((s) => !!s.table_index),
    };
  }
}
