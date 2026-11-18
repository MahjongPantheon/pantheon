import type { IncomingMessage } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { metrics } from './metrics';

vi.mock('../helpers/env', () => ({ env: { huginUrl: 'http://hugin.test' } }));

describe('Frey request metrics', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const request = { url: '/v2/common.Frey/GetPersonalInfo' } as IncomingMessage;
  const context = {} as Parameters<ReturnType<typeof metrics>>[1];
  const result = { statusCode: 200, headers: {}, body: 'completed response' };

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset().mockImplementation(async () => new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('returns results while telemetry is stalled and coalesces further samples', async () => {
    let finish!: (response: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const middleware = metrics();
    await expect(middleware(request, context, async () => result)).resolves.toBe(result);
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    for (let index = 0; index < 1000; index++) {
      await expect(middleware(request, context, async () => result)).resolves.toBe(result);
    }
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    finish(new Response('ok'));
    await vi.advanceTimersByTimeAsync(100);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string)).toHaveLength(1);
  });

  it('ignores telemetry rejection and preserves the existing payload', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Hugin unavailable'));
    await expect(
      metrics()(request, context, async () => {
        await vi.advanceTimersByTimeAsync(25);
        return result;
      })
    ).resolves.toBe(result);
    await vi.advanceTimersByTimeAsync(2000);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://hugin.test/addMetric');
    expect(JSON.parse(options?.body as string)).toEqual([
      { m: 'method_exec_duration_GetPersonalInfo', s: 'frey', v: 25 },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('propagates business errors without exporting a success metric', async () => {
    const error = new Error('Authentication failed');
    await expect(
      metrics()(request, context, async () => {
        throw error;
      })
    ).rejects.toBe(error);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
