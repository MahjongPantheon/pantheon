import { IRedisClient, RedisClient, RedisClientMock } from 'helpers/cache/RedisClient';
import { ConfigService } from './Config';

export class CacheService {
  protected _client: IRedisClient;
  protected _connectPromise?: Promise<any>;

  public constructor(config: ConfigService) {
    if (config.test) {
      this._client = new RedisClientMock();
    } else {
      this._client = new RedisClient(
        config.redis.username,
        config.redis.password,
        config.redis.host,
        config.redis.port
      );
    }
  }

  async connect() {
    this._connectPromise ??= this._client.connect();
    await this._connectPromise;
  }

  get client(): Omit<IRedisClient, 'connect' | 'disconnect'> {
    if (!this._connectPromise) {
      throw new Error('Cache client is not connected yet');
    }
    return this._client;
  }
}
