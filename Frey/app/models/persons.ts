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
} from '../clients/proto/frey.pb';
import { emailRe } from '../helpers/email';
import { makeHashes } from '../helpers/auth';
import { Database } from '../database/db';
import { Context } from '../context';
import { GenericSuccessResponse } from '../clients/proto/atoms.pb';
import { env } from '../helpers/env';
import { sql } from 'kysely';
import { RowPerson } from '../database/schema';
import { Rights } from '../helpers/rights';
import { IRedisClient } from '../helpers/cache/RedisClient';
import { getPersonalInfoCacheKey } from '../helpers/cache/schema';
import { getCachedPersonalData } from '../helpers/cache/personalData';

export async function createAccount(
  db: Database,
  personsCreateAccountPayload: PersonsCreateAccountPayload
): Promise<PersonsCreateAccountResponse> {
  if (
    personsCreateAccountPayload.email.length === 0 ||
    personsCreateAccountPayload.title.length === 0 ||
    personsCreateAccountPayload.password.length === 0
  ) {
    throw new Error('Some of required field are empty');
  }
  if (!emailRe.test(personsCreateAccountPayload.email)) {
    throw new Error('Email address is malformed');
  }
  const duplicates = await db
    .selectFrom('person')
    .where('email', '=', personsCreateAccountPayload.email)
    .select(({ fn }) => fn.count('id').as('count'))
    .execute();

  if (Number(duplicates[0].count) > 0) {
    // TODO: remove registration bruteforce email checking?
    throw new Error('This account is already registered');
  }
  const hashes = await makeHashes(personsCreateAccountPayload.password);
  const value = {
    auth_hash: hashes.hash,
    auth_salt: hashes.salt,
    city: personsCreateAccountPayload.city,
    country: personsCreateAccountPayload.country,
    disabled: 0,
    last_update: new Date(),
    email: personsCreateAccountPayload.email,
    phone: personsCreateAccountPayload.phone,
    tenhou_id: personsCreateAccountPayload.tenhouId,
    title: personsCreateAccountPayload.title,
  };
  const result = await db.insertInto('person').values(value).execute();
  return { personId: Number(result[0].insertId) };
}

export async function depersonalizeAccount(
  db: Database,
  redisClient: IRedisClient,
  context: Context
): Promise<GenericSuccessResponse> {
  if (context.personId === null) {
    throw new Error('Should be logged in to depersonalize');
  }

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

  // TODO: trigger mimir's ClearStatCache

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
    .selectFrom('majsoul_platform_accounts')
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

  const withPrivateData =
    currentPerson[0].is_superadmin === 1 ||
    rights.filter((e) => e.acl_name === Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA).length > 0;

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
      lastUpdate: (r.last_update ?? new Date()).toISOString(),
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
      .leftJoin('majsoul_platform_accounts', 'majsoul_platform_accounts.person_id', 'person.id')
      .where('tenhou_id', 'in', payload.ids)
      .selectAll()
      .execute(),
    db.selectFrom('person').where('id', '=', context.personId).selectAll().execute(),
    db.selectFrom('person_access').where('person_id', '=', context.personId).selectAll().execute(),
  ]);

  const withPrivateData =
    currentPerson[0].is_superadmin === 1 ||
    rights.filter((e) => e.acl_name === Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA).length > 0;

  return {
    people: persons.map((r) => ({
      id: r.person_id ?? 0,
      city: r.city ?? '',
      tenhouId: r.tenhou_id ?? '',
      title: r.title,
      country: r.country,
      email: withPrivateData ? r.email : '',
      phone: withPrivateData ? (r.phone ?? '') : '',
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ?? new Date()).toISOString(),
      msNickname: r.nickname ?? '',
      msAccountId: r.account_id ?? 0,
      telegramId: r.telegram_id ?? '',
      notifications: r.notifications ?? '',
    })),
  };
}

export async function findByTitle(
  db: Database,
  payload: PersonsFindByTitlePayload,
  context: Context
): Promise<PersonsFindByTitleResponse> {
  const [persons, currentPerson, rights] = await Promise.all([
    db
      .selectFrom('person')
      .leftJoin('majsoul_platform_accounts', 'majsoul_platform_accounts.person_id', 'person.id')
      .selectAll()
      .where((eb) =>
        eb(
          sql`to_tsvector('simple', coalesce(title, '')`,
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
      .execute(),
    db.selectFrom('person').where('id', '=', context.personId).selectAll().execute(),
    db.selectFrom('person_access').where('person_id', '=', context.personId).selectAll().execute(),
  ]);

  const withPrivateData =
    currentPerson[0].is_superadmin === 1 ||
    rights.filter((e) => e.acl_name === Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA).length > 0;

  return {
    people: persons.map((r) => ({
      id: r.person_id ?? 0,
      city: r.city ?? '',
      tenhouId: r.tenhou_id ?? '',
      title: r.title,
      country: r.country,
      email: withPrivateData ? r.email : '',
      phone: withPrivateData ? (r.phone ?? '') : '',
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ?? new Date()).toISOString(),
      msNickname: r.nickname ?? '',
      msAccountId: r.account_id ?? 0,
      telegramId: r.telegram_id ?? '',
      notifications: r.notifications ?? '',
    })),
  };
}

export async function getMajsoulNicknames(
  db: Database,
  payload: PersonsGetMajsoulNicknamesPayload
): Promise<PersonsGetMajsoulNicknamesResponse> {
  const result = await db
    .selectFrom('majsoul_platform_accounts')
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
  payload: PersonsGetNotificationsSettingsPayload
): Promise<PersonsGetNotificationsSettingsResponse> {
  const result = await db
    .selectFrom('person')
    .where('id', '=', payload.personId)
    .selectAll()
    .execute();
  return {
    telegramId: result[0].telegram_id ?? '',
    notifications: result[0].notifications ?? '',
  };
}

async function getPersonData(db: Database, redisClient: IRedisClient, ids: number[]) {
  if (ids.length === 1) {
    return getCachedPersonalData(db, redisClient, ids[0]);
  }

  return db
    .selectFrom('person')
    .leftJoin('majsoul_platform_accounts', 'majsoul_platform_accounts.person_id', 'person.id')
    .where('person.id', 'in', ids)
    .selectAll()
    .execute();
}

export async function getPersonalInfo(
  db: Database,
  redisClient: IRedisClient,
  payload: PersonsGetPersonalInfoPayload,
  context: Context
): Promise<PersonsGetPersonalInfoResponse> {
  const [data, currentPerson, rights] = await Promise.all([
    getPersonData(db, redisClient, payload.ids),
    db.selectFrom('person').where('id', '=', context.personId).selectAll().execute(),
    db.selectFrom('person_access').where('person_id', '=', context.personId).selectAll().execute(),
  ]);

  const withPrivateData =
    currentPerson[0].is_superadmin === 1 ||
    rights.filter((e) => e.acl_name === Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA).length > 0;

  return {
    people: data.map((r) => ({
      id: r.person_id ?? 0,
      city: r.city ?? '',
      tenhouId: r.tenhou_id ?? '',
      title: r.title,
      country: r.country,
      email: withPrivateData ? r.email : '',
      phone: withPrivateData ? (r.phone ?? '') : '',
      hasAvatar: r.has_avatar === 1,
      lastUpdate: (r.last_update ?? new Date()).toISOString(),
      msNickname: r.nickname ?? '',
      msAccountId: r.account_id ?? 0,
      telegramId: r.telegram_id ?? '',
      notifications: r.notifications ?? '',
    })),
  };
}

export async function setNotificationsSettings(
  db: Database,
  payload: PersonsSetNotificationsSettingsPayload
): Promise<GenericSuccessResponse> {
  await db
    .updateTable('person')
    .where('id', '=', payload.personId)
    .set({
      telegram_id: payload.telegramId,
      notifications: payload.notifications,
    })
    .execute();
  return { success: true };
}

export async function updatePersonalInfo(
  db: Database,
  redisClient: IRedisClient,
  payload: PersonsUpdatePersonalInfoPayload,
  context: Context
): Promise<GenericSuccessResponse> {
  if (payload.email.length === 0 || payload.title.length === 0) {
    throw new Error('Some of required field are empty');
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

  // TODO: trigger mimir's ClearStatCache

  const value: Partial<RowPerson> = {
    city: payload.city,
    country: payload.country,
    has_avatar: payload.hasAvatar ? 1 : 0,
    phone: payload.phone,
    tenhou_id: payload.tenhouId,
    title: payload.title,
  };
  promises.push(db.updateTable('person').set(value).execute());
  promises.push(redisClient.remove(getPersonalInfoCacheKey(payload.id)));
  await Promise.all(promises);
  return { success: true };
}
