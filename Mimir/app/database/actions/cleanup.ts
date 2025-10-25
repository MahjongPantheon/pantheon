import { Repository } from 'services/Repository';

export async function cleanup() {
  // ensure we deal with test db and don't erase production db accidentally lol
  process.env.TEST = 'true';
  const repo = Repository.instance({});

  const tables = await repo.db.client
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

    await repo.db.client.schema.dropTable(t.table_name).ifExists().cascade().execute();
  }
}
