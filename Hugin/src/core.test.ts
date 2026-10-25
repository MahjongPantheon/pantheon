import { describe, expect, it } from 'vitest';
import { BatchWriter, Busy } from './batch.js';
import { analyticsRow } from './ingest.js';
import { previousPeriod, mergeHistograms } from './aggregation.js';
import { parseMetrics, renderMetrics, redisOptions } from './metrics.js';
import { moment } from './time.js';

const payload = {
  s: 'Tyr',
  si: 'anonymous-session',
  h: 'example.invalid',
  o: 'Linux',
  d: 'desktop',
  sc: '1920x1080',
  l: 'en',
  t: '2026-10-22T12:00:00+03:00',
  b: 'firefox',
  m: { u: '/rating' },
};
const geo = () => ({ country: 'United States', city: 'Chicago' });

describe('analytics validation and privacy', () => {
  it('normalizes dates to UTC and stores no IP address', () => {
    const row = analyticsRow(payload, '8.8.8.8', geo);
    expect(row).toMatchObject({
      created_at: '2026-10-22 09:00:00.000',
      event_type: 'page_view',
      event_meta: '{"u":"/rating"}',
      country: 'United States',
    });
    expect(JSON.stringify(row)).not.toContain('8.8.8.8');
  });
  it.each([
    null,
    {},
    { ...payload, si: '' },
    { ...payload, t: 'invalid' },
    { ...payload, s: 'x'.repeat(256) },
  ])('rejects malformed input %#', (input) => {
    expect(analyticsRow(input, '', geo)).toBeNull();
  });
  it('preserves event names and metadata independently of the nullable event ID', () => {
    expect(analyticsRow({ ...payload, e: 'load_finish', m: { time: 20 } }, '', geo)).toMatchObject({
      event_type: 'load_finish',
      event_meta: '{"time":20}',
      event_id: null,
    });
  });
});

describe('bounded durable batches', () => {
  it('flushes a partial batch and acknowledges only after persistence', async () => {
    let commit: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      commit = resolve;
    });
    const batches: number[][] = [];
    const writer = new BatchWriter<number>(
      async (rows) => {
        batches.push(rows);
        await gate;
      },
      100,
      1
    );
    let acknowledged = false;
    const request = writer.enqueue(1).then(() => {
      acknowledged = true;
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
    expect(batches).toEqual([[1]]);
    expect(acknowledged).toBe(false);
    commit();
    await request;
    expect(acknowledged).toBe(true);
    await writer.close();
  });
  it('commits concurrent requests once each and drains on close', async () => {
    const values: number[] = [];
    const writer = new BatchWriter<number>(
      async (rows) => {
        values.push(...rows);
      },
      3,
      100
    );
    const pending = Array.from({ length: 17 }, (_, i) => writer.enqueue(i));
    await writer.close();
    await Promise.all(pending);
    expect(values).toEqual(Array.from({ length: 17 }, (_, i) => i));
    await expect(writer.enqueue(20)).rejects.toBeInstanceOf(Busy);
  });
  it('rejects failed writes rather than acknowledging lost data', async () => {
    const writer = new BatchWriter<number>(async () => {
      throw new Error('database unavailable');
    }, 1);
    await expect(writer.enqueue(1)).rejects.toThrow('database unavailable');
    await writer.close();
  });
  it('applies backpressure when the queue is full', async () => {
    const writer = new BatchWriter<number>(async () => {}, 100, 100, 1);
    const first = writer.enqueue(1);
    await expect(writer.enqueue(2)).rejects.toBeInstanceOf(Busy);
    await writer.close();
    await first;
  });
});

describe('moment/timezone aggregation windows', () => {
  it.each([
    { now: '2026-03-30T12:00:00Z', hours: 23 },
    { now: '2026-10-26T12:00:00Z', hours: 25 },
  ])('uses local midnight across DST: $hours hours', ({ now, hours }) => {
    const { from, to } = previousPeriod('day', now, 'Europe/Berlin');
    expect(moment.utc(to).diff(moment.utc(from), 'hours')).toBe(hours);
  });
  it('handles year and leap-month boundaries', () => {
    expect(previousPeriod('month', '2024-03-05T12:00:00Z')).toEqual({
      from: '2024-02-01 00:00:00.000',
      to: '2024-03-01 00:00:00.000',
    });
    expect(previousPeriod('month', '2026-01-05T12:00:00Z').from).toBe('2025-12-01 00:00:00.000');
  });
  it('merges each dimension key once, including prototype-like values', () => {
    expect(JSON.parse(mergeHistograms(['{"US":2,"__proto__":1}', '{"US":3,"GB":1}']))).toEqual({
      US: 5,
      GB: 1,
      ['__proto__']: 1,
    });
    expect(mergeHistograms(['[]', null])).toBe('[]');
  });
});

describe('shared Prometheus gauge encoding', () => {
  it('keeps metric names, values and service labels compatible', () => {
    const data = {
      a: JSON.stringify({ m: 'query_count', s: 'mimir', v: 3 }),
      b: JSON.stringify({ m: 'query_count', s: 'frey"\n\\', v: 4 }),
    };
    expect(renderMetrics(data)).toContain('# TYPE pantheon_query_count gauge\n');
    expect(renderMetrics(data)).toContain('pantheon_query_count{service="mimir"} 3\n');
    expect(renderMetrics(data)).toContain('service="frey\\"\\n\\\\"');
  });
  it.each(
    [
      null,
      {},
      [{ m: 'bad-name', s: 'site', v: 1 }],
      [{ m: 'ok', s: 'site', v: Infinity }],
      [{ m: 'ok', s: 'site', v: '1' }],
    ].map((input) => ({ input }))
  )('rejects invalid gauge input %#', ({ input }) => {
    expect(() => parseMetrics(input)).toThrow('Invalid metrics payload');
  });
});

describe('shared Redis connection', () => {
  it('uses the neighbouring authenticated Redis container by default', () => {
    expect(redisOptions({})).toEqual({
      socket: { host: 'redis.pantheon.internal', port: 6379 },
      username: 'redis',
      password: 'redispass',
    });
  });
  it('supports Hugin overrides and the existing host fallback', () => {
    expect(redisOptions({ REDIS_HOST: 'shared-redis' }).socket.host).toBe('shared-redis');
    expect(
      redisOptions({
        HUGIN_REDIS_HOST: 'custom-redis',
        REDIS_HOST: 'fallback',
        HUGIN_REDIS_PORT: '6380',
        HUGIN_REDIS_USER: 'hugin',
        HUGIN_REDIS_PASSWORD: 'test-password',
      })
    ).toEqual({
      socket: { host: 'custom-redis', port: 6380 },
      username: 'hugin',
      password: 'test-password',
    });
  });
});
