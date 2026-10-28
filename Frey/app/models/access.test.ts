import {
  addRuleForPerson,
  deleteRuleForPerson,
  getEventAdmins,
  getEventReferees,
  getOwnedEventIds,
  getSuperadminFlag,
} from './access';
import { verifyHash } from '../helpers/auth';
import { RedisClientMock } from '../helpers/cache/RedisClient';
import { getSuperadminCacheKey } from '../helpers/cache/schema';
import { Rights } from '../helpers/rights';
import type { Context } from '../context';
import type { Database } from '../database/db';

vi.mock('../helpers/auth', () => ({ verifyHash: vi.fn() }));
function fixture(
  options: {
    personId?: number | null;
    superadmin?: boolean;
    admins?: number[];
    registered?: boolean;
    rule?: { acl_name: string; event_id: number; person_id: number };
    existing?: string[];
  } = {}
) {
  const query = (rows: unknown[]) => ({
    selectAll: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    distinct: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    where: vi.fn(function (this: unknown, predicate: unknown) {
      if (typeof predicate === 'function') {
        const qb = Object.assign(vi.fn(), { and: vi.fn() });
        predicate(qb);
      }
      return this;
    }),
    execute: vi.fn().mockResolvedValue(rows),
  });
  let accessReads = 0;
  const db = {
    selectFrom: vi.fn((table: string) => {
      if (table === 'person')
        return query(
          options.registered === false
            ? []
            : [{ auth_hash: 'hash', is_superadmin: options.superadmin ? 1 : 0 }]
        );
      accessReads++;
      if (options.rule && accessReads === 1) return query([options.rule]);
      if (accessReads <= (options.rule ? 2 : 1))
        return query((options.admins ?? []).map((id) => ({ person_id: id, title: 'Admin' })));
      return query((options.existing ?? []).map((acl_name) => ({ acl_name })));
    }),
    insertInto: vi.fn(() => query([{ id: 99 }])),
    deleteFrom: vi.fn(() => query([])),
  };
  const context = {
    personId: options.personId === undefined ? 1 : options.personId,
    authToken: 'token',
  } as Context;
  const redis = new RedisClientMock();
  return { db: db as unknown as Database, redis, context };
}
afterEach(() => vi.clearAllMocks());

it('denies adding or deleting rules for missing accounts', async () => {
  const f = fixture({
    registered: false,
    rule: { acl_name: Rights.ADMIN_EVENT, event_id: 7, person_id: 2 },
  });
  await expect(
    addRuleForPerson(f.db, f.redis, f.context, {
      eventId: 7,
      personId: 2,
      ruleName: Rights.ADMIN_EVENT,
      ruleValue: 1,
    })
  ).rejects.toMatchObject({ code: 'not_found' });
  const d = fixture({
    registered: false,
    rule: { acl_name: Rights.ADMIN_EVENT, event_id: 7, person_id: 2 },
  });
  await expect(deleteRuleForPerson(d.db, d.redis, d.context, { ruleId: 99 })).rejects.toMatchObject(
    { code: 'not_found' }
  );
  expect(verifyHash).not.toHaveBeenCalled();
});

it.each([Rights.ADMIN_EVENT, Rights.REFEREE_FOR_EVENT, 'unknown'])(
  'denies unauthorized additions of %s',
  async (ruleName) => {
    const f = fixture();
    await expect(
      addRuleForPerson(f.db, f.redis, f.context, {
        eventId: 7,
        personId: 2,
        ruleName,
        ruleValue: 1,
      })
    ).rejects.toMatchObject({ code: 'permission_denied' });
    expect(f.db.insertInto).not.toHaveBeenCalled();
  }
);

it('allows bootstrap of the first event administrator but rejects self-promotion in an existing event', async () => {
  const payload = { eventId: 7, personId: 1, ruleName: Rights.ADMIN_EVENT, ruleValue: 1 };
  const f = fixture();
  expect(await addRuleForPerson(f.db, f.redis, f.context, payload)).toEqual({ ruleId: 99 });
  const existing = fixture({ admins: [2] });
  await expect(
    addRuleForPerson(existing.db, existing.redis, existing.context, payload)
  ).rejects.toMatchObject({ code: 'permission_denied' });
});

it.each([Rights.ADMIN_EVENT, Rights.REFEREE_FOR_EVENT, 'custom'])(
  'allows superadmin to add %s and rejects a duplicate',
  async (ruleName) => {
    const f = fixture({ superadmin: true });
    expect(
      await addRuleForPerson(f.db, f.redis, f.context, {
        eventId: -1,
        personId: 2,
        ruleName,
        ruleValue: 1,
      })
    ).toEqual({ ruleId: 99 });
    const duplicate = fixture({ superadmin: true, existing: [ruleName] });
    await expect(
      addRuleForPerson(duplicate.db, duplicate.redis, duplicate.context, {
        eventId: 7,
        personId: 2,
        ruleName,
        ruleValue: 1,
      })
    ).rejects.toMatchObject({ code: 'already_exists' });
  }
);

it.each([Rights.ADMIN_EVENT, Rights.REFEREE_FOR_EVENT, 'unknown'])(
  'denies unauthorized deletion of %s',
  async (acl_name) => {
    const f = fixture({ rule: { acl_name, event_id: 7, person_id: 2 } });
    await expect(
      deleteRuleForPerson(f.db, f.redis, f.context, { ruleId: 99 })
    ).rejects.toMatchObject({ code: 'permission_denied' });
    expect(f.db.deleteFrom).not.toHaveBeenCalled();
  }
);

it('denies self-removal and permits global rule deletion by a superadmin', async () => {
  const self = fixture({
    superadmin: true,
    rule: { acl_name: Rights.ADMIN_EVENT, event_id: 7, person_id: 1 },
  });
  await expect(
    deleteRuleForPerson(self.db, self.redis, self.context, { ruleId: 99 })
  ).rejects.toMatchObject({ code: 'permission_denied' });
  const admin = fixture({
    superadmin: true,
    rule: { acl_name: 'custom', event_id: -1, person_id: 2 },
  });
  expect(await deleteRuleForPerson(admin.db, admin.redis, admin.context, { ruleId: 99 })).toEqual({
    success: true,
  });
});

it('uses cached superadmin flags and does not cache an unknown account', async () => {
  const f = fixture({ registered: false });
  expect(await getSuperadminFlag(f.db, f.redis, { personId: 42 })).toEqual({ isAdmin: false });
  await expect(f.redis.get(getSuperadminCacheKey(42))).rejects.toThrow();
  await f.redis.set(getSuperadminCacheKey(42), true);
  vi.mocked(f.db.selectFrom).mockClear();
  expect(await getSuperadminFlag(f.db, f.redis, { personId: 42 })).toEqual({ isAdmin: true });
  expect(f.db.selectFrom).not.toHaveBeenCalled();
});

it('normalizes incomplete admin and referee records', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-28T00:00:00Z'));
  try {
    for (const get of [getEventAdmins, getEventReferees]) {
      const f = fixture({ admins: [1] });
      const result = await get(f.db, { eventId: 7 });
      const records = 'admins' in result ? result.admins : result.referees;
      expect(records).toEqual([
        {
          ruleId: 0,
          personId: 1,
          personName: 'Admin',
          lastUpdate: '2026-10-28T00:00:00.000Z',
          hasAvatar: false,
        },
      ]);
    }
  } finally {
    vi.useRealTimers();
  }
});

it('filters null event IDs for an unauthenticated owned-event lookup', async () => {
  const f = fixture({ personId: null, registered: false });
  expect(await getOwnedEventIds(f.db, f.redis, f.context, { personId: 42 })).toEqual({
    eventIds: [],
  });
});

it('validates an empty authentication token before permitting rule changes', async () => {
  const add = fixture();
  add.context.authToken = null;
  await expect(
    addRuleForPerson(add.db, add.redis, add.context, {
      eventId: 42,
      personId: 2,
      ruleName: Rights.REFEREE_FOR_EVENT,
      ruleValue: 1,
    })
  ).rejects.toMatchObject({ code: 'permission_denied' });
  expect(verifyHash).toHaveBeenCalledWith('', 'hash');
  const remove = fixture({
    rule: { acl_name: Rights.REFEREE_FOR_EVENT, event_id: 42, person_id: 2 },
  });
  remove.context.authToken = null;
  await expect(
    deleteRuleForPerson(remove.db, remove.redis, remove.context, { ruleId: 99 })
  ).rejects.toMatchObject({ code: 'permission_denied' });
  expect(verifyHash).toHaveBeenLastCalledWith('', 'hash');
});
