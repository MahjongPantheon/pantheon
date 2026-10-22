import { type Kysely } from 'kysely';

// Frozen final Phinx schema: adopt existing tables without dropping data or phinxlog.
export async function up(db: Kysely<any>) {
  const tables = new Set((await db.introspection.getTables()).map((table) => table.name));
  const dimensions = [
    'country',
    'city',
    'browser',
    'os',
    'device',
    'screen',
    'language',
    'event_type',
    'hostname',
  ] as const;
  if (!tables.has('event')) {
    let table = db.schema
      .createTable('event')
      .addColumn('id', 'bigserial', (col) => col.primaryKey())
      .addColumn('site_id', 'varchar(255)', (col) => col.notNull())
      .addColumn('session_id', 'varchar(255)', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .addColumn('event_id', 'integer')
      .addColumn('event_meta', 'text');
    for (const dimension of dimensions) {
      table = table.addColumn(dimension, 'varchar(255)');
    }
    await table.execute();
    for (const column of ['created_at', 'session_id', 'event_id']) {
      await db.schema.createIndex(`event_${column}_idx`).on('event').column(column).execute();
    }
  }
  if (!tables.has('sys_errors')) {
    await db.schema
      .createTable('sys_errors')
      .addColumn('id', 'bigserial', (col) => col.primaryKey())
      .addColumn('source', 'varchar(255)', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .addColumn('error', 'text', (col) => col.notNull())
      .execute();
  }
  for (const [name, dateColumn, type] of [
    ['aggregate_day', 'day', 'timestamp'],
    ['aggregate_month', 'month', 'date'],
  ] as const) {
    if (!tables.has(name)) {
      let table = db.schema
        .createTable(name)
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn(dateColumn, type, (col) => col.notNull())
        .addColumn('site_id', 'varchar(255)', (col) => col.notNull())
        .addColumn('event_count', 'integer', (col) => col.notNull())
        .addColumn('uniq_count', 'integer', (col) => col.notNull());
      for (const dimension of dimensions) {
        table = table.addColumn(dimension, 'text', (col) =>
          dimension === 'event_type' ? col : col.notNull()
        );
      }
      await table
        .addUniqueConstraint(name === 'aggregate_day' ? 'agg_day' : 'agg_month', [
          dateColumn,
          'site_id',
        ])
        .execute();
    }
  }
  // Apply the two historic widening migrations if adopting an older Phinx schema.
  await db.schema
    .alterTable('event')
    .alterColumn('event_meta', (col) => col.setDataType('text'))
    .execute();
  for (const table of ['aggregate_day', 'aggregate_month']) {
    await db.schema
      .alterTable(table)
      .alterColumn('event_type', (col) => col.setDataType('text'))
      .execute();
    await db.schema
      .alterTable(table)
      .alterColumn('event_type', (col) => col.dropNotNull())
      .execute();
  }
}
