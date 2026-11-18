import type { IncomingMessage } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { metrics } from './metrics.js';

describe('Mimir request metrics', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const request = { url: '/v2/common.Mimir/GetEvent' } as IncomingMessage;
  const errorLog = vi.fn();
  const context = {
    repository: { config: { huginUrl: 'http://hugin.test' }, log: { error: errorLog } },
  } as unknown as Parameters<ReturnType<typeof metrics>>[1];
  const result = { statusCode: 200, headers: {}, body: 'completed response' };

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset().mockImplementation(async () => new Response('ok'));
    errorLog.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('returns successful results before telemetry starts, even when Hugin fails', async () => {
    fetchMock.mockRejectedValue(new Error('Hugin unavailable'));
    await expect(metrics()(request, context, async () => result)).resolves.toBe(result);
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(errorLog).not.toHaveBeenCalled();
  });

  it('preserves method, service, destination and elapsed duration', async () => {
    await metrics()(request, context, async () => {
      await vi.advanceTimersByTimeAsync(25);
      return result;
    });
    await vi.advanceTimersByTimeAsync(100);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://hugin.test/addMetric');
    expect(options?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(options?.body as string)).toEqual([
      { m: 'method_exec_duration_GetEvent', s: 'mimir', v: 25 },
    ]);
  });

  it('logs and rethrows business errors without exporting a success metric', async () => {
    const error = new Error('Invalid event');
    await expect(
      metrics()(request, context, async () => {
        throw error;
      })
    ).rejects.toBe(error);
    expect(errorLog).toHaveBeenCalledWith(error, 'Request errored', 'GetEvent');
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
