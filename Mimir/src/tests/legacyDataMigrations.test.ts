import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config.js';
import { ConfigService } from '../services/Config.js';
import {
  getLegacyDataMigrationQueries,
  legacyRegistrationsQuery,
} from '../helpers/legacyDataMigrations.js';

it('applies current data migrations to v1 imports without rerunning schema migrations', async () => {
  const orm = await MikroORM.init(config());
  const em = orm.em.fork();
  // Use the same transaction-aware SQL execution as the importer.
  const db = {
    query: async (query: string, params: unknown[] = []) => ({
      rows: await em.execute(query, params),
    }),
  };
  await em.begin();
  try {
    await db.query('set local search_path to pg_temp');
    await db.query('create temporary table event (id int primary key, ruleset_config jsonb)');
    await db.query('create temporary table round (last_session_state jsonb)');
    await db.query('create temporary table session (intermediate_results jsonb)');
    await db.query('create temporary table rpc_operation (response jsonb)');
    await db.query(
      'create temporary table jobs_queue (job_arguments text, job_name text, created_at timestamp)'
    );
    for (const [id, rules] of [
      [1, { allowedYaku: [13, 48], withButtobi: true, chomboEndsGame: true }],
      [2, { allowedYaku: [1, 2], withButtobi: false, chomboCountsAsHand: true }],
      [3, { allowedYaku: [16], chomboCountsAsHand: false, chomboEndsGame: false }],
    ] as const) {
      await db.query('insert into event values (?, ?)', [
        id,
        { baseRuleset: 'custom', title: 'Custom', rules: { startPoints: 30000, ...rules } },
      ]);
    }
    const state = { scores: { 1: 30000 }, chombo: { 1: -20000 } };
    await db.query('insert into round values (?)', [state]);
    await db.query('insert into session values (?)', [state]);
    await db.query('insert into rpc_operation values (?)', [
      { rounds: [{ chombo: { loserId: 2 } }, { ron: { loserId: 3 } }] },
    ]);

    for (const query of await getLegacyDataMigrationQueries(orm)) await db.query(query);

    const { rows } = await db.query('select ruleset_config from event order by id');
    for (const [index, row] of rows.entries()) {
      const rules = row.ruleset_config.rules;
      expect(row.ruleset_config.baseRuleset).toBe('custom');
      expect(rules.startPoints).toBe(30000);
      expect(rules.useAggregatedYakuhai).toBe(true);
      expect(rules.chomboCountsAsHand).toBe(index !== 2);
      expect(rules).not.toHaveProperty('chomboEndsGame');
      expect(rules).not.toHaveProperty('withButtobi');
    }
    expect(rows[0].ruleset_config.rules.withTobi).toBe(true);
    expect(rows[1].ruleset_config.rules.withTobi).toBe(false);
    expect(rows[0].ruleset_config.rules.allowedYaku.sort((a: number, b: number) => a - b)).toEqual([
      13, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    ]);
    expect(rows[1].ruleset_config.rules.allowedYaku).toEqual([1, 2]);
    expect(rows[2].ruleset_config.rules.allowedYaku).toContain(58);
    expect(
      (await db.query('select last_session_state from round')).rows[0].last_session_state
    ).toEqual(state);
    expect(
      (await db.query('select intermediate_results from session')).rows[0].intermediate_results
    ).toEqual(state);
    expect((await db.query('select response from rpc_operation')).rows[0].response).toEqual({
      rounds: [{ chombo: { loserIds: [2] } }, { ron: { loserId: 3 } }],
    });
    const jobs = (await db.query('select * from jobs_queue order by job_arguments')).rows;
    expect(jobs.map((job) => JSON.parse(job.job_arguments))).toEqual([
      { eventId: 1 },
      { eventId: 2 },
      { eventId: 3 },
    ]);
    expect(jobs.every((job) => job.job_name === 'scoring' && job.created_at)).toBe(true);
  } finally {
    await em.rollback();
    await orm.close();
  }
});

it('selects the latest complete registration before paginating v1 records', async () => {
  const settings = new ConfigService().db;
  const db = new Client({
    host: settings.host,
    port: settings.port,
    user: settings.username,
    password: settings.password,
    database: 'mimir2_unit',
  });
  await db.connect();
  try {
    await db.query(`create temporary table event_registered_players (
      id int, event_id int, player_id int, local_id int, team_name text,
      replacement_id int, ignore_seating boolean
    )`);
    await db.query(`insert into event_registered_players values
      (1, 1, 10, 1, 'Old', 20, false),
      (2, 2, 10, 2, 'Other event', null, false),
      (3, 1, 11, 3, 'Other player', null, false),
      (1000, 1, 10, 4, 'Latest', 30, true)`);
    const rows = [];
    for (let offset = 0; offset < 3; offset++) {
      rows.push(...(await db.query(legacyRegistrationsQuery, [1, offset])).rows);
    }
    expect(rows.map((row) => row.id)).toEqual([2, 3, 1000]);
    expect(rows[2]).toEqual({
      id: 1000,
      event_id: 1,
      player_id: 10,
      local_id: 4,
      team_name: 'Latest',
      replacement_id: 30,
      ignore_seating: true,
    });
  } finally {
    await db.end();
  }
});
