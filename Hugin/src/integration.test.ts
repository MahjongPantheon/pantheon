import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'kysely';
import { createClient } from 'redis';
import {
  GetLastDay,
  GetLastMonth,
  GetLastYear,
  GetLastDayPayload,
  GetLastDayResponse,
} from 'tsclients/proto/hugin.pb.js';
import { createDb } from './db.js';
import { migrate } from './migrations.js';
import { up } from './migrations/20261022_node_baseline.js';
import { createApp } from './app.js';
import { Ingest, analyticsRow } from './ingest.js';
import { createMetrics, METRICS_KEY, redisOptions } from './metrics.js';
import { aggregateDaily, aggregateMonthly, cleanupErrors } from './aggregation.js';
import { collectEvents } from './reports.js';
import { DIMENSIONS } from './schema.js';
import { moment, timestamp } from './time.js';

const testDatabase = process.env.PHINX_DB_HUGIN_NAME_UNIT ?? 'hugin_unit';
if (
  !/(?:_unit|_test)$/.test(testDatabase) ||
  testDatabase === (process.env.PHINX_DB_HUGIN_NAME ?? 'hugin')
)
  throw new Error('Hugin tests require a separate _unit or _test database');
const db = createDb(testDatabase);
let server: ReturnType<typeof createApp>;
let ingest: Ingest;
let metrics: Awaited<ReturnType<typeof createMetrics>>;
let secondMetrics: Awaited<ReturnType<typeof createMetrics>>;
let url: string;
const location = () => ({ country: 'United States', city: 'Chicago' });
const event = (overrides: Record<string, unknown> = {}) => ({
  s: 'Tyr',
  si: 'session-1',
  h: 'example.invalid',
  o: 'Linux',
  d: 'desktop',
  sc: '1920x1080',
  l: 'en',
  t: moment.utc().toISOString(),
  b: 'firefox',
  ...overrides,
});

const systemNow = moment.now;
beforeAll(async () => {
  moment.now = () => Date.UTC(2026, 9, 22, 12);
  await migrate(db);
  metrics = await createMetrics();
  secondMetrics = await createMetrics();
  ingest = new Ingest(db, location);
  server = createApp(db, ingest, metrics);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test server address');
  url = `http://127.0.0.1:${address.port}`;
});
beforeEach(async () => {
  await db.deleteFrom('event').execute();
  await db.deleteFrom('sys_errors').execute();
  await db.deleteFrom('aggregate_day').execute();
  await db.deleteFrom('aggregate_month').execute();
});
afterAll(async () => {
  moment.now = systemNow;
  await ingest.close();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await Promise.all([metrics.close(), secondMetrics.close(), db.destroy()]);
});
async function post(path: string, payload: unknown) {
  return fetch(url + path, { method: 'POST', body: JSON.stringify(payload) });
}

describe('Hugin persistence and legacy contracts', () => {
  it('adopts Phinx tables and migration history without losing existing data', async () => {
    const row = analyticsRow(event(), '', location);
    if (!row) throw new Error('Invalid fixture');
    await db.insertInto('event').values(row).execute();
    await sql`CREATE TABLE IF NOT EXISTS phinxlog (version bigint PRIMARY KEY)`.execute(db);
    await sql`INSERT INTO phinxlog VALUES (20240212000700) ON CONFLICT DO NOTHING`.execute(db);
    await db.schema
      .alterTable('event')
      .alterColumn('event_meta', (col) => col.setDataType('varchar(255)'))
      .execute();
    await up(db);
    expect(await db.selectFrom('event').selectAll().execute()).toHaveLength(1);
    expect((await sql`SELECT * FROM phinxlog`.execute(db)).rows).toHaveLength(1);
    expect(
      (
        await sql<{
          data_type: string;
        }>`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='event' AND column_name='event_meta'`.execute(
          db
        )
      ).rows[0].data_type
    ).toBe('text');
    await migrate(db);
  });
  it('persists concurrent events before responding, without duplicate writes', async () => {
    const responses = await Promise.all(
      Array.from({ length: 60 }, (_, i) => post('/', event({ si: `session-${i}` })))
    );
    expect(await Promise.all(responses.map((response) => response.text()))).toEqual(
      Array(60).fill('ok')
    );
    const rows = await db.selectFrom('event').selectAll().execute();
    expect(rows).toHaveLength(60);
    expect(new Set(rows.map((row) => row.session_id)).size).toBe(60);
    expect(rows[0].country).toBe('United States');
  });
  it('persists a single low-volume error and leaves analytics counters untouched', async () => {
    expect(
      await (await post('/', { source: 'Mimir [twirp]', error: 'fixture error' })).text()
    ).toBe('ok');
    expect(await db.selectFrom('sys_errors').selectAll().execute()).toHaveLength(1);
    expect(await db.selectFrom('event').selectAll().execute()).toHaveLength(0);
  });
  it('returns the original malformed-payload response', async () => {
    const response = await post('/', {});
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('malformed payload');
  });
  it('supports both generated protobuf clients and Twirp JSON', async () => {
    await post('/', event({ e: 'load_finish' }));
    const config = { baseURL: url, prefix: '/v2' };
    const protobuf = await GetLastDay({}, config);
    expect(protobuf.data[0]).toMatchObject({ siteId: 'Tyr', eventCount: 1, uniqCount: 1 });
    expect(JSON.parse(protobuf.data[0].eventType)).toEqual({ load_finish: 1 });
    const json = await fetch(url + '/v2/common.Hugin/GetLastDay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    expect(json.status).toBe(200);
    const raw = await fetch(url + '/v2/common.Hugin/GetLastDay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/protobuf' },
      body: Buffer.from(GetLastDayPayload.encode({})),
    });
    expect(GetLastDayResponse.decode(Buffer.from(await raw.arrayBuffer())).data[0].eventCount).toBe(
      1
    );
  });
  it('uses unique sessions per site/hour and protects histogram prototype keys', async () => {
    const now = moment.utc().startOf('hour').add(1, 'minute');
    await Promise.all(
      [
        event({ t: now.toISOString(), o: '__proto__' }),
        event({ t: now.toISOString(), o: '__proto__' }),
        event({ s: 'Forseti', t: now.toISOString() }),
      ].map((payload) => post('/', payload))
    );
    const groups = await collectEvents(
      db,
      timestamp(now.clone().subtract(1, 'hour')),
      undefined,
      true
    );
    expect(groups.find((group) => group.siteId === 'Tyr')).toMatchObject({
      eventCount: 2,
      uniqCount: 1,
    });
    expect(JSON.parse(groups.find((group) => group.siteId === 'Tyr')!.os)).toEqual({
      ['__proto__']: 2,
    });
  });
  it('shares gauges between independent clients and HTTP scrapes', async () => {
    const name = 'hugin_test_' + process.pid;
    expect(await (await post('/addMetric', [{ m: name, s: 'unit', v: 7 }])).text()).toBe('ok');
    expect(await secondMetrics.render()).toContain(`pantheon_${name}{service="unit"} 7`);
    expect(await (await fetch(url + '/metrics')).text()).toContain(
      `pantheon_${name}{service="unit"} 7`
    );
    const client = createClient(redisOptions());
    await client.connect();
    await client.hDel(METRICS_KEY, JSON.stringify([name, 'unit']));
    await client.quit();
  });
  it('rejects invalid gauges and oversized tracking bodies', async () => {
    expect((await post('/addMetric', [{ m: 'bad-name', s: 'unit', v: 2 }])).status).toBe(400);
    expect((await fetch(url, { method: 'POST', body: 'x'.repeat(1024 * 1024 + 1) })).status).toBe(
      400
    );
  });
});

describe('scheduled aggregation and retention', () => {
  it('upserts daily counts idempotently with half-open midnight boundaries', async () => {
    for (const [t, si] of [
      ['2026-10-19T23:59:59Z', 'old'],
      ['2026-10-20T00:00:00Z', 'a'],
      ['2026-10-20T12:00:00Z', 'a'],
      ['2026-10-20T23:59:59Z', 'b'],
      ['2026-10-21T00:00:00Z', 'next'],
    ]) {
      const row = analyticsRow(event({ t, si }), '', location);
      if (row) await db.insertInto('event').values(row).execute();
    }
    await aggregateDaily(db, '2026-10-21T03:15:00Z');
    await aggregateDaily(db, '2026-10-21T03:15:00Z');
    const days = await db.selectFrom('aggregate_day').selectAll().execute();
    expect(days).toHaveLength(1);
    expect(days[0]).toMatchObject({ event_count: 3, uniq_count: 2, site_id: 'Tyr' });
    expect(JSON.parse(days[0].country!)).toEqual({ 'United States': 3 });
    expect((await GetLastMonth({}, { baseURL: url, prefix: '/v2' })).data[0]).toMatchObject({
      datetime: '20',
      eventCount: 3,
    });
    expect(await db.selectFrom('event').selectAll().execute()).toHaveLength(4);
  });
  it('retains raw events when a rollup cannot be committed', async () => {
    for (const t of ['2026-10-19T12:00:00Z', '2026-10-20T12:00:00Z']) {
      const row = analyticsRow(event({ t }), '', location);
      if (row) await db.insertInto('event').values(row).execute();
    }
    await db.schema
      .alterTable('aggregate_day')
      .addCheckConstraint('test_reject_rollup', sql`event_count < 0`)
      .execute();
    try {
      await expect(aggregateDaily(db, '2026-10-21T03:15:00Z')).rejects.toThrow();
      expect(await db.selectFrom('event').selectAll().execute()).toHaveLength(2);
      expect(await db.selectFrom('aggregate_day').selectAll().execute()).toHaveLength(0);
    } finally {
      await db.schema.alterTable('aggregate_day').dropConstraint('test_reject_rollup').execute();
    }
  });
  it('merges monthly histograms once and excludes the next month boundary', async () => {
    const dimensions = Object.fromEntries(DIMENSIONS.map((key) => [key, '{"value":2}'])) as Record<
      (typeof DIMENSIONS)[number],
      string
    >;
    await db
      .insertInto('aggregate_day')
      .values(
        ['2026-09-01', '2026-09-30', '2026-10-01'].map((day) => ({
          day,
          site_id: 'Tyr',
          event_count: 2,
          uniq_count: 1,
          ...dimensions,
        }))
      )
      .execute();
    await aggregateMonthly(db, '2026-10-05T04:15:00Z');
    await aggregateMonthly(db, '2026-10-05T04:15:00Z');
    const months = await db.selectFrom('aggregate_month').selectAll().execute();
    expect(months).toHaveLength(1);
    expect(months[0]).toMatchObject({ month: '2026-09-01', event_count: 4, uniq_count: 2 });
    expect(JSON.parse(months[0].country!)).toEqual({ value: 4 });
    expect((await GetLastYear({}, { baseURL: url, prefix: '/v2' })).data[0]).toMatchObject({
      datetime: '09',
      eventCount: 4,
    });
  });
  it('cleans only errors older than the retention boundary', async () => {
    await db
      .insertInto('sys_errors')
      .values([
        { source: 'unit', error: 'old', created_at: '2026-10-19 23:59:59' },
        { source: 'unit', error: 'keep', created_at: '2026-10-20 00:00:00' },
      ])
      .execute();
    await cleanupErrors(db, '2026-10-22T02:38:00Z');
    expect(
      (await db.selectFrom('sys_errors').select('error').execute()).map((row) => row.error)
    ).toEqual(['keep']);
  });
});
