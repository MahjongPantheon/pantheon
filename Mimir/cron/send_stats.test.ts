import { jest } from '@jest/globals';
import { Repository } from '../src/services/Repository.js';
import { sendStats } from './send_stats.js';

const repo = {
  config: { huginUrl: 'http://hugin.test' },
  em: {
    count: async () => 3,
    execute: async () => [{ cnt: 2 }],
    getKnex: () => ({ raw: (query: string) => query }),
  },
} as unknown as Repository;

afterEach(() => jest.restoreAllMocks());

it('publishes all metrics with a request deadline', async () => {
  const transport = jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(null, { status: 204 }));
  expect(await sendStats(repo)).toBe(6);
  expect(transport).toHaveBeenCalledWith(
    'http://hugin.test/addMetric',
    expect.objectContaining({
      method: 'post',
      signal: expect.any(AbortSignal),
    })
  );
  expect(JSON.parse(transport.mock.calls[0][1]!.body as string)).toHaveLength(6);
});

it('reports rejected metrics requests as failed executions', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Unavailable', { status: 503 }));
  await expect(sendStats(repo)).rejects.toThrow('HTTP 503');
});
