import { randomUUID } from 'node:crypto';
import { PostgresQueryCompiler } from 'kysely';
import { createDbConstructor } from '../database/db';
import { PERSON_LOOKUP_BATCH_SIZE } from '../database/profiles';
import { makeHashes } from '../helpers/auth';
import { getCachedPersonalData } from '../helpers/cache/personalData';
import { RedisClientMock } from '../helpers/cache/RedisClient';
import { getPersonalInfoCacheKey } from '../helpers/cache/schema';
import { Rights } from '../helpers/rights';
import type { Context } from '../context';
import { me, quickAuthorize } from './auth';
import {
  findByMajsoulAccountId,
  findByRoninIds,
  findByTenhouIds,
  findByTitle,
  getMajsoulNicknames,
  getNotificationsSettings,
  getPersonalInfo,
} from './persons';

describe('Bounded profile reads', () => {
  const baseDb = createDbConstructor(true)();
  const compiler = new PostgresQueryCompiler();
  const queries: Array<{ sql: string; parameters: readonly unknown[]; rows?: number }> = [];
  const byQueryId = new WeakMap<object, (typeof queries)[number]>();
  const db = baseDb.withPlugin({
    transformQuery(args) {
      const compiled = compiler.compileQuery(args.node, args.queryId);
      const query = { sql: compiled.sql, parameters: compiled.parameters };
      queries.push(query);
      byQueryId.set(args.queryId, query);
      return args.node;
    },
    async transformResult(args) {
      byQueryId.get(args.queryId)!.rows = args.result.rows.length;
      return args.result;
    },
  });
  const prefix = `Profile${randomUUID().replaceAll('-', '')}`;
  let ids: number[] = [];
  let token: string;
  let redis: RedisClientMock;
  const context = (personId: number | null = null, authToken: string | null = null): Context => ({
    db,
    redisClient: redis,
    locale: 'en',
    currentEventId: null,
    isInternalQuery: false,
    personId,
    authToken,
  });
  const profileQueries = () => queries.filter((query) => query.sql.includes('left join'));

  beforeAll(async () => {
    const hashes = await makeHashes('profile-test');
    token = hashes.clientHash;
    const rows = await baseDb
      .insertInto('person')
      .values(
        Array.from({ length: PERSON_LOOKUP_BATCH_SIZE + 1 }, (_, index) => ({
          title: prefix,
          country: 'Test',
          email: `${prefix}${index}@example.test`,
          phone: '123321',
          auth_hash: hashes.hash,
          auth_salt: hashes.salt,
          auth_reset_token: 'unused-reset-token',
          auth_reset_expires_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          disabled: 0,
          tenhou_id: prefix,
          ronin_id: `${prefix}_${index}`,
          telegram_id: '123',
          notifications: 'test-settings',
        }))
      )
      .returning('id')
      .execute();
    ids = rows.map((row) => row.id);
    await baseDb
      .insertInto('majsoul_platform_account')
      .values(
        ids.map((id) => ({
          person_id: id,
          nickname: prefix,
          account_id: 1000000000 + id,
          friend_id: 1100000000 + id,
        }))
      )
      .execute();
  });

  beforeEach(() => {
    redis = new RedisClientMock();
    queries.length = 0;
  });

  afterAll(async () => {
    try {
      if (ids.length > 0) {
        await baseDb.deleteFrom('person').where('id', 'in', ids).execute();
      }
    } finally {
      await baseDb.destroy();
    }
  });

  it('returns complete, deduplicated bulk profiles with bounded queries and per-person privacy', async () => {
    const result = await getPersonalInfo(
      db,
      redis,
      { ids: [...ids, ...ids, -1] },
      context(ids[ids.length - 1], token)
    );
    expect(result.people.map((person) => person.id).sort((a, b) => a - b)).toEqual(ids);
    expect(result.people.filter((person) => person.email !== '')).toEqual([
      expect.objectContaining({ id: ids[ids.length - 1], phone: '123321' }),
    ]);
    const reads = profileQueries().filter((query) => query.sql.includes(' in ('));
    expect(reads).toHaveLength(2);
    for (const query of reads) {
      expect(query.parameters.length).toBeLessThanOrEqual(PERSON_LOOKUP_BATCH_SIZE);
      expect(query.rows).toBeLessThanOrEqual(PERSON_LOOKUP_BATCH_SIZE);
      expect(query.sql).not.toMatch(/\*|auth_|is_superadmin|last_login|friend_id/);
    }
    const privatePermission = queries.find((query) => query.sql.includes('person_access'))!;
    expect(privatePermission.sql).toContain('"acl_value" =');
    expect(privatePermission.sql).toContain('limit');
    expect(privatePermission.rows).toBeLessThanOrEqual(1);
  });

  it.each(['tenhou', 'majsoul'] as const)(
    'pages all people matching one %s identifier',
    async (platform) => {
      const result =
        platform === 'tenhou'
          ? await findByTenhouIds(db, { ids: [prefix, prefix] }, context())
          : await findByMajsoulAccountId(
              db,
              {
                ids: [
                  { nickname: prefix, accountId: 0 },
                  { nickname: prefix, accountId: 0 },
                ],
              },
              context()
            );
      expect(result.people.map((person) => person.id)).toEqual(ids);
      expect(result.people.every((person) => person.email === '' && person.phone === '')).toBe(
        true
      );
      expect(result.people[0]).toMatchObject({
        msNickname: prefix,
        msAccountId: 1000000000 + ids[0],
      });
      expect(profileQueries()).toHaveLength(2);
      for (const query of profileQueries()) {
        expect(query.rows).toBeLessThanOrEqual(PERSON_LOOKUP_BATCH_SIZE);
        expect(query.sql).toContain('order by "person"."id"');
        expect(query.sql).toContain('limit');
        expect(query.sql).not.toMatch(/\*|auth_|friend_id/);
      }
      expect(profileQueries()[1].sql).toContain('"person"."id" >');
    }
  );

  it('keeps case-insensitive Ronin matching unique across input batches', async () => {
    const roninId = `${prefix}_0`;
    const result = await findByRoninIds(
      db,
      {
        ids: [
          roninId,
          ...Array.from({ length: PERSON_LOOKUP_BATCH_SIZE }, (_, index) => `missing_${index}`),
          roninId.toUpperCase(),
        ],
      },
      context()
    );
    expect(result.people).toEqual([expect.objectContaining({ id: ids[0], roninId })]);
    expect(profileQueries()).toHaveLength(2);
    expect(
      profileQueries().every((query) => query.parameters.length <= PERSON_LOOKUP_BATCH_SIZE + 1)
    ).toBe(true);
  });

  it('batches and deduplicates nickname mappings without truncating the response', async () => {
    const result = await getMajsoulNicknames(db, { ids: [...ids, ...ids, -1] });
    expect(result.mapping.map((item) => item.personId).sort((a, b) => a - b)).toEqual(ids);
    expect(result.mapping.every((item) => item.nickname === prefix)).toBe(true);
    expect(queries).toHaveLength(2);
    expect(queries.every((query) => query.parameters.length <= PERSON_LOOKUP_BATCH_SIZE)).toBe(
      true
    );
    expect(queries.every((query) => query.rows! <= PERSON_LOOKUP_BATCH_SIZE)).toBe(true);
  });

  it('keeps a smaller shared cache usable by profile and authentication reads', async () => {
    const data = await getCachedPersonalData(db, redis, ids[0]);
    expect(data[0]).toMatchObject({ id: ids[0], account_id: 1000000000 + ids[0] });
    const cached = await redis.get<Record<string, unknown>[]>(getPersonalInfoCacheKey(ids[0]));
    for (const field of [
      'auth_salt',
      'auth_reset_token',
      'auth_reset_expires_at',
      'disabled',
      'friend_id',
      'person_id',
    ]) {
      expect(cached[0]).not.toHaveProperty(field);
    }
    const queryCount = queries.length;
    expect(await getCachedPersonalData(db, redis, ids[0])).toEqual(cached);
    expect(await quickAuthorize(db, redis, { personId: ids[0], authToken: token })).toEqual({
      authSuccess: true,
    });
    expect(await me(db, redis, context(ids[0], token))).toMatchObject({
      personId: ids[0],
      title: prefix,
    });
    expect(queries).toHaveLength(queryCount);
    await expect(
      quickAuthorize(db, redis, { personId: ids[0], authToken: 'wrong' })
    ).rejects.toMatchObject({ code: 'invalid_argument' });
  });

  it('selects only the notification fields and caches them', async () => {
    const result = await getNotificationsSettings(db, redis, { personId: ids[0] });
    expect(result).toEqual({ telegramId: '123', notifications: 'test-settings' });
    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toMatch(/^select "telegram_id", "notifications" from/);
    expect(await getNotificationsSettings(db, redis, { personId: ids[0] })).toEqual(result);
    expect(queries).toHaveLength(1);
  });

  it('keeps title search capped with its narrow projection', async () => {
    const result = await findByTitle(db, { query: prefix });
    expect(result.people).toHaveLength(10);
    expect(result.people.every((person) => person.title === prefix)).toBe(true);
    expect(queries[0].sql).not.toMatch(/\*|auth_|email|phone|notifications/);
  });

  it.each([0, 1])('preserves private-data permission value %i', async (value) => {
    const [rule] = await baseDb
      .insertInto('person_access')
      .values({
        person_id: ids[0],
        acl_name: Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA,
        acl_value: value,
        event_id: -1,
      })
      .returning('id')
      .execute();
    try {
      const result = await findByRoninIds(db, { ids: [`${prefix}_1`] }, context(ids[0], token));
      expect(result.people[0].email).toBe(value === 1 ? `${prefix}1@example.test` : '');
      if (value === 1) {
        await expect(
          findByTenhouIds(db, { ids: [prefix] }, context(ids[0], 'wrong'))
        ).rejects.toMatchObject({ code: 'invalid_argument' });
      }
    } finally {
      await baseDb.deleteFrom('person_access').where('id', '=', rule.id).execute();
    }
  });

  it('skips database work for empty anonymous lookups', async () => {
    expect(await getPersonalInfo(db, redis, { ids: [] }, context())).toEqual({ people: [] });
    expect(await findByTenhouIds(db, { ids: [] }, context())).toEqual({ people: [] });
    expect(await findByRoninIds(db, { ids: [] }, context())).toEqual({ people: [] });
    expect(await findByMajsoulAccountId(db, { ids: [] }, context())).toEqual({ people: [] });
    expect(await getMajsoulNicknames(db, { ids: [] })).toEqual({ mapping: [] });
    expect(queries).toHaveLength(0);
  });
});
