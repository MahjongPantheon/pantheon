import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config.js';
import { ConfigService } from '../services/Config.js';
import { Migration20261031000000 } from '../migrations/Migration20261031000000.js';

it('retires the old chombo rule without losing enabled timed handling or unrelated rules', async () => {
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
    await db.query('create temporary table event (id int primary key, ruleset_config jsonb)');
    const cases = [
      {},
      { chomboEndsGame: false },
      { chomboEndsGame: true },
      { chomboCountsAsHand: true },
      { chomboEndsGame: true, chomboCountsAsHand: false },
      { chomboEndsGame: false, chomboCountsAsHand: true },
      { chomboEndsGame: false, chomboCountsAsHand: false },
    ];
    for (const [id, rules] of cases.entries()) {
      await db.query('insert into event values ($1, $2)', [
        id,
        { baseRuleset: 'custom', rules: { startPoints: 30000, ...rules } },
      ]);
    }
    await db.query('insert into event values (99, null), (100, $1)', [{}]);
    const migration = new Migration20261031000000(orm.em.getDriver(), orm.config);
    await migration.up();
    for (let run = 0; run < 2; run++) {
      for (const query of migration.getQueries()) await db.query(String(query));
      const { rows } = await db.query('select ruleset_config from event where id < 99 order by id');
      for (const [i, row] of rows.entries()) {
        expect(row.ruleset_config).toEqual({
          baseRuleset: 'custom',
          rules: {
            startPoints: 30000,
            chomboCountsAsHand:
              cases[i].chomboEndsGame === true || cases[i].chomboCountsAsHand === true,
          },
        });
      }
    }
    const { rows } = await db.query('select ruleset_config from event where id >= 99 order by id');
    expect(rows.map((row) => row.ruleset_config)).toEqual([null, {}]);
  } finally {
    await db.end();
    await orm.close();
  }
}, 30_000);
