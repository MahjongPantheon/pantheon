import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import { Migration } from '@mikro-orm/migrations';
import { ConfigService } from '../services/Config.js';
import config from '../mikro-orm.config.js';
import { Migration20261019000000 } from '../migrations/Migration20261019000000.js';

it('allows replay hashes across events while rejecting duplicates within an event', async () => {
  const dbConfig = new ConfigService().db;
  const db = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: 'mimir2_unit',
  });
  const orm = await MikroORM.init({ ...config(), connect: false });
  await db.connect();
  const apply = async (migration: Migration, direction: 'up' | 'down') => {
    await migration[direction]();
    for (const query of migration.getQueries()) {
      await db.query(query as string);
    }
  };
  try {
    // Shadow the real table so migration checks cannot touch seeded sessions.
    await db.query('begin');
    await db.query('set local search_path to pg_temp');
    await db.query('create temporary table session (event_id int not null, replay_hash text)');
    await db.query('create index session_replay_hash_index on session (replay_hash)');
    await db.query("insert into session values (1, 'replay')");
    await apply(new Migration20261019000000(orm.em.getDriver(), orm.config), 'up');

    await db.query("insert into session values (2, 'replay'), (1, null), (1, null)");
    await db.query('savepoint duplicate');
    await expect(db.query("insert into session values (1, 'replay')")).rejects.toMatchObject({
      code: '23505',
      constraint: 'session_replay_hash_index',
    });
    await db.query('rollback to savepoint duplicate');
    expect((await db.query('select count(*)::int as count from session')).rows).toEqual([
      { count: 4 },
    ]);

    await apply(new Migration20261019000000(orm.em.getDriver(), orm.config), 'down');
    await db.query("insert into session values (1, 'replay')");
    expect((await db.query('select count(*)::int as count from session')).rows).toEqual([
      { count: 5 },
    ]);
  } finally {
    await db.query('rollback');
    await db.end();
    await orm.close();
  }
});
