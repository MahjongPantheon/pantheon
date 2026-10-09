import { RedisClient, RedisClientMock } from './RedisClient.js';
import { ConfigService } from '../../services/Config.js';
import { v4 } from 'uuid';

describe('RedisClientMock', () => {
  it('Should store and get value', async () => {
    const client = new RedisClientMock();
    const obj = { kek: 1, lol: '2' };
    await client.set('test1', obj);
    const result = await client.get('test1');
    expect(result).toEqual(obj);
  });

  it('Should store and get hash value', async () => {
    const client = new RedisClientMock();
    const obj = { kek: 1, lol: '2' };
    await client.hSetNX('test2', 'key1', obj);
    const result = await client.hGetAll('test2');
    expect(result).toEqual({ key1: obj });
  });

  it('should store and remove value', async () => {
    const client = new RedisClientMock();
    const obj = { kek: 1, lol: '2' };
    await client.set('test3', obj);
    await client.remove('test3');
    expect(await client.get('test3').catch((e) => e)).toBeInstanceOf(Error);
  });

  it('should increment and decrement value', async () => {
    const client = new RedisClientMock();
    expect(await client.incr('test4')).toEqual(1);
    expect(await client.decr('test4')).toEqual(0);
  });

  it('should rpop values one by one regardless of lpush order', async () => {
    const client = new RedisClientMock();
    const obj = { kek: 1, lol: '2' };
    const promises = [client.rPop('q1'), client.rPop('q2'), client.rPop('q3'), client.rPop('q1')];

    client
      .lPush('q1', obj)
      .then(() => client.lPush('q1', obj))
      .then(() => client.lPush('q2', obj))
      .then(() => client.lPush('q3', obj));

    expect(await Promise.all(promises)).toEqual([obj, obj, obj, obj]);
  });
});

describe('RedisClient integration', () => {
  const config = new ConfigService().redis;
  const client = new RedisClient(config.username, config.password, config.host, config.port);
  const prefix = `mimir-unit:${v4()}:`;
  const keys = new Set<string>();
  function key(name: string) {
    const value = prefix + name;
    keys.add(value);
    return value;
  }

  beforeAll(() => client.connect());
  afterAll(async () => {
    try {
      await Promise.all([...keys].map((name) => client.remove(name)));
    } finally {
      await client.disconnect();
    }
  });

  it('round-trips JSON values and supplies explicit defaults for absent keys', async () => {
    const name = key('value');
    await expect(client.get(name)).rejects.toThrow('Empty value read');
    await expect(client.get(name, false)).resolves.toBe(false);
    await expect(client.set(name, { ids: [1, 2], enabled: false }, 30)).resolves.toBe(true);
    await expect(client.get(name)).resolves.toEqual({ ids: [1, 2], enabled: false });
    await expect(client.remove(name)).resolves.toBe(true);
    await expect(client.remove(name)).resolves.toBe(false);
  });

  it('increments counters and clamps decrements to zero', async () => {
    const name = key('counter');
    expect(await client.incr(name)).toBe(1);
    expect(await client.incr(name)).toBe(2);
    expect(await client.decr(name)).toBe(1);
    expect(await client.decr(name)).toBe(0);
    expect(await client.decr(name)).toBe(0);
    expect(await client.get(name)).toBe(0);
  });

  it('stores JSON hash fields and preserves existing fields on hSetNX', async () => {
    const name = key('hash');
    expect(await client.hLen(name)).toBe(0);
    await expect(client.hGet(name, 'missing')).rejects.toThrow('Empty value read');
    await client.hSet(name, 'first', { value: 1 });
    await client.hSet(name, 'expiring', [1, 2], 30);
    await client.hSetNX(name, 'first', { value: 2 });
    await client.hSetNX(name, 'second', false);
    expect(await client.hGet(name, 'first')).toEqual({ value: 1 });
    expect(await client.hGetAll(name)).toEqual({
      first: { value: 1 },
      expiring: [1, 2],
      second: false,
    });
    expect(await client.hLen(name)).toBe(3);
    await client.hDel(name, 'first');
    expect(await client.hLen(name)).toBe(2);
  });

  it('supports list ordering, lookup and removal of all matching items', async () => {
    const name = key('list');
    await expect(client.rPop(name)).rejects.toThrow('Empty value read');
    const first = { id: 1 };
    const second = { id: 2 };
    await client.lPush(name, first);
    await client.lPush(name, second);
    await client.lPush(name, first);
    expect(await client.lPos(name, second)).toBe(1);
    expect(await client.lPos(name, { id: 3 })).toBeNull();
    await client.lRem(name, first);
    expect(await client.rPop(name)).toEqual(second);
    await expect(client.rPop(name)).rejects.toThrow('Empty value read');
  });

  it('delivers deserialized messages and unsubscribes the listener', async () => {
    const channel = prefix + 'channel';
    let resolveMessage!: (data: unknown) => void;
    const received = new Promise((resolve) => {
      resolveMessage = resolve;
    });
    const unsubscribe = await client.subscribe(channel, resolveMessage);
    try {
      expect(await client.publish(channel, { playerId: 1 })).toBe(1);
      expect(await received).toEqual({ playerId: 1 });
    } finally {
      await unsubscribe();
    }
    expect(await client.publish(channel, { playerId: 2 })).toBe(0);
  });
});
