import { Database } from './database/db';
import { IRedisClient } from './helpers/cache/RedisClient';

export interface Context {
  locale: string;
  authToken: string | null;
  personId: number | null;
  currentEventId: number | null;
  db: Database;
  redisClient: IRedisClient;
  isInternalQuery: boolean;
}
