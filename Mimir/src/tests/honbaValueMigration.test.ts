import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config.js';
import { ConfigService } from '../services/Config.js';
import { Migration20261116000000 } from '../migrations/Migration20261116000000.js';

it('migrates total honba settings once and corrects the old sanma default', async () => {
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
      [{ honbaValue: 300 }, 100],
      [{ honbaValue: 600 }, 200],
      [{ honbaValue: 0 }, 0],
      [{ honbaValue: 100 }, 33],
      [{ withSanma: true, honbaValue: 300 }, 100],
      [{ withSanma: true, honbaValue: 200 }, 100],
      [{ withSanma: true, honbaValue: 600 }, 300],
      [{ withSanma: true, honbaValue: 201 }, 101],
      [{ honbaValuePerPlayer: 250, honbaValue: 300 }, 250],
      [{}, 100],
    ] as const;
    for (const [id, [rules]] of cases.entries()) {
      await db.query('insert into event values ($1, $2)', [
        id,
        { baseRuleset: 'custom', rules: { startPoints: 30000, ...rules } },
      ]);
    }
    await db.query('insert into event values (99, null), (100, $1)', [{}]);
    const migration = new Migration20261116000000(orm.em.getDriver(), orm.config);
    await migration.up();
    for (let run = 0; run < 2; run++) {
      for (const query of migration.getQueries()) await db.query(String(query));
      const { rows } = await db.query('select ruleset_config from event where id < 99 order by id');
      for (const [index, row] of rows.entries()) {
        const remaining: Record<string, unknown> = { ...cases[index][0] };
        delete remaining.honbaValue;
        expect(row.ruleset_config).toEqual({
          baseRuleset: 'custom',
          rules: { startPoints: 30000, ...remaining, honbaValuePerPlayer: cases[index][1] },
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
