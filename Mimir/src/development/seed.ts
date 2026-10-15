import { createInterface } from 'node:readline/promises';
import { MikroORM } from '@mikro-orm/postgresql';
import ormConfig from '../mikro-orm.config.js';
import { ConfigService } from '../services/Config.js';
import { FreyService } from '../services/Frey.js';
import { MetaService } from '../services/Meta.js';
import {
  assertDevelopment,
  createPlayers,
  populate,
  scenarios,
  type Scenario,
} from './fixtures.js';

async function main() {
  const config = new ConfigService();
  assertDevelopment(config.development, config.test);
  const scenario = process.argv[2];
  if (scenario !== 'confirm' && !Object.hasOwn(scenarios, scenario ?? '')) {
    throw new Error('Expected seed, seed_tournament or seed_bigevent.');
  }
  if (process.env.SEED_CONFIRMED !== '1' || scenario === 'confirm') {
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    try {
      const answer = await prompt.question(
        `Delete ALL Mimir data in ${config.db.dbname} on ${config.db.host} and seed development data? Frey players are preserved; root targets recreate the default administrator. Type yes: `
      );
      if (answer.trim() !== 'yes') throw new Error('Seeding cancelled; no data was changed.');
    } finally {
      prompt.close();
    }
  }
  if (scenario === 'confirm') return;
  const anonymous = new FreyService(config, new MetaService({}, config));
  const auth = await anonymous.Authorize({
    email: 'admin@localhost.localdomain',
    password: '123456',
  });
  const frey = new FreyService(
    config,
    new MetaService(
      {
        'x-current-person-id': String(auth.personId),
        'x-auth-token': auth.authToken,
      },
      config
    )
  );
  if (!(await frey.GetSuperadminFlag({ personId: auth.personId })).isAdmin) {
    throw new Error('The default development administrator must be a Frey superadmin.');
  }
  const orm = await MikroORM.init({
    ...ormConfig(),
    preferTs: true,
    migrations: {
      pathTs: import.meta.dirname + '/../migrations',
      path: import.meta.dirname + '/../migrations',
    },
  });
  try {
    await orm.schema.dropSchema({ dropMigrationsTable: true });
    await orm.migrator.up();
    const playerIds = await createPlayers(frey, scenarios[scenario as Scenario].players);
    const em = orm.em.fork();
    const event = await populate(em, scenario as Scenario, playerIds, config.sigrunUrl);
    await frey.AddRuleForPerson({
      personId: auth.personId,
      eventId: event.id,
      ruleName: 'ADMIN_EVENT',
      ruleValue: 1,
    });
    console.log(`Seeded ${event.title}: event ${event.id}, ${playerIds.length} Frey players.`);
    console.log(`View: ${config.sigrunUrl}/event/${event.id}/info`);
    console.log(
      'Sample account password: 123456. Account details are in Frey /tmp/dump_users.txt.'
    );
  } finally {
    await orm.close(true);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
