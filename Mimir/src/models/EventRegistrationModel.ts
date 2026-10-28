import { LockMode, TransactionPropagation } from '@mikro-orm/core';
import { EventRegisteredPlayersEntity } from '../entities/EventRegisteredPlayers.entity.js';
import { Model } from './Model.js';
import { EventEntity } from '../entities/Event.entity.js';
import { PlayerModel } from './PlayerModel.js';
import {
  EventsUpdatePlayerReplacementPayload,
  EventsUpdatePlayerSeatingFlagPayload,
  EventsUpdatePlayersLocalIdsPayload,
  EventsUpdatePlayersTeamsPayload,
} from 'tsclients/proto/mimir.pb.js';
import {
  LocalIdMapping,
  TeamMapping,
  SessionStatus,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { filterPersonalData } from '../helpers/filterPersonalData.js';

export class EventRegistrationModel extends Model {
  async findByPlayerAndEvent(ids: number[], eventId: number) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        event: this.repo.em.getReference(EventEntity, eventId),
        playerId: { $in: ids },
      },
    });
  }

  async findByEventId(eventIds: number[]) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        event: {
          id: {
            $in: eventIds,
          },
        },
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
    const registrations = await this.findByEventId([eventId]);
    const byPlayerId = new Map(
      registrations.map((registration) => [registration.playerId, registration])
    );
    if (byPlayerId.size !== registrations.length) {
      throw new Error(
        `Event ${eventId} has duplicate registrations; repair them before assigning local IDs`
      );
    }

    const playerIds = new Set<number>();
    const localIds = new Set<number>();
    for (const { playerId, localId } of idMap) {
      if (!byPlayerId.has(playerId)) {
        throw new Error(`Player ${playerId} is not registered for event ${eventId}`);
      }
      if (playerIds.has(playerId)) {
        throw new Error(`Player ${playerId} occurs more than once in the local ID mapping`);
      }
      if (!Number.isInteger(localId) || localId <= 0 || localId > 2147483647) {
        throw new Error('Local IDs must be positive 32-bit integers');
      }
      if (localIds.has(localId)) {
        throw new Error(`Local ID ${localId} is assigned more than once`);
      }
      playerIds.add(playerId);
      localIds.add(localId);
    }
    for (const registration of registrations) {
      if (
        !playerIds.has(registration.playerId) &&
        registration.localId != null &&
        localIds.has(registration.localId)
      ) {
        throw new Error(
          `Local ID ${registration.localId} belongs to a player outside the submitted mapping`
        );
      }
    }

    // Free only the submitted players' IDs before assigning them, so swaps work
    // with the immediate unique constraint on (event_id, local_id).
    for (const { playerId } of idMap) {
      byPlayerId.get(playerId)!.localId = null;
    }
    await this.repo.em.flush();
    for (const { playerId, localId } of idMap) {
      byPlayerId.get(playerId)!.localId = localId;
    }
    await this.repo.em.flush();
  }

  async updateTeamNames(eventId: number, teamMap: TeamMapping[]) {
    const registrations = await this.findByEventId([eventId]);
    const byPlayerId = new Map(
      registrations.map((registration) => [registration.playerId, registration])
    );
    if (byPlayerId.size !== registrations.length) {
      throw new Error(
        `Event ${eventId} has duplicate registrations; repair them before assigning teams`
      );
    }
    const playerIds = new Set<number>();
    for (const { playerId } of teamMap) {
      if (!byPlayerId.has(playerId)) {
        throw new Error(`Player ${playerId} is not registered for event ${eventId}`);
      }
      if (playerIds.has(playerId)) {
        throw new Error(`Player ${playerId} occurs more than once in the team mapping`);
      }
      playerIds.add(playerId);
    }
    for (const { playerId, teamName } of teamMap) {
      byPlayerId.get(playerId)!.teamName = teamName;
    }
  }

  async findIgnoredPlayersIdsByEvent(eventIds: number[]) {
    const result = await this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        event: { id: { $in: eventIds } },
        ignoreSeating: 1,
      },
    });
    return result.map((reg) => reg.playerId);
  }

  async fetchPlayersRegData(eventIds: number[]) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        event: {
          id: { $in: eventIds },
        },
      },
    });
  }

  async fetchPlayersRegDataByIds(eventIds: number[], playerIds: number[]) {
    return this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        event: {
          id: { $in: eventIds },
        },
        playerId: playerIds,
      },
    });
  }

  async fetchRegisteredPlayersByEvent(eventId: number) {
    const result = await this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: this.repo.em.getReference(EventEntity, eventId) },
    });
    const playerModel = this.getModel(PlayerModel);
    return playerModel
      .findById(result.map((reg) => reg.playerId))
      .then((players) => filterPersonalData(players));
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

  async findLocalIdsMapByEvent(eventId: number, localToReal = false) {
    const items = await this.findByEventId([eventId]);
    const result = new Map<number, number>();
    for (const item of items) {
      if (!item.localId) {
        continue;
      }
      if (localToReal) {
        result.set(item.localId, item.playerId);
      } else {
        result.set(item.playerId, item.localId);
      }
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
    return this.repo.em.transactional(
      async () => {
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

        if (!event.allowPlayerAppend) {
          const sessionsOfEvent = await this.repo.em.count(SessionEntity, {
            event: eventId,
          });
          if (sessionsOfEvent > 0) {
            throw new Error(
              `Cannot register players for event ${eventId} as it is already started`
            );
          }
        }
        const regItem = new EventRegisteredPlayersEntity();
        regItem.event = event;
        regItem.playerId = playerId;
        regItem.ignoreSeating = 0;
        if (event.isPrescripted) {
          regItem.localId = await this.findNextFreeLocalId(eventId);
        }

        this.repo.em.persist(regItem);
        return { success: true };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async unregisterPlayer(eventId: number, playerId: number) {
    return this.repo.em.transactional(
      async () => {
        // Check if we have rights to update the event
        const playerModel = this.getModel(PlayerModel);
        if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(eventId))) {
          throw new Error("You don't have the necessary permissions to unregister players");
        }

        const regItem = await this.findByPlayerAndEvent([playerId], eventId);
        if (regItem.length === 0) {
          throw new Error(`Player ${playerId} is not registered for event ${eventId}`);
        }

        this.repo.em.remove(regItem[0]);
        return { success: true };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async updatePlayerSeatingFlag(payload: EventsUpdatePlayerSeatingFlagPayload) {
    return this.repo.em.transactional(
      async () => {
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

        const event = await this.repo.em.findOneOrFail(EventEntity, eventId);
        if (event.syncStart && !event.isOnline) {
          const activeSessions = await this.repo.em.count(SessionEntity, {
            event: eventId,
            status: {
              $in: [
                SessionStatus.SESSION_STATUS_INPROGRESS,
                SessionStatus.SESSION_STATUS_PREFINISHED,
              ],
            },
          });
          if (
            event.gamesStatus === TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY ||
            activeSessions > 0
          ) {
            throw new Error('Cannot change seating flags while games are still in progress');
          }
        }

        regItem[0].ignoreSeating = ignoreSeating ? 1 : 0;
        this.repo.em.persist(regItem[0]);
        return { success: true };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async updatePlayersLocalIds(payload: EventsUpdatePlayersLocalIdsPayload) {
    return this.repo.em.transactional(
      async () => {
        const { eventId, idsToLocalIds } = payload;

        // Check if we have rights to update the event
        const playerModel = this.getModel(PlayerModel);
        if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(eventId))) {
          throw new Error("You don't have the necessary permissions to update players' local IDs");
        }

        // Serialize local-ID forms for this event, including their temporary clears.
        await this.repo.em.findOneOrFail(EventEntity, eventId, {
          lockMode: LockMode.PESSIMISTIC_WRITE,
        });
        await this.updateLocalIds(eventId, idsToLocalIds);

        return { success: true };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async updatePlayerReplacement(payload: EventsUpdatePlayerReplacementPayload) {
    return this.repo.em.transactional(
      async () => {
        const { eventId, playerId, replacementId } = payload;

        // Check if we have rights to update the event
        const playerModel = this.getModel(PlayerModel);
        if (
          !this.repo.meta.personId ||
          !(
            (await playerModel.isEventAdmin(eventId)) || (await playerModel.isEventReferee(eventId))
          )
        ) {
          throw new Error(
            "You don't have the necessary permissions to update players' replacements"
          );
        }

        const regItem = await this.findByPlayerAndEvent([playerId], eventId);
        if (regItem.length === 0) {
          throw new Error(`Player ${playerId} is not registered for event ${eventId}`);
        }

        regItem[0].replacementId = replacementId === -1 ? undefined : replacementId;
        this.repo.em.persist(regItem[0]);
        return { success: true };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async updatePlayersTeams(payload: EventsUpdatePlayersTeamsPayload) {
    return this.repo.em.transactional(
      async () => {
        const { eventId, idsToTeamNames } = payload;

        // Check if we have rights to update the event
        const playerModel = this.getModel(PlayerModel);
        if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(eventId))) {
          throw new Error("You don't have the necessary permissions to update players' teams");
        }

        await this.updateTeamNames(eventId, idsToTeamNames);
        return { success: true };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }
}
