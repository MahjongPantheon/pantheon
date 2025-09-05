import { createServer, IncomingMessage } from 'http';
import { createTwirpServer, ClientConfiguration } from 'twirpscript';
import { createSimpleLogger } from 'simple-node-logger';
import { createMimir } from 'tsclients/proto/mimir.pb';
import { mimirServer } from './mimir';
import { env } from './helpers/env';
import { Context } from './context';
import { fillRequestVars } from './middleware/requestVars';
import { createDbConstructor, createRedisConstructor } from './database/db';
import { storages } from './middleware/storages';
import { metrics } from './middleware/metrics';
import { clients } from './middleware/clients';

export const mimirHandler = [createMimir(mimirServer)];
const dbConstructor = createDbConstructor();
const redisConstructor = createRedisConstructor();
const logger = createSimpleLogger('/var/log/mimir.log');

const clientConfFrey: ClientConfiguration = {
  prefix: '/v2',
  baseURL: env.freyUrl,
};

redisConstructor().then((redis) => {
  const app = createTwirpServer<Context, typeof mimirHandler, IncomingMessage>(mimirHandler, {
    debug: env.development,
    prefix: '/v2',
  })
    .use(fillRequestVars())
    .use(storages(dbConstructor(), redis))
    .use(clients(clientConfFrey))
    .use(metrics(logger));

  app.on('requestReceived', (ctx) => {
    logger.info('Request received', ctx.method?.name ?? 'Unknown');
  });

  app.on('responseSent', (ctx) => {
    logger.info('Response sent', ctx.method?.name ?? 'Unknown');
  });

  app.on('error', (ctx, err) => {
    logger.error('Request errored', ctx.method?.name ?? 'Unknown', err);
  });

  createServer(app).listen(env.port, () => console.log(`Server listening on port ${env.port}`));
});
