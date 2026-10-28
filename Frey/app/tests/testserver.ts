import * as Frey from 'tsclients/proto/frey.pb';
import { freyClient } from '../frey';
import { createDbConstructor, createRedisConstructor } from '../database/db';
import { createTwirpServer } from 'twirpscript';
import { Context } from '../context';
import { createServer, IncomingMessage } from 'http';
import { captureCoverage } from './captureCoverage';
import { env } from '../helpers/env';
import { fillRequestVars } from '../middleware/requestVars';
import { storages } from '../middleware/storages';
import { migrateToLatest } from '../database/actions/run_migration';
import { cleanup } from '../database/actions/cleanup';
import { bootstrapAdmin } from '../database/actions/bootstrap';

const freyHandler = [Frey.createFrey(freyClient)];
const db = createDbConstructor(true)();
const redis = createRedisConstructor(true)();

redis.then((r) => {
  const app = createTwirpServer<Context, typeof freyHandler, IncomingMessage>(freyHandler, {
    debug: env.development,
    prefix: '/v2',
  })
    .use(fillRequestVars())
    .use(storages(db, r));

  createServer(async (req, res) => {
    if (process.env.NODE_V8_COVERAGE && req.method === 'POST' && req.url === '/__test__/coverage') {
      await captureCoverage(process.env.NODE_V8_COVERAGE);
      res.writeHead(204);
      res.end();
      return;
    }
    app(req, res);
  }).listen(4304, () => {
    cleanup()
      .finally(() => migrateToLatest(true))
      .then(() => bootstrapAdmin(true))
      .catch((err) => console.error(err))
      .then(() => {
        console.log(`Test server listening on port 4304`);
      });
  });
});
