import { Kysely, PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';
import type { Schema } from './schema.js';

export function createDb(database = process.env.PHINX_DB_HUGIN_NAME ?? 'hugin') {
  return new Kysely<Schema>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.PHINX_DB_HUGIN_HOST ?? 'db.pantheon.internal',
        port: Number(process.env.PHINX_DB_HUGIN_PORT ?? '5432'),
        user: process.env.PHINX_DB_HUGIN_USER ?? 'hugin',
        password: process.env.PHINX_DB_HUGIN_PASS ?? 'pgpass',
        database,
        max: Number(process.env.HUGIN_DB_POOL_SIZE ?? '4'),
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30_000,
        options: '-c timezone=UTC',
        types: {
          getTypeParser: (oid) =>
            oid === 1114 || oid === 1082 ? (value: string) => value : types.getTypeParser(oid),
        },
      }),
    }),
  });
}
