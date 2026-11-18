import { AsyncLocalStorage } from 'node:async_hooks';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMetricsExporter } from '../../../Common/metricsExporter.js';

const destination = 'http://hugin.test/addMetric';
const metric = (index: number) => ({ m: `method_${index}`, v: index, s: 'mimir' });

describe('Bounded metrics exporter', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset().mockImplementation(async () => new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function batch(index: number) {
    return JSON.parse(fetchMock.mock.calls[index][1]?.body as string);
  }

  it('coalesces gauges, copies scalar values, and drains acknowledgements', async () => {
    const response = new Response('ok');
    fetchMock.mockResolvedValueOnce(response);
    const exporter = createMetricsExporter();
    const sample = metric(1);
    exporter.record(destination, sample);
    sample.v = 99;
    exporter.record(destination, sample);
    sample.m = 'changed';
    sample.v = -1;
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(batch(0)).toEqual([{ m: 'method_1', v: 99, s: 'mimir' }]);
    expect(response.bodyUsed).toBe(true);
    expect(response.body?.locked).toBe(false);
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('bounds distinct pending keys and batches while keeping one actual request in flight', async () => {
    let finish!: (response: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const exporter = createMetricsExporter();
    exporter.record(destination, metric(1000));
    await vi.advanceTimersByTimeAsync(100);
    for (let index = 0; index < 128; index++) {
      expect(exporter.record(destination, metric(index))).toBe(true);
    }
    expect(exporter.record(destination, metric(128))).toBe(false);
    expect(exporter.record(destination, { ...metric(0), v: 999 })).toBe(true);
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    // An abort-ignoring transport must not free a slot and create unlimited sends.
    finish(new Response('ok'));
    await vi.advanceTimersByTimeAsync(300);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(batch(1)).toHaveLength(64);
    expect(batch(2)).toHaveLength(64);
    expect(batch(1)[0]).toEqual({ ...metric(0), v: 999 });
    expect([...batch(1), ...batch(2)]).not.toContainEqual(metric(128));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps destinations and services separate', async () => {
    const exporter = createMetricsExporter();
    exporter.record(destination, metric(1));
    exporter.record(destination, { ...metric(1), s: 'frey' });
    exporter.record('http://other.test/addMetric', metric(1));
    await vi.advanceTimersByTimeAsync(300);
    expect(batch(0)).toEqual([metric(1), { ...metric(1), s: 'frey' }]);
    expect(fetchMock.mock.calls[1][0]).toBe('http://other.test/addMetric');
    expect(batch(1)).toEqual([metric(1)]);
  });

  it('discards failed batches without retries and continues with later samples', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Hugin unavailable'));
    const exporter = createMetricsExporter();
    exporter.record(destination, metric(1));
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    exporter.record(destination, metric(2));
    await vi.advanceTimersByTimeAsync(100);
    expect(batch(1)).toEqual([metric(2)]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('drains error responses and accepts bodyless responses', async () => {
    const response = new Response('unavailable', { status: 503 });
    fetchMock.mockResolvedValueOnce(response).mockResolvedValueOnce(new Response(null));
    const exporter = createMetricsExporter();
    exporter.record(destination, metric(1));
    await vi.advanceTimersByTimeAsync(100);
    expect(response.bodyUsed).toBe(true);
    exporter.record(destination, metric(2));
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels oversized response streams without buffering the whole body', async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(16 * 1024 + 1));
      },
      cancel,
    });
    fetchMock.mockResolvedValueOnce(new Response(body));
    createMetricsExporter().record(destination, metric(1));
    await vi.advanceTimersByTimeAsync(100);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(body.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects invalid or oversized keys and nonfinite values before retaining anything', () => {
    const exporter = createMetricsExporter();
    expect(exporter.record('x'.repeat(2049), metric(1))).toBe(false);
    expect(exporter.record(destination, { ...metric(1), m: 'x'.repeat(257) })).toBe(false);
    expect(exporter.record(destination, { ...metric(1), m: '' })).toBe(false);
    expect(exporter.record(destination, { ...metric(1), m: 'method/path?query' })).toBe(false);
    expect(exporter.record(destination, { ...metric(1), s: 'x'.repeat(65) })).toBe(false);
    expect(exporter.record(destination, { ...metric(1), v: NaN })).toBe(false);
    expect(exporter.record(destination, { ...metric(1), v: Infinity })).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('creates export timers outside the caller request context', async () => {
    const storage = new AsyncLocalStorage<object>();
    const exporter = createMetricsExporter();
    const contexts: unknown[] = [];
    const timeout = setTimeout;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((
      ...args: Parameters<typeof setTimeout>
    ) => {
      contexts.push(storage.getStore());
      return timeout(...args);
    }) as typeof setTimeout);
    storage.run({ repository: 'request-owned ORM identity map' }, () => {
      exporter.record(destination, metric(1));
    });
    await vi.advanceTimersByTimeAsync(100);
    expect(contexts).toEqual([undefined, undefined]);
  });
});

describe('Metrics HTTP deadlines', () => {
  it.each(['headers', 'body'])('aborts stalled %s and recovers the export slot', async (phase) => {
    const storage = new AsyncLocalStorage<object>();
    const contexts: unknown[] = [];
    const nativeFetch = fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation((...args) => {
      contexts.push(storage.getStore());
      return nativeFetch(...args);
    });
    let calls = 0;
    let firstClosed = false;
    const server = createServer((request, response) => {
      request.resume();
      calls++;
      if (calls === 1) {
        response.on('close', () => {
          firstClosed = true;
        });
        if (phase === 'body') response.write('partial acknowledgement');
      } else {
        response.end('ok');
      }
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test port');
    const url = `http://127.0.0.1:${address.port}/addMetric`;
    try {
      const exporter = createMetricsExporter();
      storage.run({ request: 'must not reach fetch' }, () => exporter.record(url, metric(1)));
      await vi.waitFor(() => expect(firstClosed).toBe(true), { timeout: 2500 });
      exporter.record(url, metric(2));
      await vi.waitFor(() => expect(calls).toBe(2), { timeout: 1000 });
      expect(contexts).toEqual([undefined, undefined]);
    } finally {
      vi.restoreAllMocks();
      server.closeAllConnections();
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });
});
