import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import { ConfigService } from '../services/Config.js';
import config from '../mikro-orm.config.js';
import { Migration20261101000000 } from '../migrations/Migration20261101000000.js';

it('preserves existing ratings and accepts fractional v1 history and result values', async () => {
  const settings = new ConfigService().db;
  const db = new Client({
    host: settings.host,
    port: settings.port,
    user: settings.username,
    password: settings.password,
    database: 'mimir2_unit',
  });
  const orm = await MikroORM.init(config());
  await db.connect();
  try {
    // Shadow application tables; all fixture data and schema changes are rolled back.
    await db.query('begin');
    await db.query('set local search_path to pg_temp');
    await db.query('create temporary table player_history (id int, rating int not null)');
    await db.query('create temporary table session_results (id int, rating_delta int not null)');
    await db.query('insert into player_history values (1, 1500), (5, 2147483647)');
    await db.query('insert into session_results values (1, 1000), (5, -2147483648)');
    await db.query('create temporary table legacy_history (id int, rating real not null)');
    await db.query('create temporary table legacy_results (id int, rating_delta real not null)');
    await db.query('insert into legacy_history values (2, 1545.5), (3, -1545.5), (4, 0)');
    await db.query('insert into legacy_results values (2, 100.5), (3, -100.5), (4, 0)');

    const migration = new Migration20261101000000(orm.em.getDriver(), orm.config);
    await migration.up();
    for (const query of migration.getQueries()) await db.query(String(query));

    // Match the importer: read v1 real columns through pg, then insert bound parameters.
    for (const row of (await db.query('select * from legacy_history')).rows) {
      await db.query('insert into player_history values ($1, $2)', [row.id, row.rating]);
    }
    for (const row of (await db.query('select * from legacy_results')).rows) {
      await db.query('insert into session_results values ($1, $2)', [row.id, row.rating_delta]);
    }
    expect((await db.query('select rating from player_history order by id')).rows).toEqual([
      { rating: 1500 },
      { rating: 1545.5 },
      { rating: -1545.5 },
      { rating: 0 },
      { rating: 2147483647 },
    ]);
    expect((await db.query('select rating_delta from session_results order by id')).rows).toEqual([
      { rating_delta: 1000 },
      { rating_delta: 100.5 },
      { rating_delta: -100.5 },
      { rating_delta: 0 },
      { rating_delta: -2147483648 },
    ]);
  } finally {
    await db.query('rollback');
    await db.end();
    await orm.close();
  }
});
