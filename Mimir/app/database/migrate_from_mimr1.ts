import { Kysely, PostgresDialect, sql } from 'kysely';
import { DB as DatabaseOld } from './schema_v1';
import { Pool } from 'pg';
import { env } from '../helpers/env';
import { createDbConstructor } from './db';
import * as process from 'node:process';

process.env.NODE_ENV = 'development';

export async function migrateFromMimir1() {
  const oldDb = new Kysely<DatabaseOld>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: env.db.host,
        database: 'mimir',
        user: 'mimir',
        password: env.db.password,
        port: env.db.port,
      }),
    }),
  });

  const newDb = createDbConstructor()();

  await newDb.transaction().execute(async (trx) => {

  });
}

migrateFromMimir1()
  .then(() => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed', error);
    process.exit(1);
  });
