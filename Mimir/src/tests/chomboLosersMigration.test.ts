import { Client } from 'pg';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config.js';
import { ConfigService } from '../services/Config.js';
import { Migration20261031010000 } from '../migrations/Migration20261031010000.js';

it('converts saved chombo losers to arrays without changing other outcomes or state', async () => {
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
  const columns = [
    ['round', 'last_session_state'],
    ['session', 'intermediate_results'],
    ['rpc_operation', 'response'],
  ];
  const cases: [unknown, unknown][] = [
    [null, null],
    [{}, {}],
    [
      { scores: { 1: 30000 }, chombo: { 1: -20000 } },
      { scores: { 1: 30000 }, chombo: { 1: -20000 } },
    ],
    [{ chombo: { loserId: 2, roundIndex: 1 } }, { chombo: { loserIds: [2], roundIndex: 1 } }],
    [{ chombo: { loserId: 2, loserIds: [] } }, { chombo: { loserIds: [2] } }],
    [{ chombo: { loserId: 2, loserIds: [1, 2] } }, { chombo: { loserIds: [1, 2] } }],
    [{ chombo: { loserId: 2, loserIds: [1] } }, { chombo: { loserIds: [1, 2] } }],
    [{ chombo: { loserId: 0, loserIds: [1, 2] } }, { chombo: { loserIds: [1, 2] } }],
    [{ chombo: { loserIds: [1, 2] } }, { chombo: { loserIds: [1, 2] } }],
    [
      { ron: { loserId: 2 }, multiron: { loserId: 3 } },
      { ron: { loserId: 2 }, multiron: { loserId: 3 } },
    ],
    [
      { rounds: [{ round: { chombo: { loserId: 3 } } }, { round: { ron: { loserId: 2 } } }] },
      { rounds: [{ round: { chombo: { loserIds: [3] } } }, { round: { ron: { loserId: 2 } } }] },
    ],
  ];
  try {
    for (const [table, column] of columns) {
      await db.query(`create temporary table "${table}" (id int primary key, "${column}" jsonb)`);
      for (const [id, [before]] of cases.entries()) {
        await db.query(`insert into "${table}" values ($1, $2)`, [id, before]);
      }
    }
    const migration = new Migration20261031010000(orm.em.getDriver(), orm.config);
    await migration.up();
    // Re-running the conversion must not duplicate existing players.
    for (let run = 0; run < 2; run++) {
      for (const query of migration.getQueries()) await db.query(String(query));
      for (const [table, column] of columns) {
        const { rows } = await db.query(
          `select "${column}" as payload from "${table}" order by id`
        );
        expect(rows.map((row) => row.payload)).toEqual(cases.map(([, after]) => after));
      }
    }
  } finally {
    await db.end();
    await orm.close();
  }
}, 30_000);
