import * as Mimir from 'tsclients/proto/mimir.pb';
import { mimirClient } from '../mimir';
import { createDbConstructor, createRedisConstructor } from '../database/db';
import { createTwirpServer } from 'twirpscript';
import { Context } from '../context';
import { createServer, IncomingMessage } from 'http';
import { env } from '../helpers/env';
import { fillRequestVars } from '../middleware/requestVars';
import { storages } from '../middleware/storages';
import { migrateToLatest } from '../database/actions/run_migration';
import { cleanup } from '../database/actions/cleanup';

const freyHandler = [Mimir.createMimir(mimirClient)];
const db = createDbConstructor(true)();
const redis = createRedisConstructor(true)();

redis.then((r) => {
  const app = createTwirpServer<Context, typeof freyHandler, IncomingMessage>(freyHandler, {
    debug: env.development,
    prefix: '/v2',
  })
    .use(fillRequestVars())
    .use(storages(db, r));

  createServer(app).listen(4301, () => {
    cleanup()
      .finally(() => migrateToLatest(true))
      .catch((err) => console.error(err))
      .then(() => {
        console.log(`Test server listening on port 4301`);
      });
  });
});
