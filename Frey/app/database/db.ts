import type { Database as Db } from './schema.ts';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { IRedisClient, RedisClient } from '../helpers/cache/RedisClient';
import { env } from '../helpers/env';

export type Database = Kysely<Db>;

export function createDbConstructor(): () => Database {
  let db: Database | undefined;
  return () => {
    if (!db) {
      db = new Kysely<Db>({
        dialect: new PostgresDialect({
          pool: new Pool({
            database: env.db.dbname,
            host: env.db.host,
            user: env.db.username,
            password: env.db.password,
            port: env.db.port,
            max: 10,
          }),
        }),
        log(event) {
          if (!env.development) {
            return;
          }
          if (event.level === 'error') {
            console.error('Query failed : ', {
              durationMs: event.queryDurationMillis,
              error: event.error,
              sql: event.query.sql,
              params: event.query.parameters,
            });
          } else {
            // `'query'`
            console.log('Query executed : ', {
              durationMs: event.queryDurationMillis,
              sql: event.query.sql,
              params: event.query.parameters,
            });
          }
        },
      });
    }

    return db;
  };
}

export function createRedisConstructor(): () => Promise<IRedisClient> {
  let redisClient: IRedisClient | undefined;
  return async () => {
    if (!redisClient) {
      redisClient = new RedisClient(
        env.redis.username,
        env.redis.password,
        env.redis.host,
        env.redis.port
      );
    }

    await redisClient.connect();
    return redisClient;
  };
}
