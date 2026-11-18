import {
  PersonsCreateAccountPayload,
  PersonsCreateAccountResponse,
  PersonsFindByMajsoulIdsPayload,
  PersonsFindByRoninIdsPayload,
  PersonsFindByTenhouIdsPayload,
  PersonsFindByTenhouIdsResponse,
  PersonsFindByTitlePayload,
  PersonsFindByTitleResponse,
  PersonsGetMajsoulNicknamesPayload,
  PersonsGetMajsoulNicknamesResponse,
  PersonsGetNotificationsSettingsPayload,
  PersonsGetNotificationsSettingsResponse,
  PersonsGetPersonalInfoPayload,
  PersonsGetPersonalInfoResponse,
  PersonsSetNotificationsSettingsPayload,
  PersonsUpdatePersonalInfoPayload,
} from 'tsclients/proto/frey.pb';
import { writeFile } from 'fs/promises';
import { emailRe } from '../helpers/email';
import { makeHashes, verifyHash } from '../helpers/auth';
import { Database } from '../database/db';
import { Context } from '../context';
import { GenericSuccessResponse } from 'tsclients/proto/atoms.pb';
import { env } from '../helpers/env';
import { sql } from 'kysely';
import { RowMajsoulPlatformAccount, RowPerson } from '../database/schema';
import { Rights } from '../helpers/rights';
import { IRedisClient } from '../helpers/cache/RedisClient';
import { getNotificationSettingsCacheKey, getPersonalInfoCacheKey } from '../helpers/cache/schema';
import { getCachedPersonalData } from '../helpers/cache/personalData';
import { getSuperadminFlag } from './access';
import {
  PERSON_LOOKUP_BATCH_SIZE,
  PersonProfile,
  readPersonProfilePages,
  selectPersonProfile,
} from '../database/profiles';
import {
  ActionNotAllowedError,
  DataMalformedError,
  ExistsError,
  NotFoundError,
} from '../helpers/errors';
import { clearStatCache } from '../helpers/mimir';
import { uploadAvatar } from '../helpers/avatars';

export async function createAccount(
  db: Database,
  redisClient: IRedisClient,
  personsCreateAccountPayload: PersonsCreateAccountPayload,
  context: Context
): Promise<PersonsCreateAccountResponse> {
  if (
    personsCreateAccountPayload.email.length === 0 ||
    personsCreateAccountPayload.title.length === 0 ||
    personsCreateAccountPayload.password.length === 0
  ) {
    throw new DataMalformedError('Some of required field are empty');
  }
  if (!emailRe.test(personsCreateAccountPayload.email)) {
    throw new DataMalformedError('Email address is malformed');
  }

  if (
    !context.isInternalQuery &&
    (!context.personId ||
      !(await getSuperadminFlag(db, redisClient, { personId: context.personId })).isAdmin)
  ) {
    throw new ActionNotAllowedError('This action is not allowed');
  }

  if (!context.isInternalQuery) {
    const [caller] = await getCachedPersonalData(db, redisClient, context.personId!);
    await verifyHash(context.authToken ?? '', caller?.auth_hash ?? '');
  }

  const duplicates = await db
    .selectFrom('person')
    .where('email', '=', personsCreateAccountPayload.email)
    .select(({ fn }) => fn.count('id').as('count'))
    .execute();

  if (Number(duplicates[0].count) > 0) {
    // TODO: remove registration bruteforce email checking?
    throw new ExistsError('This account is already registered');
  }
  const hashes = await makeHashes(personsCreateAccountPayload.password);
  const value = {
    auth_hash: hashes.hash,
    auth_salt: hashes.salt,
    city: personsCreateAccountPayload.city,
    country: personsCreateAccountPayload.country,
    disabled: 0,
    last_update: new Date().toISOString(),
    email: personsCreateAccountPayload.email,
    phone: personsCreateAccountPayload.phone,
    tenhou_id: personsCreateAccountPayload.tenhouId,
    ronin_id:
      personsCreateAccountPayload.roninId === '' ? null : personsCreateAccountPayload.roninId,
    title: personsCreateAccountPayload.title,
  };
  const result = await db
    .insertInto('person')
    .values(value)
    .returning('id')
    .execute()
    .catch(rethrowRoninIdTaken);

  if (env.development) {
    await writeFile(
      '/tmp/dump_users.txt',
      '==> User created: ' +
        JSON.stringify(
          {
            id: result[0].id,
            email: personsCreateAccountPayload.email,
            impersonateUrl: `${env.forsetiUrl}/profile/impersonate/${result[0].id}/${hashes.clientHash}`,
          },
          undefined,
          '  '
        ),
      { flag: 'a+' }
    );
    if (context.isInternalQuery) {
      await writeFile(
        '/tmp/admin_creds.json',
        JSON.stringify({ id: Number(result[0].id), hash: hashes.clientHash })
      );
    }
  }

  return { personId: Number(result[0].id) };
}

export async function depersonalizeAccount(
  db: Database,
  redisClient: IRedisClient,
  context: Context
): Promise<GenericSuccessResponse> {
  if (context.personId === null || context.authToken === null) {
    throw new ActionNotAllowedError('Should be logged in to depersonalize');
  }

  const result = await db
    .selectFrom('person')
    .where('id', '=', context.personId)
    .selectAll()
    .execute();

  if (result.length === 0) {
    throw new NotFoundError('Person not found in database');
  }

  await verifyHash(context.authToken, result[0].auth_hash);

  const city = '';
  const country = '';
  const title = '[Deleted account #' + context.personId + ']';
  const tenhouId = '';
  const phone = '';

  const promises = [];
  if (env.userinfoHook) {
    promises.push(
      fetch(env.userinfoHook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': env.userinfoHookApiKey,
        },
        body: JSON.stringify({
          city,
          country,
          title,
          person_id: context.personId,
          tenhou_id: tenhouId,
          ronin_id: '',
        }),
      })
    );
  }

  if (env.gullveigUrl) {
    promises.push(
      fetch(env.gullveigUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: context.personId,
          avatar: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', // empty image
        }),
      })
    );
  }

  promises.push(clearStatCache(context.personId));

  promises.push(
    db
      .updateTable('person')
      .set({
        country,
        city,
        title,
        tenhou_id: '',
        ronin_id: null,
        phone,
        has_avatar: 0,
        telegram_id: '',
        auth_hash: '',
        auth_salt: '',
        auth_reset_token: '',
        auth_reset_expires_at: null,
      })
      .where('id', '=', context.personId)
      .execute()
  );

  promises.push(redisClient.remove(getPersonalInfoCacheKey(context.personId)));
  await Promise.all(promises);

  return { success: true };
}

export async function findByMajsoulAccountId(
  db: Database,
  payload: PersonsFindByMajsoulIdsPayload,
  context: Context
): Promise<PersonsFindByTenhouIdsResponse> {
  return findByOnlineIds(
    db,
    'majsoul',
    payload.ids.map((id) => id.nickname),
    context
  );
}

export async function findByTenhouIds(
  db: Database,
  payload: PersonsFindByTenhouIdsPayload,
  context: Context
): Promise<PersonsFindByTenhouIdsResponse> {
  return findByOnlineIds(db, 'tenhou', payload.ids, context);
}

export async function findByRoninIds(
  db: Database,
  payload: PersonsFindByRoninIdsPayload,
  context: Context
): Promise<PersonsFindByTenhouIdsResponse> {
  return findByOnlineIds(db, 'ronin', payload.ids, context);
}

function* uniqueLookupBatches<T>(ids: T[]) {
  const seen = new Set<T>();
  let batch: T[] = [];
  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    batch.push(id);
    if (batch.length === PERSON_LOOKUP_BATCH_SIZE) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) {
    yield batch;
  }
}

function selectPrivateDataPermission(db: Database, personId: number) {
  return db
    .selectFrom('person_access')
    .where('person_id', '=', personId)
    .where('acl_name', '=', Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA)
    .where('acl_value', '=', 1)
    .select('id')
    .limit(1);
}

async function canReadPrivateProfiles(db: Database, context: Context) {
  if (context.personId === null) {
    return false;
  }
  const [currentPerson, rights] = await Promise.all([
    db
      .selectFrom('person')
      .where('id', '=', context.personId)
      .select(['auth_hash', 'is_superadmin'])
      .executeTakeFirst(),
    selectPrivateDataPermission(db, context.personId).execute(),
  ]);
  const withPrivateData = !!currentPerson?.is_superadmin || rights.length > 0;
  if (withPrivateData) {
    await verifyHash(context.authToken ?? '', currentPerson?.auth_hash ?? '');
  }
  return withPrivateData;
}

function toPersonInfo(r: PersonProfile, withPrivateData: boolean) {
  return {
    id: r.id,
    city: r.city ?? '',
    tenhouId: r.tenhou_id ?? '',
    title: r.title,
    country: r.country,
    email: withPrivateData ? r.email : '',
    phone: withPrivateData ? (r.phone ?? '') : '',
    hasAvatar: r.has_avatar === 1,
    lastUpdate: (r.last_update ? new Date(r.last_update) : new Date()).toISOString(),
    msNickname: r.nickname ?? '',
    msAccountId: r.account_id ?? 0,
    telegramId: r.telegram_id ?? '',
    notifications: r.notifications ?? '',
    roninId: r.ronin_id ?? '',
  };
}

async function findByOnlineIds(
  db: Database,
  platform: 'tenhou' | 'ronin' | 'majsoul',
  ids: string[],
  context: Context
): Promise<PersonsFindByTenhouIdsResponse> {
  const withPrivateData = await canReadPrivateProfiles(db, context);
  const people: PersonsFindByTenhouIdsResponse['people'] = [];
  const seen = new Set<number>();
  for (const batch of uniqueLookupBatches(ids)) {
    const query = selectPersonProfile(db).where((eb) =>
      platform === 'ronin'
        ? eb(
            eb.fn('lower', ['person.ronin_id']),
            'in',
            batch.map((id) => eb.fn('lower', [eb.val(id)]))
          )
        : eb(
            platform === 'tenhou' ? 'person.tenhou_id' : 'majsoul_platform_account.nickname',
            'in',
            batch
          )
    );
    for await (const rows of readPersonProfilePages(query)) {
      for (const row of rows) {
        // Case variants of a Ronin ID in different batches can match the same person.
        if (!seen.has(row.id)) {
          seen.add(row.id);
          people.push(toPersonInfo(row, withPrivateData));
        }
      }
    }
  }
  return { people };
}

export async function findByTitle(
  db: Database,
  payload: PersonsFindByTitlePayload
): Promise<PersonsFindByTitleResponse> {
  const persons = await db
    .selectFrom('person')
    .where((eb) =>
      eb(
        sql`to_tsvector('simple', coalesce(title, ''))`,
        '@@',
        sql`to_tsquery('simple', ${eb.val(
          payload.query
            .split(' ')
            .map((w) => w + ':*')
            .join(' & ')
        )})`
      )
    )
    .select(['id', 'city', 'tenhou_id', 'ronin_id', 'title', 'has_avatar', 'last_update'])
    .limit(10)
    .execute();

  return {
    people: persons.map((r) => ({
      id: r.id ?? 0,
      city: r.city ?? '',
      tenhouId: r.tenhou_id ?? '',
      title: r.title,
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ? new Date(r.last_update) : new Date()).toISOString(),
      roninId: r.ronin_id ?? '',
    })),
  };
}

export async function getMajsoulNicknames(
  db: Database,
  payload: PersonsGetMajsoulNicknamesPayload
): Promise<PersonsGetMajsoulNicknamesResponse> {
  const mapping: PersonsGetMajsoulNicknamesResponse['mapping'] = [];
  for (const batch of uniqueLookupBatches(payload.ids)) {
    const rows = await db
      .selectFrom('majsoul_platform_account')
      .where('person_id', 'in', batch)
      .select(['nickname', 'person_id'])
      .execute();
    for (const row of rows) {
      mapping.push({ personId: row.person_id, nickname: row.nickname });
    }
  }
  return { mapping };
}

export async function getNotificationsSettings(
  db: Database,
  redisClient: IRedisClient,
  payload: PersonsGetNotificationsSettingsPayload
): Promise<PersonsGetNotificationsSettingsResponse> {
  let data = await redisClient.get<PersonsGetNotificationsSettingsResponse | null>(
    getNotificationSettingsCacheKey(payload.personId),
    null
  );

  if (data === null) {
    const result = await db
      .selectFrom('person')
      .where('id', '=', payload.personId)
      .select(['telegram_id', 'notifications'])
      .execute();
    data = {
      telegramId: result[0].telegram_id ?? '',
      notifications: result[0].notifications ?? '',
    };
    await redisClient.set(getNotificationSettingsCacheKey(payload.personId), data);
  }

  return data;
}

async function* getPersonData(db: Database, redisClient: IRedisClient, ids: number[]) {
  if (ids.length === 1) {
    yield await getCachedPersonalData(db, redisClient, ids[0]);
    return;
  }

  for (const batch of uniqueLookupBatches(ids)) {
    yield await selectPersonProfile(db).where('person.id', 'in', batch).execute();
  }
}

export async function getPersonalInfo(
  db: Database,
  redisClient: IRedisClient,
  payload: PersonsGetPersonalInfoPayload,
  context: Context
): Promise<PersonsGetPersonalInfoResponse> {
  const [currentPersonData, rights] =
    context.personId === null
      ? [[], []]
      : await Promise.all([
          getCachedPersonalData(db, redisClient, context.personId),
          selectPrivateDataPermission(db, context.personId).execute(),
        ]);

  const canReadAllPrivateData = !!currentPersonData[0]?.is_superadmin || rights.length > 0;
  const includesSelf = context.personId !== null && payload.ids.includes(context.personId);
  if (canReadAllPrivateData || includesSelf) {
    await verifyHash(context.authToken ?? '', currentPersonData[0]?.auth_hash ?? '');
  }

  const people: PersonsGetPersonalInfoResponse['people'] = [];
  for await (const rows of getPersonData(db, redisClient, payload.ids)) {
    for (const row of rows) {
      people.push(toPersonInfo(row, canReadAllPrivateData || row.id === context.personId));
    }
  }
  return { people };
}

export async function setNotificationsSettings(
  db: Database,
  redisClient: IRedisClient,
  payload: PersonsSetNotificationsSettingsPayload,
  context: Context
): Promise<GenericSuccessResponse> {
  if (!context.personId || !context.authToken) {
    throw new ActionNotAllowedError('Should be logged in to use this function');
  }
  const [caller] = await getCachedPersonalData(db, redisClient, context.personId);
  await verifyHash(context.authToken, caller?.auth_hash ?? '');

  const data = await getCachedPersonalData(db, redisClient, payload.personId);

  if (data.length === 0) {
    throw new NotFoundError('Person is not known to the system');
  }

  const isSuperadmin = (await getSuperadminFlag(db, redisClient, { personId: context.personId }))
    .isAdmin;

  if (payload.personId !== context.personId && !isSuperadmin) {
    throw new ActionNotAllowedError('You can only update your own settings');
  }

  await Promise.all([
    db
      .updateTable('person')
      .set({
        telegram_id: payload.telegramId,
        notifications: payload.notifications,
      })
      .where('id', '=', payload.personId)
      .execute(),
    redisClient.remove(getNotificationSettingsCacheKey(payload.personId)),
  ]);
  return { success: true };
}

function rethrowRoninIdTaken(error: unknown): never {
  if (
    error instanceof Error &&
    'constraint' in error &&
    error.constraint === 'person_ronin_id_lower'
  ) {
    throw new ExistsError('Ronin ID is already taken');
  }
  throw error;
}

async function assertRoninIdFree(db: Database, personId: number, roninId: string) {
  const owners = await db
    .selectFrom('person')
    .where('id', '!=', personId)
    .where((eb) => eb(eb.fn('lower', ['ronin_id']), '=', eb.fn('lower', [eb.val(roninId)])))
    .select('id')
    .execute();
  if (owners.length > 0) {
    throw new ExistsError('Ronin ID is already taken');
  }
}

export async function updatePersonalInfo(
  db: Database,
  redisClient: IRedisClient,
  payload: PersonsUpdatePersonalInfoPayload,
  context: Context
): Promise<GenericSuccessResponse> {
  if (payload.title.length === 0) {
    throw new DataMalformedError('Some of required field are empty');
  }

  if (!context.personId || !context.authToken) {
    throw new ActionNotAllowedError('Should be logged in to use this function');
  }
  const [caller] = await getCachedPersonalData(db, redisClient, context.personId);
  await verifyHash(context.authToken, caller?.auth_hash ?? '');

  const isSuperadmin = (await getSuperadminFlag(db, redisClient, { personId: context.personId }))
    .isAdmin;
  if (context.personId !== payload.id && !isSuperadmin) {
    throw new ActionNotAllowedError('This action is not allowed');
  }

  if (isSuperadmin && payload.email.length === 0) {
    throw new DataMalformedError('Some of required field are empty');
  }
  if (payload.roninId) {
    await assertRoninIdFree(db, payload.id, payload.roninId);
  }

  // Do not persist a successful profile update until storage has accepted the image.
  await uploadAvatar(env.gullveigUrl, payload.id, payload.avatarData, env.internalQuerySecret);

  const value: Partial<RowPerson> = {
    city: payload.city,
    country: payload.country,
    has_avatar: payload.hasAvatar ? 1 : 0,
    last_update: new Date().toISOString(),
    phone: payload.phone,
    tenhou_id: payload.tenhouId,
    title: payload.title,
  };
  if (payload.roninId !== undefined) {
    value.ronin_id = payload.roninId === '' ? null : payload.roninId;
  }

  if (isSuperadmin) {
    // allow superadmin to change emails of users
    value.email = payload.email;
    value.auth_reset_token = null;
    value.auth_reset_expires_at = null;
  }

  await db
    .updateTable('person')
    .set(value)
    .where('id', '=', payload.id)
    .execute()
    .catch(rethrowRoninIdTaken);

  const promises = [];
  if (env.userinfoHook) {
    promises.push(
      fetch(env.userinfoHook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': env.userinfoHookApiKey,
        },
        body: JSON.stringify({
          email: payload.email,
          city: payload.city,
          country: payload.country,
          title: payload.title,
          person_id: payload.id,
          tenhou_id: payload.tenhouId,
          ronin_id: payload.roninId,
        }),
      })
    );
  }

  promises.push(clearStatCache(payload.id));

  let soulAcc: Array<{
    account_id: number;
    friend_id: number;
    id: number;
    nickname: string;
    person_id: number;
  }> = [];
  try {
    soulAcc = await db
      .selectFrom('majsoul_platform_account')
      .where('person_id', '=', payload.id)
      .selectAll()
      .execute();
  } catch {
    // no account found - it's fine
  }

  const msValue: Partial<RowMajsoulPlatformAccount> = {
    ...(soulAcc.length > 0 ? soulAcc[0] : {}),
  };
  // forseti sends -1 in accountId and friendId when updating profile through user interface
  if (payload.msAccountId != null && payload.msAccountId != -1) {
    msValue.account_id = payload.msAccountId;
  }
  if (payload.msFriendId != null && payload.msFriendId != -1) {
    msValue.friend_id = payload.msFriendId;
  }
  if (payload.msNickname != null) {
    msValue.nickname = payload.msNickname;
  }
  if (
    msValue.account_id !== undefined &&
    msValue.friend_id !== undefined &&
    msValue.nickname !== undefined
  ) {
    msValue.person_id = payload.id;
    msValue.friend_id ??= 0;
    msValue.nickname ??= '';
    msValue.account_id ??= 0;
    if (soulAcc.length > 0) {
      promises.push(
        db
          .updateTable('majsoul_platform_account')
          .set(msValue)
          .where('person_id', '=', payload.id)
          .execute()
      );
    } else {
      promises.push(
        db
          .insertInto('majsoul_platform_account')
          .values(msValue as RowMajsoulPlatformAccount)
          .execute()
      );
    }
  }

  promises.push(redisClient.remove(getPersonalInfoCacheKey(payload.id)));
  await Promise.all(promises);
  return { success: true };
}
