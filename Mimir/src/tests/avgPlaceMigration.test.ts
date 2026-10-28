import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import { ConfigService } from '../services/Config.js';
import config from '../mikro-orm.config.js';
import { Migration20261018000000 } from '../migrations/Migration20261018000000.js';

it('migrates integer averages to floats and queues scoring for every event', async () => {
  const dbConfig = new ConfigService().db;
  const db = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: 'mimir2_unit',
  });
  const orm = await MikroORM.init({ ...config() });
  await db.connect();
  try {
    // Shadow the real tables so the migration test cannot touch seeded event data.
    await db.query('begin');
    await db.query('set local search_path to pg_temp');
    await db.query('create temporary table event (id int primary key)');
    await db.query('create temporary table player_history (avg_place int not null)');
    await db.query(
      'create temporary table jobs_queue (job_arguments varchar(255), job_name varchar(255), created_at timestamp)'
    );
    await db.query('insert into event values (1), (2), (3)');
    await db.query('insert into player_history values (2)');
    const migration = new Migration20261018000000(orm.em.getDriver(), orm.config);
    await migration.up();
    await migration
      .getQueries()
      .reduce(
        (previous, query) => previous.then(() => db.query(query as string)).then(() => undefined),
        Promise.resolve()
      );

    await db.query('update player_history set avg_place = 2.5');
    expect((await db.query('select avg_place from player_history')).rows).toEqual([
      { avg_place: 2.5 },
    ]);
    const jobs = await db.query('select * from jobs_queue order by job_arguments');
    expect(jobs.rows.map((job) => JSON.parse(job.job_arguments))).toEqual([
      { eventId: 1 },
      { eventId: 2 },
      { eventId: 3 },
    ]);
    expect(jobs.rows.every((job) => job.job_name === 'scoring' && job.created_at)).toBe(true);
  } finally {
    await db.query('rollback');
    await db.end();
    await orm.close();
  }
});
