import { Migrator } from 'kysely/migration';
import type { Database } from './schema.js';
import { up } from './migrations/20261022_node_baseline.js';

export async function migrate(db: Database) {
  const result = await new Migrator({
    db,
    provider: { getMigrations: async () => ({ '20261022_node_baseline': { up } }) },
  }).migrateToLatest();
  if (result.error) {
    throw result.error;
  }
}
