import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RedisClientMock } from './RedisClient';

describe('RedisClientMock', () => {
  it('Should store and get value', async () => {
    const client = new RedisClientMock();
    const obj = { kek: 1, lol: '2' };
    await client.set('test1', obj);
    const result = await client.get('test1');
    assert.deepEqual(result, obj);
  });

  it('Should store and get hash value', async () => {
    const client = new RedisClientMock();
    const obj = { kek: 1, lol: '2' };
    await client.hSetNX('test2', 'key1', obj);
    const result = await client.hGetAll('test2');
    assert.deepEqual(result, { key1: obj });
  });

  it('should store and remove value', async () => {
    const client = new RedisClientMock();
    const obj = { kek: 1, lol: '2' };
    await client.set('test3', obj);
    await client.remove('test3');
    assert.equal((await client.get('test3').catch((e) => e)) instanceof Error, true);
  });

  it('should increment and decrement value', async () => {
    const client = new RedisClientMock();
    assert.equal(await client.incr('test4'), 1);
    assert.equal(await client.decr('test4'), 0);
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

    assert.deepEqual(await Promise.all(promises), [obj, obj, obj, obj]);
  });
});
