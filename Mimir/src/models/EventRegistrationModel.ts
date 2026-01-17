import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { Model } from './Model.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { PlayerModel } from './PlayerModel.js';

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

  async updateLocalIds(eventId: number, idMap: Map<number, number>) {
    return this.repo.em.upsertMany(
      EventRegisteredPlayersEntity,
      [
        ...idMap.entries().map(([id, localId]) => ({
          playerId: id,
          eventId,
          localId,
          ignoreSeating: 0,
        })),
      ],
      { onConflictFields: ['localId'] }
    );
  }

  async updateTeamNames(eventId: number, teamMap: Map<number, string>) {
    return this.repo.em.upsertMany(
      EventRegisteredPlayersEntity,
      [
        ...teamMap.entries().map(([id, teamName]) => ({
          playerId: id,
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
}
