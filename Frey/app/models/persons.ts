import {
  PersonsCreateAccountPayload,
  PersonsCreateAccountResponse,
  PersonsFindByMajsoulIdsPayload,
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
  ActionNotAllowedError,
  DataMalformedError,
  ExistsError,
  NotFoundError,
} from '../helpers/errors';
import { clearStatCache } from '../helpers/mimir';

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
    title: personsCreateAccountPayload.title,
  };
  const result = await db.insertInto('person').values(value).returning('id').execute();

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
        phone,
        has_avatar: 0,
        telegram_id: '',
        auth_hash: '',
        auth_salt: '',
        auth_reset_token: '',
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
  const soulAccounts = await db
    .selectFrom('majsoul_platform_account')
    .where(
      'nickname',
      'in',
      payload.ids.map((i) => i.nickname)
    )
    .selectAll()
    .execute();
  const accById = soulAccounts.reduce(
    (acc, r) => {
      acc[r.person_id] = r;
      return acc;
    },
    {} as Record<number, (typeof soulAccounts)[number]>
  );

  const [persons, currentPerson, rights] = await Promise.all([
    db
      .selectFrom('person')
      .where(
        'id',
        'in',
        soulAccounts.map((r) => r.person_id)
      )
      .selectAll()
      .execute(),
    db.selectFrom('person').where('id', '=', context.personId).selectAll().execute(),
    db.selectFrom('person_access').where('person_id', '=', context.personId).selectAll().execute(),
  ]);

  let withPrivateData = false;
  if (
    currentPerson[0]?.is_superadmin ||
    rights.filter((e) => e.acl_name === Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA).length > 0
  ) {
    await verifyHash(context.authToken ?? '', currentPerson[0]?.auth_hash);
    withPrivateData = true;
  }

  return {
    people: persons.map((r) => ({
      id: r.id,
      city: r.city ?? '',
      tenhouId: r.tenhou_id ?? '',
      title: r.title,
      country: r.country,
      email: withPrivateData ? r.email : '',
      phone: withPrivateData ? (r.phone ?? '') : '',
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ? new Date(r.last_update) : new Date()).toISOString(),
      msNickname: accById[r.id].nickname,
      msAccountId: accById[r.id].account_id,
      telegramId: r.telegram_id ?? '',
      notifications: r.notifications ?? '',
    })),
  };
}

export async function findByTenhouIds(
  db: Database,
  payload: PersonsFindByTenhouIdsPayload,
  context: Context
): Promise<PersonsFindByTenhouIdsResponse> {
  const [persons, currentPerson, rights] = await Promise.all([
    db
      .selectFrom('person')
      .leftJoin('majsoul_platform_account', 'majsoul_platform_account.person_id', 'person.id')
      .where('person.tenhou_id', 'in', payload.ids)
      .selectAll('person')
      .select([
        'majsoul_platform_account.person_id',
        'majsoul_platform_account.account_id',
        'majsoul_platform_account.friend_id',
        'majsoul_platform_account.nickname',
      ])
      .execute(),
    db.selectFrom('person').where('id', '=', context.personId).selectAll().execute(),
    db.selectFrom('person_access').where('person_id', '=', context.personId).selectAll().execute(),
  ]);

  let withPrivateData = false;
  if (
    currentPerson[0]?.is_superadmin ||
    rights.filter((e) => e.acl_name === Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA).length > 0
  ) {
    await verifyHash(context.authToken ?? '', currentPerson[0]?.auth_hash);
    withPrivateData = true;
  }

  return {
    people: persons.map((r) => ({
      id: r.id ?? 0,
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
    })),
  };
}

export async function findByTitle(
  db: Database,
  payload: PersonsFindByTitlePayload
): Promise<PersonsFindByTitleResponse> {
  const persons = await db
    .selectFrom('person')
    .selectAll()
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
    .selectAll()
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
    })),
  };
}

export async function getMajsoulNicknames(
  db: Database,
  payload: PersonsGetMajsoulNicknamesPayload
): Promise<PersonsGetMajsoulNicknamesResponse> {
  const result = await db
    .selectFrom('majsoul_platform_account')
    .where('person_id', 'in', payload.ids)
    .select(['nickname', 'person_id'])
    .execute();
  return {
    mapping: result.map((item) => ({
      personId: item.person_id,
      nickname: item.nickname,
    })),
  };
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
      .selectAll()
      .execute();
    data = {
      telegramId: result[0].telegram_id ?? '',
      notifications: result[0].notifications ?? '',
    };
    await redisClient.set(getNotificationSettingsCacheKey(payload.personId), data);
  }

  return data;
}

async function getPersonData(db: Database, redisClient: IRedisClient, ids: number[]) {
  if (ids.length === 1) {
    return getCachedPersonalData(db, redisClient, ids[0]);
  }

  return db
    .selectFrom('person')
    .leftJoin('majsoul_platform_account', 'majsoul_platform_account.person_id', 'person.id')
    .where('person.id', 'in', ids)
    .selectAll('person')
    .select([
      'majsoul_platform_account.person_id',
      'majsoul_platform_account.account_id',
      'majsoul_platform_account.friend_id',
      'majsoul_platform_account.nickname',
    ])
    .execute();
}

export async function getPersonalInfo(
  db: Database,
  redisClient: IRedisClient,
  payload: PersonsGetPersonalInfoPayload,
  context: Context
): Promise<PersonsGetPersonalInfoResponse> {
  const [data, currentPersonData, rights] = await Promise.all([
    getPersonData(db, redisClient, payload.ids),
    getCachedPersonalData(db, redisClient, context.personId ?? 0),
    db.selectFrom('person_access').where('person_id', '=', context.personId).selectAll().execute(),
  ]);

  let withPrivateData = false;
  if (
    currentPersonData[0]?.is_superadmin ||
    rights.filter((e) => e.acl_name === Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA).length > 0
  ) {
    await verifyHash(context.authToken ?? '', currentPersonData[0]?.auth_hash);
    withPrivateData = true;
  }

  return {
    people: data.map((r) => ({
      id: r.id ?? 0,
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
    })),
  };
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

  const data = await getCachedPersonalData(db, redisClient, payload.personId);

  if (data.length === 0) {
    throw new NotFoundError('Person is not known to the system');
  }

  const isSuperadmin = (await getSuperadminFlag(db, redisClient, { personId: context.personId }))
    .isAdmin;

  if (payload.personId !== context.personId && !isSuperadmin) {
    throw new ActionNotAllowedError('You can only update your own settings');
  }

  const [personData] = data;

  if (!isSuperadmin) {
    await verifyHash(context.authToken, personData.auth_hash);
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

export async function updatePersonalInfo(
  db: Database,
  redisClient: IRedisClient,
  payload: PersonsUpdatePersonalInfoPayload,
  context: Context
): Promise<GenericSuccessResponse> {
  if (payload.title.length === 0) {
    throw new DataMalformedError('Some of required field are empty');
  }

  const isSuperadmin = (
    await getSuperadminFlag(db, redisClient, { personId: context.personId ?? -1 })
  ).isAdmin;
  if (context.personId !== payload.id && !isSuperadmin) {
    throw new ActionNotAllowedError('This action is not allowed');
  }

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
          person_id: context.personId,
          tenhou_id: payload.tenhouId,
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
          avatar: payload.avatarData,
        }),
      })
    );
  }

  if (context.personId) {
    promises.push(clearStatCache(context.personId));
  }

  const value: Partial<RowPerson> = {
    city: payload.city,
    country: payload.country,
    has_avatar: payload.hasAvatar ? 1 : 0,
    phone: payload.phone,
    tenhou_id: payload.tenhouId,
    title: payload.title,
  };

  if (isSuperadmin) {
    if (payload.email.length === 0) {
      throw new DataMalformedError('Some of required field are empty');
    }
    // allow superadmin to change emails of users
    value.email = payload.email;
  }

  promises.push(db.updateTable('person').set(value).where('id', '=', payload.id).execute());

  const soulAcc = await db
    .selectFrom('majsoul_platform_account')
    .where('person_id', '=', payload.id)
    .selectAll()
    .execute();

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
