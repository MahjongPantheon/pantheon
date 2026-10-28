import { RedisClient } from './RedisClient';

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock('redis', () => mocks);

function connection() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    decr: vi.fn(),
    publish: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    rPop: vi.fn(),
    lPush: vi.fn(),
    lRem: vi.fn(),
    lPos: vi.fn(),
    hGet: vi.fn(),
    hGetAll: vi.fn(),
    hLen: vi.fn(),
    hSet: vi.fn(),
    hSetNX: vi.fn(),
    hDel: vi.fn(),
    hExpire: vi.fn(),
  };
}

let base: ReturnType<typeof connection>;
let pub: ReturnType<typeof connection>;
let sub: ReturnType<typeof connection>;
let client: RedisClient;
beforeEach(() => {
  mocks.createClient.mockReset();
  base = connection();
  pub = connection();
  sub = connection();
  mocks.createClient.mockReturnValueOnce(base).mockReturnValueOnce(pub).mockReturnValueOnce(sub);
  client = new RedisClient('user', 'password');
});

it('opens and closes all three independent connections', async () => {
  await client.connect();
  await client.disconnect();
  expect(mocks.createClient).toHaveBeenCalledTimes(3);
  expect(mocks.createClient).toHaveBeenCalledWith({ url: 'redis://user:password@localhost:6379' });
  for (const c of [base, pub, sub]) {
    expect(c.connect).toHaveBeenCalledOnce();
    expect(c.disconnect).toHaveBeenCalledOnce();
  }
});

it('serializes values and applies default or explicit TTL', async () => {
  base.set.mockResolvedValueOnce('OK').mockResolvedValueOnce(null);
  expect(await client.set('key', { id: 1 })).toBe(true);
  expect(base.set).toHaveBeenLastCalledWith('key', '{"id":1}', { EX: 600 });
  expect(await client.set('key', false, 30)).toBe(false);
  expect(base.set).toHaveBeenLastCalledWith('key', 'false', { EX: 30 });
});

it('distinguishes missing keys from JSON false and uses an explicit fallback', async () => {
  base.get.mockResolvedValueOnce('false').mockResolvedValue(null);
  expect(await client.get('key')).toBe(false);
  expect(await client.get('missing', 0)).toBe(0);
  await expect(client.get('missing')).rejects.toThrow('get: Empty value read');
});

it('parses queue data and rejects empty or malformed messages', async () => {
  base.rPop
    .mockResolvedValueOnce('{"id":1}')
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce('{');
  expect(await client.rPop('q')).toEqual({ id: 1 });
  await expect(client.rPop('q')).rejects.toThrow('rpop: Empty value read');
  await expect(client.rPop('q')).rejects.toThrow(SyntaxError);
});

it('publishes JSON and unsubscribes the same decoded-message listener', async () => {
  pub.publish.mockResolvedValue(2);
  expect(await client.publish('events', { id: 1 })).toBe(2);
  expect(pub.publish).toHaveBeenCalledWith('events', '{"id":1}');
  const listener = vi.fn();
  const unsubscribe = await client.subscribe('events', listener);
  const rawListener = sub.subscribe.mock.calls[0][1];
  rawListener('{"id":2}');
  expect(listener).toHaveBeenCalledWith({ id: 2 });
  await unsubscribe();
  expect(sub.unsubscribe).toHaveBeenCalledWith('events', rawListener);
});

it('clamps negative counters to zero and preserves nonnegative counters', async () => {
  pub.decr.mockResolvedValueOnce(-1).mockResolvedValueOnce(2);
  expect(await client.decr('count')).toBe(0);
  expect(base.set).toHaveBeenCalledWith('count', 0);
  expect(await client.decr('count')).toBe(2);
  expect(base.set).toHaveBeenCalledOnce();
  base.incr.mockResolvedValue(3);
  expect(await client.incr('count')).toBe(3);
  expect(base.incr).toHaveBeenCalledWith('count');
});

it('decodes hash fields and rejects absent fields or hashes', async () => {
  base.hGet.mockResolvedValueOnce('0').mockResolvedValueOnce(null);
  expect(await client.hGet('hash', 'field')).toBe(0);
  await expect(client.hGet('hash', 'missing')).rejects.toThrow('hGet: Empty value read');
  base.hGetAll.mockResolvedValueOnce({ a: '1', b: 'false' }).mockResolvedValueOnce(null);
  expect(await client.hGetAll('hash')).toEqual({ a: 1, b: false });
  await expect(client.hGetAll('missing')).rejects.toThrow('hGetAll: Empty value read');
  base.hLen.mockResolvedValue(2);
  expect(await client.hLen('hash')).toBe(2);
});

it('expires hash fields only when a positive TTL is requested', async () => {
  await client.hSet('hash', 'a', 1);
  expect(pub.hExpire).not.toHaveBeenCalled();
  await client.hSet('hash', 'b', { id: 2 }, 10);
  expect(base.hSet).toHaveBeenLastCalledWith('hash', 'b', '{"id":2}');
  expect(pub.hExpire).toHaveBeenCalledWith('hash', 'b', 10);
  await client.hSetNX('hash', 'c', false);
  expect(base.hSetNX).toHaveBeenCalledWith('hash', 'c', 'false');
  await client.hDel('hash', 'a');
  expect(base.hDel).toHaveBeenCalledWith('hash', 'a');
});

it('serializes list arguments and reports whether a key was deleted', async () => {
  await client.lPush('q', { id: 1 });
  expect(base.lPush).toHaveBeenCalledWith('q', '{"id":1}');
  await client.lRem('q', { id: 1 });
  expect(base.lRem).toHaveBeenCalledWith('q', 0, '{"id":1}');
  base.lPos.mockResolvedValue(0);
  expect(await client.lPos('q', { id: 1 })).toBe(0);
  expect(base.lPos).toHaveBeenCalledWith('q', '{"id":1}');
  base.del.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
  expect(await client.remove('key')).toBe(true);
  expect(await client.remove('key')).toBe(false);
});
