import { playerInfo } from '../../helpers/cache/schema';
import { PersonEx } from 'tsclients/proto/atoms.pb';
import { fetchPlayersRegDataByIds, findReplacementMapByEvent } from './playerRegistration';
import { findByRepresentationalHash } from './session';
import { FreyService } from 'services/Frey';
import { DatabaseService } from 'services/Database';
import { CacheService } from 'services/Cache';

export async function findById(
  frey: FreyService,
  cache: CacheService,
  ids: number[],
  skipCache = false
): Promise<PersonEx[]> {
  let missingIds: number[] = [];
  const fetchedData = new Map<number, PersonEx>();
  const fetchedRemote = new Map<number, PersonEx>();

  if (!skipCache) {
    await Promise.all(
      ids.map((id) =>
        cache.client
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
    const data = await frey.GetPersonalInfo({
      ids: missingIds,
    });
    const promises: Promise<boolean>[] = [];
    data.people.forEach((person) => {
      promises.push(cache.client.set(playerInfo(person.id), person, 300));
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
  frey: FreyService,
  ids: string[]
): Promise<Record<string, PersonEx>> {
  const data = await frey.FindByTenhouIds({ ids });
  return data.people.reduce(
    (acc, player) => {
      acc[player.tenhouId] = player;
      return acc;
    },
    {} as Record<string, PersonEx>
  );
}

export async function findMajsoulAccounts(
  frey: FreyService,
  ids: [string, number][] // ms_nickname, ms_account_id
): Promise<Record<string, PersonEx>> {
  const data = await frey.FindByMajsoulAccountId({
    ids: ids.map(([nickname, accountId]) => ({ nickname, accountId })),
  });
  return data.people.reduce(
    (acc, player) => {
      acc[player.msNickname + '-' + player.msAccountId] = player;
      return acc;
    },
    {} as Record<string, PersonEx>
  );
}

export async function findPlayersForEvents(
  db: DatabaseService,
  frey: FreyService,
  cache: CacheService,
  eventIds: number[]
) {
  const registrationData = await findReplacementMapByEvent(db, eventIds);
  return _findPlayers(frey, cache, eventIds, registrationData);
}

export async function findPlayersForSession(
  db: DatabaseService,
  frey: FreyService,
  cache: CacheService,
  sessionHash: string,
  substituteReplacements = false
) {
  const session = await findByRepresentationalHash(db, [sessionHash]);
  if (session.length === 0) {
    return { players: [] as PersonEx[], replaceMap: new Map<number, PersonEx>() };
  }
  const playerIds = (
    await db.client
      .selectFrom('session_player')
      .select(['player_id'])
      .where('session_id', '=', session[0].id)
      .orderBy('order', 'asc')
      .execute()
  ).map((reg) => reg.player_id);

  const registrationData = await fetchPlayersRegDataByIds(db, [session[0].event_id], playerIds);
  const replacements = new Map<number, number>();
  if (substituteReplacements) {
    for (const registration of registrationData) {
      if (registration.replacement_id) {
        replacements.set(registration.replacement_id, registration.id);
      }
    }
  }

  const playersData = await _findPlayers(frey, cache, playerIds, replacements);
  // reorder players to match order at the table
  playersData.players.sort((a, b) => playerIds.indexOf(a.id) - playerIds.indexOf(b.id));
  return playersData;
}

export async function _findPlayers(
  frey: FreyService,
  cache: CacheService,
  ids: number[],
  replacements: Map<number, number> // replacementId -> id : note backward map
) {
  const players = await findById(frey, cache, ids);
  const replaceMap = new Map<number, PersonEx>();

  if (replacements.size > 0) {
    const replacementPlayers = await findById(frey, cache, [...replacements.keys()]);
    for (const player of replacementPlayers) {
      if (replacements.has(player.id)) {
        replaceMap.set(replacements.get(player.id)!, player);
      }
    }
  }

  return { players, replaceMap };
}
