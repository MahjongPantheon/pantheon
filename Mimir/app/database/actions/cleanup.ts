import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '../db';
import { Pool } from 'pg';
import { env } from '../../helpers/env';

export async function cleanup() {
  const oldDb = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: env.db.host,
        database: 'mimir2_unit',
        user: env.db.username,
        password: env.db.password,
        port: env.db.port,
      }),
    }),
  });

  const tables = await oldDb
    // @ts-expect-error
    .selectFrom('information_schema.tables')
    // @ts-expect-error
    .select('table_name')
    .where('table_schema', 'not in', ['pg_catalog', 'information_schema'])
    .execute();

  for (const t of tables) {
    if (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE === 'true') {
      console.log('Cleaning up table', t.table_name);
    }

    await oldDb.schema.dropTable(t.table_name).ifExists().cascade().execute();
  }
}
