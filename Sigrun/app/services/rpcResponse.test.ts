import { AddOnlineReplay, GamesAddOnlineReplayResponse } from 'tsclients/proto/mimir.pb';
import { handleRpcResponse } from './rpcResponse';

vi.mock('../env', () => ({ env: { urls: { hugin: 'https://hugin.example' } } }));
afterEach(() => vi.unstubAllGlobals());

function addReplay(response: Response) {
  return AddOnlineReplay(
    { eventId: 1, link: 'https://tenhou.net/0/?log=example' },
    {
      baseURL: 'https://mimir.example',
      rpcTransport: async (url) => handleRpcResponse(response, url),
    }
  );
}

it('leaves successful replay responses readable for protobuf decoding', async () => {
  const expected = GamesAddOnlineReplayResponse.initialize();
  const response = new Response(Uint8Array.from(GamesAddOnlineReplayResponse.encode(expected)));
  await expect(addReplay(response)).resolves.toEqual(expected);
  expect(response.bodyUsed).toBe(true);
});

it.each([
  [409, 'already_exists', 'Replay already exists'],
  [400, 'invalid_argument', 'Replay link is invalid'],
  [500, 'internal', 'Import failed'],
])(
  'preserves the actual HTTP %s replay error instead of reading the body twice',
  async (status, code, msg) => {
    const response = Response.json({ code, msg }, { status });
    await expect(addReplay(response)).rejects.toMatchObject({ code, msg });
    expect(response.bodyUsed).toBe(true);
  }
);

it('lets Twirp decode non-JSON proxy errors from the original body', async () => {
  await expect(addReplay(new Response('Bad gateway', { status: 502 }))).rejects.toMatchObject({
    code: 'unavailable',
    meta: { body: 'Bad gateway' },
  });
});

it('retains reporting and the useful cause for internal server errors', async () => {
  const report = vi.fn().mockResolvedValue(new Response());
  vi.stubGlobal('fetch', report);
  const response = Response.json(
    { code: 'internal', msg: 'server error', meta: { cause: 'Import failed' } },
    { status: 500 }
  );
  await expect(addReplay(response)).rejects.toThrow('Import failed');
  expect(report).toHaveBeenCalledExactlyOnceWith(
    'https://hugin.example',
    expect.objectContaining({ method: 'POST' })
  );
  expect(response.bodyUsed).toBe(false);
});
