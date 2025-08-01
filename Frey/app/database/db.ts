import type { Database as Db } from './schema.ts';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { IRedisClient, RedisClient, RedisClientMock } from '../helpers/cache/RedisClient';
import { env } from '../helpers/env';

export type Database = Kysely<Db>;

export function createDbConstructor(mock?: boolean): () => Database {
  let db: Database | undefined;
  return () => {
    db ??= new Kysely<Db>({
      dialect: new PostgresDialect({
        pool: new Pool({
          database: mock ? 'frey2_unit' : env.db.dbname,
          host: env.db.host,
          user: env.db.username,
          password: env.db.password,
          port: env.db.port,
          max: 10,
        }),
      }),
      log(event) {
        if (
          !env.development ||
          (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE !== 'true')
        ) {
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

    return db;
  };
}

export function createRedisConstructor(mock?: boolean): () => Promise<IRedisClient> {
  let redisClient: IRedisClient | undefined;
  return async () => {
    if (!redisClient) {
      if (mock) {
        redisClient = new RedisClientMock();
      } else {
        redisClient = new RedisClient(
          env.redis.username,
          env.redis.password,
          env.redis.host,
          env.redis.port
        );
      }
    }

    await redisClient.connect();
    return redisClient;
  };
}
