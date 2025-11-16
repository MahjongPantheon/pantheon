import * as Mimir from 'tsclients/proto/mimir.pb';
import { mimirServer } from '../mimir';
import { createTwirpServer } from 'twirpscript';
import { Context } from '../context';
import { createServer, IncomingMessage } from 'http';
import { migrateToLatest } from '../database/actions/run_migration';
import { cleanup } from '../database/actions/cleanup';
import { injectRepository } from 'middleware/injectRepository';

process.env.TEST = 'true';
const mimirHandler = [Mimir.createMimir(mimirServer)];

const app = createTwirpServer<Context, typeof mimirHandler, IncomingMessage>(mimirHandler, {
  debug: process.env.NODE_ENV !== 'production',
  prefix: '/v2',
}).use(injectRepository());

createServer(app).listen(4301, () => {
  cleanup()
    .finally(() => migrateToLatest())
    .catch((err) => console.error(err))
    .then(() => {
      console.log(`Test server listening on port 4301`);
    });
});
