import { env } from 'helpers/env';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './db';

const oldDb = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: env.db.host,
      database: 'frey2_unit',
      user: env.db.username,
      password: env.db.password,
      port: env.db.port,
    }),
  }),
});

async function cleanup() {
  const tables = await oldDb
    // @ts-ignore
    .selectFrom('information_schema.tables')
    // @ts-ignore
    .select('table_name')
    .where('table_schema', 'not in', ['pg_catalog', 'information_schema'])
    .execute();

  for (let t in tables) {
    await oldDb.schema.dropTable(t).execute();
  }
}

cleanup()
  .then(() => {
    console.log('Cleanup complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Cleanup failed', err);
    process.exit(1);
  });
