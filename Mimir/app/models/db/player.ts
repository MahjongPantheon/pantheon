import { ClientConfiguration } from 'twirpscript';
import { FindByMajsoulAccountId, FindByTenhouIds, GetPersonalInfo } from 'tsclients/proto/frey.pb';
import { IRedisClient } from '../../helpers/cache/RedisClient';
import { playerInfo } from '../../helpers/cache/schema';
import { PersonEx } from 'tsclients/proto/atoms.pb';
import { Database } from '../../database/db';
import { fetchPlayersRegDataByIds, findReplacementMapByEvent } from './playerRegistration';
import { findByRepresentationalHash } from './session';

export async function findById(
  freyConfig: ClientConfiguration,
  cache: IRedisClient,
  ids: number[],
  skipCache = false
): Promise<PersonEx[]> {
  let missingIds: number[] = [];
  const fetchedData = new Map<number, PersonEx>();
  const fetchedRemote = new Map<number, PersonEx>();

  if (!skipCache) {
    await Promise.all(
      ids.map((id) =>
        cache
          .get(playerInfo(id))
          .then((info) => {
            fetchedData.set(id, info as PersonEx);
          })
          .catch(() => {
            missingIds.push(id);
          })
      )
    );
  } else {
    missingIds = ids;
  }

  if (missingIds.length > 0) {
    const data = await GetPersonalInfo(
      {
        ids: missingIds,
      },
      freyConfig
    );
    const promises: Promise<boolean>[] = [];
    data.people.forEach((person) => {
      promises.push(cache.set(playerInfo(person.id), person, 300));
      fetchedRemote.set(person.id, person);
    });
    await Promise.all(promises);
  }

  const allData: PersonEx[] = [];
  for (const id of ids) {
    if (fetchedData.has(id)) {
      allData.push(fetchedData.get(id)!);
    }
    if (fetchedRemote.has(id)) {
      allData.push(fetchedRemote.get(id)!);
    }
  }

  return allData;
}

export async function findByTenhouId(
  freyConfig: ClientConfiguration,
  ids: string[]
): Promise<Record<string, PersonEx>> {
  const data = await FindByTenhouIds({ ids }, freyConfig);
  return data.people.reduce(
    (acc, player) => {
      acc[player.tenhouId] = player;
      return acc;
    },
    {} as Record<string, PersonEx>
  );
}

export async function findMajsoulAccounts(
  freyConfig: ClientConfiguration,
  ids: [string, number][] // ms_nickname, ms_account_id
): Promise<Record<string, PersonEx>> {
  const data = await FindByMajsoulAccountId(
    { ids: ids.map(([nickname, accountId]) => ({ nickname, accountId })) },
    freyConfig
  );
  return data.people.reduce(
    (acc, player) => {
      acc[player.msNickname + '-' + player.msAccountId] = player;
      return acc;
    },
    {} as Record<string, PersonEx>
  );
}

export async function findPlayersForEvents(
  db: Database,
  freyConfig: ClientConfiguration,
  cache: IRedisClient,
  eventIds: number[]
) {
  const registrationData = await findReplacementMapByEvent(db, eventIds);
  return _findPlayers(freyConfig, cache, eventIds, registrationData);
}

export async function findPlayersForSession(
  db: Database,
  freyConfig: ClientConfiguration,
  cache: IRedisClient,
  sessionHash: string
) {
  const session = await findByRepresentationalHash(db, [sessionHash]);
  if (session.length === 0) {
    return { players: [] as PersonEx[], replaceMap: new Map<number, PersonEx>() };
  }
  const playerIds = (
    await db
      .selectFrom('session_player')
      .select(['player_id'])
      .where('session_id', '=', session[0].id)
      .orderBy('order', 'asc')
      .execute()
  ).map((reg) => reg.player_id);

  const registrationData = await fetchPlayersRegDataByIds(db, [session[0].event_id], playerIds);
  const replacements = new Map<number, number>();
  for (const registration of registrationData) {
    if (registration.replacement_id) {
      replacements.set(registration.replacement_id, registration.id);
    }
  }

  const playersData = await _findPlayers(freyConfig, cache, playerIds, replacements);
  // reorder players to match order at the table
  playersData.players.sort((a, b) => playerIds.indexOf(a.id) - playerIds.indexOf(b.id));
  return playersData;
}

export async function _findPlayers(
  freyConfig: ClientConfiguration,
  cache: IRedisClient,
  ids: number[],
  replacements: Map<number, number> // replacementId -> id : note backward map
) {
  const players = await findById(freyConfig, cache, ids);
  const replacementPlayers = await findById(freyConfig, cache, [...replacements.keys()]);
  const replaceMap = new Map<number, PersonEx>();
  for (const player of replacementPlayers) {
    if (replacements.has(player.id)) {
      replaceMap.set(replacements.get(player.id)!, player);
    }
  }

  return { players, replaceMap };
}
