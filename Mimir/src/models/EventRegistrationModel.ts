import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { Model } from './Model.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { PlayerModel } from './PlayerModel.js';
import {
  EventsUpdatePlayerReplacementPayload,
  EventsUpdatePlayerSeatingFlagPayload,
  EventsUpdatePlayersLocalIdsPayload,
  EventsUpdatePlayersTeamsPayload,
} from 'tsclients/proto/mimir.pb.js';
import { LocalIdMapping, TeamMapping } from 'tsclients/proto/atoms.pb.js';

export class EventRegistrationModel extends Model {
  async findByPlayerAndEvent(ids: number[], eventId: number) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        event: this.repo.em.getReference(EventEntity, eventId),
        playerId: ids,
      },
    });
  }

  async findByEventId(eventIds: number[]) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        event: this.repo.em.getReference(EventEntity, eventIds),
      },
    });
  }

  async findByPlayerId(playerId: number) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        playerId,
      },
    });
  }

  async findNextFreeLocalId(eventId: number) {
    const result = await this.repo.em.findOne(
      EventRegisteredPlayersEntity,
      {
        event: this.repo.em.getReference(EventEntity, eventId),
      },
      { orderBy: { localId: -1 } }
    );

    if (result === null) {
      return 1;
    }

    return (result.localId ?? 0) + 1;
  }

  async updateLocalIds(eventId: number, idMap: LocalIdMapping[]) {
    return this.repo.em.upsertMany(
      EventRegisteredPlayersEntity,
      [
        ...idMap.map(({ playerId, localId }) => ({
          playerId,
          eventId,
          localId,
          ignoreSeating: 0,
        })),
      ],
      { onConflictFields: ['localId'] }
    );
  }

  async updateTeamNames(eventId: number, teamMap: TeamMapping[]) {
    return this.repo.em.upsertMany(
      EventRegisteredPlayersEntity,
      [
        ...teamMap.map(({ playerId, teamName }) => ({
          playerId,
          eventId,
          teamName,
          ignoreSeating: 0,
        })),
      ],
      { onConflictFields: ['teamName'] }
    );
  }

  async findRegisteredPlayersIdsByEvent(eventId: number) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: this.repo.em.getReference(EventEntity, eventId) },
    });
  }

  async findIgnoredPlayersIdsByEvent(eventIds: number[]) {
    const result = await this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: this.repo.em.getReference(EventEntity, eventIds), ignoreSeating: 1 },
    });
    return result.map((reg) => reg.playerId);
  }

  async fetchPlayersRegData(eventIds: number[]) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: this.repo.em.getReference(EventEntity, eventIds) },
    });
  }

  async fetchPlayersRegDataByIds(eventIds: number[], playerIds: number[]) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: this.repo.em.getReference(EventEntity, eventIds), playerId: playerIds },
    });
  }

  async fetchRegisteredPlayersByEvent(eventId: number) {
    const result = await this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: this.repo.em.getReference(EventEntity, eventId) },
    });
    const playerModel = this.getModel(PlayerModel);
    return playerModel.findById(result.map((reg) => reg.playerId));
  }

  /**
   * Note: returns inverted map of <replacement -> id>
   * @param db
   * @param eventIds
   */
  async findReplacementMapByEvent(eventIds: number[]) {
    const items = await this.findByEventId(eventIds);
    const result = new Map<number, number>();
    for (const item of items) {
      if (!item.replacementId) {
        continue;
      }
      result.set(item.replacementId, item.playerId);
    }
    return result;
  }

  async findLocalIdsMapByEvent(eventId: number) {
    const items = await this.findByEventId([eventId]);
    const result = new Map<number, number>();
    for (const item of items) {
      if (!item.localId) {
        continue;
      }
      result.set(item.playerId, item.localId);
    }
    return result;
  }

  async findTeamNameMapByEvent(eventId: number) {
    const items = await this.findByEventId([eventId]);
    const result = new Map<number, string>();
    for (const item of items) {
      if (!item.teamName) {
        continue;
      }
      result.set(item.playerId, item.teamName);
    }
    return result;
  }

  async getSubstitutionPlayers(eventId: number) {
    const replacements: Record<number, number> = {};
    const regs = await this.findByEventId([eventId]);
    for (const reg of regs) {
      if (!reg.playerId || !reg.replacementId) {
        continue;
      }
      replacements[reg.playerId] = reg.replacementId;
    }
    return replacements;
  }

  async registerPlayer(eventId: number, playerId: number) {
    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(eventId))) {
      throw new Error("You don't have the necessary permissions to register players");
    }

    const regItemOld = await this.findByPlayerAndEvent([playerId], eventId);
    if (regItemOld.length > 0) {
      throw new Error(`Player ${playerId} is already registered for event ${eventId}`);
    }

    const event = await this.repo.em.findOne(EventEntity, eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const regItem = new EventRegisteredPlayersEntity();
    regItem.event = event;
    regItem.playerId = playerId;
    if (event.isPrescripted) {
      regItem.localId = await this.findNextFreeLocalId(eventId);
    }

    await this.repo.em.persistAndFlush(regItem);
    return { success: true };
  }

  async unregisterPlayer(eventId: number, playerId: number) {
    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(eventId))) {
      throw new Error("You don't have the necessary permissions to unregister players");
    }

    const regItem = await this.findByPlayerAndEvent([playerId], eventId);
    if (regItem.length === 0) {
      throw new Error(`Player ${playerId} is not registered for event ${eventId}`);
    }

    await this.repo.em.removeAndFlush(regItem[0]);
    return { success: true };
  }

  async updatePlayerSeatingFlag(payload: EventsUpdatePlayerSeatingFlagPayload) {
    const { eventId, playerId, ignoreSeating } = payload;

    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(eventId))) {
      throw new Error(
        "You don't have the necessary permissions to toggle seating flag for players"
      );
    }

    const regItem = await this.findByPlayerAndEvent([playerId], eventId);
    if (regItem.length === 0) {
      throw new Error(`Player ${playerId} is not registered for event ${eventId}`);
    }

    regItem[0].ignoreSeating = ignoreSeating ? 1 : 0;
    await this.repo.em.persistAndFlush(regItem[0]);
    return { success: true };
  }

  async updatePlayersLocalIds(payload: EventsUpdatePlayersLocalIdsPayload) {
    const { eventId, idsToLocalIds } = payload;

    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(eventId))) {
      throw new Error("You don't have the necessary permissions to update players' local IDs");
    }

    await this.updateLocalIds(eventId, idsToLocalIds);
    await this.repo.em.flush();
    return { success: true };
  }

  async updatePlayerReplacement(payload: EventsUpdatePlayerReplacementPayload) {
    const { eventId, playerId, replacementId } = payload;

    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !((await playerModel.isEventAdmin(eventId)) || (await playerModel.isEventReferee(eventId)))
    ) {
      throw new Error("You don't have the necessary permissions to update players' replacements");
    }

    const regItem = await this.findByPlayerAndEvent([playerId], eventId);
    if (regItem.length === 0) {
      throw new Error(`Player ${playerId} is not registered for event ${eventId}`);
    }

    regItem[0].replacementId = replacementId === -1 ? undefined : replacementId;
    await this.repo.em.persistAndFlush(regItem[0]);
    return { success: true };
  }

  async updatePlayersTeams(payload: EventsUpdatePlayersTeamsPayload) {
    const { eventId, idsToTeamNames } = payload;

    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(eventId))) {
      throw new Error("You don't have the necessary permissions to update players' teams");
    }

    await this.updateTeamNames(eventId, idsToTeamNames);
    await this.repo.em.flush();
    return { success: true };
  }
}
