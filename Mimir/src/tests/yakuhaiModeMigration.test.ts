import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config.js';
import { ConfigService } from '../services/Config.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { Migration20261025000000 } from '../migrations/Migration20261025000000.js';

it('migrates existing events to aggregated yakuhai while new events default to separate names', async () => {
  const settings = new ConfigService().db;
  const db = new Client({
    host: settings.host,
    port: settings.port,
    user: settings.username,
    password: settings.password,
    database: 'mimir2_unit',
  });
  const orm = await MikroORM.init({ ...config(), connect: false });
  await db.connect();
  try {
    // A temporary table shadows the real event table only on this connection.
    await db.query('create temporary table event (id integer primary key, ruleset_config jsonb)');
    const old = {
      title: 'Existing event',
      rules: { allowedYaku: [13, 14, 15, 16, 48], startPoints: 30000 },
    };
    await db.query('insert into event values (1, $1), (2, $2), (3, null)', [
      old,
      { ...old, rules: { ...old.rules, useAggregatedYakuhai: false } },
    ]);
    const migration = new Migration20261025000000(orm.em.getDriver(), orm.config);
    await migration.up();
    for (const query of migration.getQueries()) await db.query(String(query));
    const { rows } = await db.query('select ruleset_config from event order by id');
    expect(rows[0].ruleset_config).toEqual({
      ...old,
      rules: { ...old.rules, useAggregatedYakuhai: true },
    });
    expect(rows[1].ruleset_config.rules.useAggregatedYakuhai).toBe(true);
    expect(rows[2].ruleset_config).toBeNull();
    const ruleset = RulesetEntity.createRuleset('ema');
    await db.query('insert into event values (4, $1)', [ruleset]);
    const saved = await db.query('select ruleset_config from event where id = 4');
    expect(saved.rows[0].ruleset_config.rules.useAggregatedYakuhai).toBe(false);
  } finally {
    await db.end();
    await orm.close();
  }
});
