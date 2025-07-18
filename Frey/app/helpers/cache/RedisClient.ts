import { RedisClientType, createClient } from 'redis';

export interface IRedisClient {
  connect(): Promise<void>;
  get<T>(key: string, onNotFound?: T): Promise<T>;
  set<T>(key: string, val: T, ttl?: number): Promise<boolean>;
  remove(key: string): Promise<boolean>;
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  publish<T>(channel: string, data: T): Promise<number>;
  subscribe<T>(channel: string, onData: (data: T) => void): Promise<() => Promise<void>>;
  hSet<T>(key: string, hashkey: string, value: T, ttl?: number): Promise<void>;
  hGet<T>(key: string, hashkey: string): Promise<T>;
  hLen(key: string): Promise<number>;
  hSetNX<T>(key: string, hashkey: string, value: T): Promise<void>;
  hDel(key: string, hashkey: string): Promise<void>;
  hGetAll<T>(key: string): Promise<Record<string, T>>;
  rPop<T>(key: string): Promise<T>;
  lPush<T>(key: string, value: T): Promise<void>;
  lPos<T>(key: string, value: T): Promise<number | null>;
  lRem<T>(key: string, value: T): Promise<void>;
}

export class RedisClient implements IRedisClient {
  // Same redis client can't be both worker, publisher and consumer, so we use several connections
  private readonly clientBase: RedisClientType;
  private readonly clientPub: RedisClientType;
  private readonly clientSub: RedisClientType;
  constructor(username: string, password: string, host = 'localhost', port = 6379) {
    this.clientBase = createClient({
      url: `redis://${username}:${password}@${host}:${port}`,
    });
    this.clientPub = createClient({
      url: `redis://${username}:${password}@${host}:${port}`,
    });
    this.clientSub = createClient({
      url: `redis://${username}:${password}@${host}:${port}`,
    });
  }

  public async connect() {
    await this.clientBase.connect();
    await this.clientPub.connect();
    await this.clientSub.connect();
  }

  public async rPop<T>(key: string): Promise<T> {
    const val = await this.clientBase.rPop(key);
    if (!val) {
      throw new Error('rpop: Empty value read');
    }
    return JSON.parse(val) as T;
  }

  public async publish<T>(channel: string, data: T): Promise<number> {
    return this.clientPub.publish(channel, JSON.stringify(data));
  }

  public async subscribe<T>(
    channel: string,
    onData: (data: T) => void
  ): Promise<() => Promise<void>> {
    const listener = (data: string) => {
      onData(JSON.parse(data) as T);
    };
    await this.clientSub.subscribe(channel, listener);
    return async () => await this.clientSub.unsubscribe(channel, listener);
  }

  public async decr(key: string): Promise<number> {
    const res = await this.clientPub.decr(key);
    if (res < 0) {
      await this.clientBase.set(key, 0);
      return 0;
    }
    return res;
  }

  public async get<T>(key: string, onNotFound?: T): Promise<T> {
    const val = await this.clientBase.get(key);
    if (!val) {
      if (onNotFound !== undefined) {
        return onNotFound;
      }
      throw new Error('get: Empty value read');
    }
    return JSON.parse(val) as T;
  }

  public async hGetAll<T>(key: string): Promise<Record<string, T>> {
    const values = await this.clientBase.hGetAll(key);
    if (!values) {
      throw new Error('hGetAll: Empty value read');
    }
    return Object.fromEntries(
      Object.entries(values).map(([k, value]) => [k, JSON.parse(value) as T])
    );
  }

  public async hGet<T>(key: string, hashkey: string): Promise<T> {
    const v = await this.clientBase.hGet(key, hashkey);
    if (!v) {
      throw new Error('hGet: Empty value read');
    }
    return JSON.parse(v) as T;
  }

  public async hLen(key: string): Promise<number> {
    return this.clientBase.hLen(key);
  }

  public async hSet<T>(key: string, hashkey: string, value: T, ttl = 0): Promise<void> {
    await this.clientBase.hSet(key, hashkey, JSON.stringify(value));
    if (ttl > 0) {
      await this.clientPub.hExpire(key, hashkey, ttl);
    }
  }

  public async hSetNX<T>(key: string, hashkey: string, value: T): Promise<void> {
    await this.clientBase.hSetNX(key, hashkey, JSON.stringify(value));
  }

  public async hDel(key: string, hashkey: string): Promise<void> {
    await this.clientBase.hDel(key, hashkey);
  }

  public async incr(key: string): Promise<number> {
    return this.clientBase.incr(key);
  }

  public async lPush<T>(key: string, value: T): Promise<void> {
    await this.clientBase.lPush(key, JSON.stringify(value));
  }

  public async lRem<T>(key: string, value: T): Promise<void> {
    await this.clientBase.lRem(key, 0, JSON.stringify(value));
  }

  public async lPos<T>(key: string, value: T): Promise<number | null> {
    return await this.clientBase.lPos(key, JSON.stringify(value));
  }

  public async remove(key: string): Promise<boolean> {
    return this.clientBase.del(key).then((r) => r > 0);
  }

  public async set<T>(key: string, val: T, ttl = 60 * 10): Promise<boolean> {
    return this.clientBase.set(key, JSON.stringify(val), { EX: ttl }).then((r) => r !== null);
  }
}

export class RedisClientMock implements IRedisClient {
  private _data: Record<string, string> = {};
  private _queues: Record<string, string[]> = {};
  private _queueListeners: Record<string, Array<(val: string | null) => void>> = {};
  private _channelListeners: Record<string, Array<(data: any) => Promise<void>>> = {};

  public async connect() {
    return Promise.resolve();
  }

  public async incr(key: string): Promise<number> {
    if (!this._data[key]) {
      this._data[key] = '0';
    }
    const newVal = parseInt(this._data[key], 10) + 1;
    this._data[key] = newVal.toString();
    return Promise.resolve(newVal);
  }

  public async decr(key: string): Promise<number> {
    if (!this._data[key]) {
      this._data[key] = '0';
    }
    const newVal = parseInt(this._data[key], 10) - 1;
    this._data[key] = (newVal < 0 ? 0 : newVal).toString();
    return Promise.resolve(newVal);
  }

  public async publish<T>(channel: string, data: T): Promise<number> {
    if (!this._channelListeners[channel]) {
      return Promise.resolve(0);
    }
    return Promise.all(
      this._channelListeners[channel].map((listener) => {
        return listener(data);
      })
    ).then((t) => t.length);
  }

  public async subscribe<T>(
    channel: string,
    onData: (data: T) => void
  ): Promise<() => Promise<void>> {
    if (!this._channelListeners[channel]) {
      this._channelListeners[channel] = [];
    }
    this._channelListeners[channel].push((data) => {
      onData(data);
      return Promise.resolve();
    });
    return Promise.resolve(() => {
      this._channelListeners[channel] = this._channelListeners[channel].filter((l) => l !== onData);
      return Promise.resolve();
    });
  }

  public async get<T>(key: string, onNotFound?: T): Promise<T> {
    if (this._data[key] === undefined) {
      if (onNotFound !== undefined) {
        return Promise.resolve(onNotFound);
      }
      return Promise.reject(new Error('Key not found'));
    }
    return Promise.resolve(JSON.parse(this._data[key]) as T);
  }

  public async set<T>(key: string, val: T): Promise<boolean> {
    const updated = this._data[key] !== undefined;
    this._data[key] = JSON.stringify(val);
    return Promise.resolve(!updated);
  }

  public async remove(key: string): Promise<boolean> {
    const exists = this._data[key] !== undefined;
    delete this._data[key];
    return Promise.resolve(exists);
  }

  public async hGet<T>(key: string, hashkey: string): Promise<T> {
    if (this._data[key] === undefined) {
      return Promise.reject(new Error('Key not found'));
    }
    const data = JSON.parse(this._data[key]);
    if (data[hashkey] === undefined) {
      return Promise.reject(new Error('Key not found'));
    }

    return data[hashkey] as T;
  }

  public async hLen(key: string): Promise<number> {
    if (this._data[key] === undefined) {
      return Promise.resolve(0);
    }
    const data = JSON.parse(this._data[key]);
    return Promise.resolve(Object.keys(data).length);
  }

  public async hGetAll<T>(key: string): Promise<Record<string, T>> {
    if (this._data[key] === undefined) {
      return Promise.reject(new Error('Key not found'));
    }
    return Promise.resolve(
      Object.fromEntries(
        Object.entries(JSON.parse(this._data[key]) as Record<string, string>).map(
          ([k, value]) => [k, value as T]
        )
      )
    );
  }

  public async hSet<T>(key: string, hashkey: string, value: T): Promise<void> {
    const hash = this._data[key] !== undefined ? JSON.parse(this._data[key]) : {};
    hash[hashkey] = value;
    this._data[key] = JSON.stringify(hash);
    return Promise.resolve();
  }

  public async hSetNX<T>(key: string, hashkey: string, value: T): Promise<void> {
    const hash = this._data[key] !== undefined ? JSON.parse(this._data[key]) : {};
    if (hash[hashkey] !== undefined) {
      return Promise.reject(new Error('Key exists'));
    }
    hash[hashkey] = value;
    this._data[key] = JSON.stringify(hash);
    return Promise.resolve();
  }

  public async hDel(key: string, hashkey: string): Promise<void> {
    if (this._data[key] !== undefined) {
      const hash = JSON.parse(this._data[key]);
      delete hash[hashkey];
      this._data[key] = JSON.stringify(hash);
    }
    return Promise.resolve();
  }

  public async rPop<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const cb = (val: string | null) => {
        this._queueListeners[key] = this._queueListeners[key].filter((cbq) => cb !== cbq);
        if (!val) {
          reject('Empty value');
        } else {
          resolve(JSON.parse(val) as T);
        }
      };

      if (!this._queueListeners[key]) {
        this._queueListeners[key] = [];
      }
      this._queueListeners[key].push(cb);
      if (this._queues[key] && this._queues[key].length > 0) {
        this._queueListeners[key]?.shift()?.(this._queues[key].pop()!);
      }
    });
  }

  public async lPush<T>(key: string, value: T): Promise<void> {
    this._queues[key] ??= [];
    this._queues[key].push(JSON.stringify(value));
    return new Promise((resolve) => {
      setTimeout(() => {
        // schedule for next tick
        this._queueListeners[key]?.shift()?.(this._queues[key].pop()!);
        resolve();
      }, 0);
    });
  }

  public async lRem<T>(key: string, value: T): Promise<void> {
    this._queues[key] ??= [];
    this._queues[key] = this._queues[key].filter((v) => v !== JSON.stringify(value));
  }

  public async lPos<T>(key: string, value: T): Promise<number | null> {
    this._queues[key] ??= [];
    const idx = this._queues[key].indexOf(JSON.stringify(value));
    if (idx !== -1) {
      return Promise.resolve(null);
    } else {
      return Promise.resolve(idx);
    }
  }
}
