import { FileMigrationProvider, Migrator } from 'kysely';
import { promises as fs } from 'fs';
import path from 'path';
import { Repository } from 'services/Repository';

export async function migrateToLatest() {
  const repo = Repository.instance({});

  const migrator = new Migrator({
    db: repo.db.client,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, '../migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE !== 'true') {
      return;
    }
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

  await repo.db.client.destroy();
}
