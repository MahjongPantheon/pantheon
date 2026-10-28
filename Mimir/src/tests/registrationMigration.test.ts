import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import ormConfig from '../mikro-orm.config.js';
import { ConfigService } from '../services/Config.js';
import { Migration20261029000000 } from '../migrations/Migration20261029000000.js';

it('deduplicates registrations by newest row before enforcing uniqueness', async () => {
  const orm = await MikroORM.init(ormConfig());
  const config = new ConfigService().db;
  const db = new Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: 'mimir2_unit',
  });
  await db.connect();
  try {
    await db.query('begin');
    // Temporary objects shadow application tables only on this connection.
    await db.query(`
      create temp table event_registered_players (
        id int primary key, event_id int not null, player_id int not null,
        local_id int, replacement_id int, ignore_seating int not null, team_name varchar(255),
        unique (event_id, local_id)
      ) on commit drop;
      create index event_registered_players_event_id_player_id_index
        on event_registered_players (event_id, player_id);
      insert into event_registered_players values
        (1, 42, 101, 1, null, 0, 'Old'),
        (2, 42, 202, 2, null, 0, 'Other player'),
        (3, 42, 101, 3, 999, 1, 'Newest'),
        (4, 43, 101, 1, null, 0, 'Other event'),
        (5, 42, 101, 5, 888, 0, 'Retained');
    `);
    const before = (await db.query('select * from event_registered_players order by id')).rows;
    const migration = new Migration20261029000000(orm.driver, orm.config);
    await migration.up();
    for (const sql of migration.getQueries()) {
      if (typeof sql !== 'string') throw new Error('Expected a SQL migration statement');
      await db.query(sql);
    }
    expect((await db.query('select * from event_registered_players order by id')).rows).toEqual(
      before.filter((row) => [2, 4, 5].includes(row.id))
    );
    await db.query('savepoint duplicate_registration');
    await expect(
      db.query('insert into event_registered_players values (6, 42, 101, 6, null, 0, null)')
    ).rejects.toThrow('event_registered_players_event_id_player_id_unique');
    await db.query('rollback to savepoint duplicate_registration');
    migration.reset();
    await migration.down();
    for (const sql of migration.getQueries()) {
      if (typeof sql !== 'string') throw new Error('Expected a SQL migration statement');
      await db.query(sql);
    }
    await db.query('insert into event_registered_players values (6, 42, 101, 6, null, 0, null)');
    expect(
      (await db.query('select count(*)::int as count from event_registered_players')).rows[0].count
    ).toBe(4);
  } finally {
    await db.query('rollback');
    await db.end();
    await orm.close();
  }
});
