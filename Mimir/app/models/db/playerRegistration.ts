import { DatabaseService } from 'services/Database';
import { IRedisClient } from '../../helpers/cache/RedisClient';
import { findById as playerFindById } from './player';
import { FreyService } from 'services/Frey';

export async function findByPlayerAndEvent(db: DatabaseService, ids: number[], event_id: number) {
  return db.client
    .selectFrom('event_registered_players')
    .where('event_id', '=', event_id)
    .where('player_id', 'in', ids)
    .execute();
}

export async function findByEventId(db: DatabaseService, eventIds: number[]) {
  return db.client
    .selectFrom('event_registered_players')
    .selectAll()
    .where('event_id', 'in', eventIds)
    .execute();
}

export async function findByPlayerId(db: DatabaseService, player_id: number) {
  return db.client
    .selectFrom('event_registered_players')
    .where('player_id', '=', player_id)
    .execute();
}

export async function findNextFreeLocalId(db: DatabaseService, eventId: number) {
  const result = await db.client
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

export async function updateLocalIds(
  db: DatabaseService,
  eventId: number,
  idMap: Map<number, number>
) {
  db.client
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

export async function updateTeamNames(
  db: DatabaseService,
  eventId: number,
  teamMap: Map<number, string>
) {
  db.client
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

export async function findRegisteredPlayersIdsByEvent(db: DatabaseService, eventId: number) {
  return (
    await db.client
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

export async function findIgnoredPlayersIdsByEvent(db: DatabaseService, eventIds: number[]) {
  return (
    await db.client
      .selectFrom('event_registered_players')
      .select('player_id')
      .where('event_id', 'in', eventIds)
      .where('ignore_seating', '=', 1)
      .execute()
  ).map((reg) => reg.player_id);
}

export async function fetchPlayersRegData(db: DatabaseService, eventIds: number[]) {
  return await db.client
    .selectFrom('event_registered_players')
    .select(['id', 'local_id', 'replacement_id', 'team_name'])
    .where('event_id', 'in', eventIds)
    .execute();
}

export async function fetchPlayersRegDataByIds(
  db: DatabaseService,
  eventIds: number[],
  playerIds: number[]
) {
  return await db.client
    .selectFrom('event_registered_players')
    .select(['id', 'local_id', 'replacement_id'])
    .where('event_id', 'in', eventIds)
    .where('player_id', 'in', playerIds)
    .execute();
}

export async function fetchRegisteredPlayersByEvent(
  db: DatabaseService,
  frey: FreyService,
  cache: IRedisClient,
  eventId: number
) {
  const ids = (
    await db.client
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
export async function findReplacementMapByEvent(db: DatabaseService, eventIds: number[]) {
  const items = await findByEventId(db, eventIds);
  const result = new Map<number, number>();
  for (const item of items) {
    if (!item.replacement_id) {
      continue;
    }
    result.set(item.replacement_id, item.player_id);
  }
  return result;
}

export async function findLocalIdsMapByEvent(db: DatabaseService, eventId: number) {
  const items = await findByEventId(db, [eventId]);
  const result = new Map<number, number>();
  for (const item of items) {
    if (!item.local_id) {
      continue;
    }
    result.set(item.player_id, item.local_id);
  }
  return result;
}

export async function findTeamNameMapByEvent(db: DatabaseService, eventId: number) {
  const items = await findByEventId(db, [eventId]);
  const result = new Map<number, string>();
  for (const item of items) {
    if (!item.team_name) {
      continue;
    }
    result.set(item.player_id, item.team_name);
  }
  return result;
}
