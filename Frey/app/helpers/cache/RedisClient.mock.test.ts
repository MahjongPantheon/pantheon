import { RedisClientMock } from './RedisClient';

it('handles missing keys, explicit fallbacks and repeated writes', async () => {
  const client = new RedisClientMock();
  await client.connect();
  expect(await client.get('missing', false)).toBe(false);
  await expect(client.get('missing')).rejects.toThrow('Key not found');
  expect(await client.set('key', 1)).toBe(true);
  expect(await client.set('key', 2)).toBe(false);
  expect(await client.get('key')).toBe(2);
  expect(await client.remove('missing')).toBe(false);
  expect(await client.remove('key')).toBe(true);
  await client.disconnect();
});

it('reads, overwrites and removes hash fields without losing siblings', async () => {
  const client = new RedisClientMock();
  expect(await client.hLen('missing')).toBe(0);
  await expect(client.hGet('missing', 'a')).rejects.toThrow('Key not found');
  await expect(client.hGetAll('missing')).rejects.toThrow('Key not found');
  await client.hDel('missing', 'a');
  await client.hSet('hash', 'a', { id: 1 });
  await client.hSet('hash', 'b', false);
  expect(await client.hLen('hash')).toBe(2);
  expect(await client.hGet('hash', 'a')).toEqual({ id: 1 });
  await expect(client.hGet('hash', 'missing')).rejects.toThrow('Key not found');
  await client.hSet('hash', 'a', { id: 2 });
  expect(await client.hGetAll('hash')).toEqual({ a: { id: 2 }, b: false });
  await expect(client.hSetNX('hash', 'a', 3)).rejects.toThrow('Key exists');
  await client.hSetNX('hash', 'c', 3);
  await client.hDel('hash', 'a');
  expect(await client.hGetAll('hash')).toEqual({ b: false, c: 3 });
});

it('supports multiple subscribers and removes only the selected subscription', async () => {
  const client = new RedisClientMock();
  expect(await client.publish('updates', 1)).toBe(0);
  const first = vi.fn();
  const second = vi.fn();
  const unsubscribe = await client.subscribe('updates', first);
  await client.subscribe('updates', second);
  expect(await client.publish('updates', { id: 1 })).toBe(2);
  expect(first).toHaveBeenCalledWith({ id: 1 });
  expect(second).toHaveBeenCalledWith({ id: 1 });
  await unsubscribe();
  expect(await client.publish('updates', { id: 2 })).toBe(1);
  expect(first).toHaveBeenCalledOnce();
  expect(second).toHaveBeenLastCalledWith({ id: 2 });
});

it('never returns a negative counter and starts absent counters at zero', async () => {
  const client = new RedisClientMock();
  expect(await client.decr('count')).toBe(0);
  expect(await client.incr('count')).toBe(1);
  expect(await client.incr('count')).toBe(2);
  expect(await client.decr('count')).toBe(1);
  expect(await client.decr('count')).toBe(0);
  expect(await client.decr('count')).toBe(0);
});

it('finds queued JSON values, removes matches and reads remaining messages', async () => {
  const client = new RedisClientMock();
  expect(await client.lPos('missing', 1)).toBeNull();
  await client.lRem('missing', 1);
  await client.lPush('queue', { id: 1 });
  await client.lPush('queue', { id: 2 });
  expect(await client.lPos('queue', { id: 1 })).toBe(0);
  expect(await client.lPos('queue', { id: 2 })).toBe(1);
  expect(await client.lPos('queue', { id: 3 })).toBeNull();
  await client.lRem('queue', { id: 1 });
  expect(await client.lPos('queue', { id: 1 })).toBeNull();
  expect(await client.rPop('queue')).toEqual({ id: 2 });
});
