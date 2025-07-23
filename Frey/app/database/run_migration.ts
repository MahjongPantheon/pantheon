import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from 'kysely';
import { Database } from './schema';
import { Pool } from 'pg';
import { env } from '../helpers/env';
import { promises as fs } from 'fs';
import path from 'path';

export async function migrateToLatest(mock?: boolean) {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: env.db.host,
        database: mock ? 'frey2_unit' : env.db.dbname,
        user: env.db.username,
        password: env.db.password,
      }),
    }),
    log(event) {
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

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, './migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}
