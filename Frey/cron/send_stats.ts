import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { env } from '../app/helpers/env';
import { Database } from '../app/database/schema';

async function sendStats() {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: env.db.host,
        database: 'frey2',
        user: env.db.username,
        password: env.db.password,
        port: env.db.port,
      }),
    }),
  });

  const [{ count }] = await db
    .selectFrom('person')
    .select(({ fn }) => fn.count<number>('person.id').as('count'))
    .execute();

  await fetch(env.huginUrl + '/addMetric', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ m: 'registered_users', v: count, s: 'frey' }),
  });
}

sendStats()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Failed to send person stats', e);
    process.exit(1);
  });
