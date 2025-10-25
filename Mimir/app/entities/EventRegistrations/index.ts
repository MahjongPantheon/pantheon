import { EntityBase } from 'entities/EntityBase';

export class EventRegistrationsEntity extends EntityBase {
  async findByPlayerAndEvent(ids: number[], event_id: number) {
    return this.repo.db.client
      .selectFrom('event_registered_players')
      .where('event_id', '=', event_id)
      .where('player_id', 'in', ids)
      .execute();
  }

  async findByEventId(eventIds: number[]) {
    return this.repo.db.client
      .selectFrom('event_registered_players')
      .selectAll()
      .where('event_id', 'in', eventIds)
      .execute();
  }

  async findByPlayerId(player_id: number) {
    return this.repo.db.client
      .selectFrom('event_registered_players')
      .where('player_id', '=', player_id)
      .execute();
  }

  async findNextFreeLocalId(eventId: number) {
    const result = await this.repo.db.client
      .selectFrom('event_registered_players')
      .select('local_id')
      .where('event_id', '=', eventId)
      .orderBy('local_id', 'desc')
      .limit(1)
      .execute();
    if (result.length === 0) {
      return 1;
    }
    return (result[0].local_id ?? 0) + 1;
  }

  async updateLocalIds(eventId: number, idMap: Map<number, number>) {
    this.repo.db.client
      .insertInto('event_registered_players')
      .values([
        ...idMap.entries().map(([id, localId]) => ({
          player_id: id,
          event_id: eventId,
          local_id: localId,
          ignore_seating: 0,
        })),
      ])
      .onConflict((qb) =>
        qb.doUpdateSet((eb) => ({
          local_id: eb.ref('excluded.local_id'),
        }))
      );
  }

  async updateTeamNames(eventId: number, teamMap: Map<number, string>) {
    this.repo.db.client
      .insertInto('event_registered_players')
      .values([
        ...teamMap.entries().map(([id, teamName]) => ({
          player_id: id,
          event_id: eventId,
          team_name: teamName,
          ignore_seating: 0,
        })),
      ])
      .onConflict((qb) =>
        qb.doUpdateSet((eb) => ({
          team_name: eb.ref('excluded.team_name'),
        }))
      );
  }

  async findRegisteredPlayersIdsByEvent(eventId: number) {
    return (
      await this.repo.db.client
        .selectFrom('event_registered_players')
        .where('event_id', '=', eventId)
        .selectAll()
        .execute()
    ).map((reg) => ({
      id: reg.id,
      local_id: reg.local_id,
      ignore_seating: !!reg.ignore_seating,
    }));
  }

  async findIgnoredPlayersIdsByEvent(eventIds: number[]) {
    return (
      await this.repo.db.client
        .selectFrom('event_registered_players')
        .select('player_id')
        .where('event_id', 'in', eventIds)
        .where('ignore_seating', '=', 1)
        .execute()
    ).map((reg) => reg.player_id);
  }

  async fetchPlayersRegData(eventIds: number[]) {
    return await this.repo.db.client
      .selectFrom('event_registered_players')
      .select(['id', 'local_id', 'replacement_id', 'team_name'])
      .where('event_id', 'in', eventIds)
      .execute();
  }

  async fetchPlayersRegDataByIds(eventIds: number[], playerIds: number[]) {
    return await this.repo.db.client
      .selectFrom('event_registered_players')
      .select(['id', 'local_id', 'replacement_id'])
      .where('event_id', 'in', eventIds)
      .where('player_id', 'in', playerIds)
      .execute();
  }

  async fetchRegisteredPlayersByEvent(eventId: number) {
    const ids = (
      await this.repo.db.client
        .selectFrom('event_registered_players')
        .select('player_id')
        .where('event_id', '=', eventId)
        .execute()
    ).map((reg) => reg.player_id);

    return playerFindById(frey, cache, ids);
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
      if (!item.replacement_id) {
        continue;
      }
      result.set(item.replacement_id, item.player_id);
    }
    return result;
  }

  async findLocalIdsMapByEvent(eventId: number) {
    const items = await this.findByEventId([eventId]);
    const result = new Map<number, number>();
    for (const item of items) {
      if (!item.local_id) {
        continue;
      }
      result.set(item.player_id, item.local_id);
    }
    return result;
  }

  async findTeamNameMapByEvent(eventId: number) {
    const items = await this.findByEventId([eventId]);
    const result = new Map<number, string>();
    for (const item of items) {
      if (!item.team_name) {
        continue;
      }
      result.set(item.player_id, item.team_name);
    }
    return result;
  }
}
