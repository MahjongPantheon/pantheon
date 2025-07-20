import type { Database as Db } from './schema.ts';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { RedisClient } from '../helpers/cache/RedisClient';
import { env } from '../helpers/env';

const dialect = new PostgresDialect({
  pool: new Pool({
    database: env.db.dbname,
    host: env.db.host,
    user: env.db.username,
    password: env.db.password,
    port: env.db.port,
    max: 10,
  }),
});

export const db = new Kysely<Db>({
  dialect,
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

export type Database = typeof db;

export const redisClient = new RedisClient(
  env.redis.username,
  env.redis.password,
  env.redis.host,
  env.redis.port
);
