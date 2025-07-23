import * as Frey from './clients/proto/frey.pb';
import { freyClient } from './frey';
import { createDbConstructor, createRedisConstructor } from './database/db';
import { createTwirpServer, client } from 'twirpscript';
import { Context } from './context';
import { createServer, IncomingMessage } from 'http';
import { env } from './helpers/env';
import { fillRequestVars } from './middleware/requestVars';
import { storages } from './middleware/storages';
import { after, before, describe, it } from 'node:test';
import { migrateToLatest } from './database/run_migration';
import { cleanup } from './database/actions/cleanup';

async function startServer() {
  const freyHandler = [Frey.createFrey(freyClient)];
  const dbConstructor = createDbConstructor(true);
  const redis = await createRedisConstructor(true)();

  const app = createTwirpServer<Context, typeof freyHandler, IncomingMessage>(freyHandler, {
    debug: env.development,
    prefix: '/v2',
  })
    .use(fillRequestVars())
    .use(storages(dbConstructor(), redis));

  const server = createServer(app);
  server.listen(4304, () => console.log(`Server listening on port 4304`));
  return () => new Promise<void>((res) => server.close(() => res()));
}

function makeFreyClient() {
  client.baseURL = 'http://localhost:4304';
  client.prefix = '/v2';
  return Frey;
}

describe('API', () => {
  let cb = () => Promise.resolve();
  const frey = makeFreyClient();

  before(async () => {
    try {
      await cleanup();
    } catch (err) {
      /* nothing to clean? that's fine*/
    }
    cb = await startServer();
    await migrateToLatest(true);
  });

  it('should create new account', async () => {
    await frey.CreateAccount({
      city: 'testcity',
      country: 'testcountry',
      email: 'test_create@test.com',
      password: '123456',
      phone: '',
      tenhouId: '',
      title: 'Test Account',
    });
  });

  after(async () => {
    await cb();
  });
});
