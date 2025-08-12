import { createServer, IncomingMessage } from 'http';
import { createTwirpServer } from 'twirpscript';
import { createSimpleLogger } from 'simple-node-logger';
import { createMimir } from 'tsclients/proto/mimir.pb';
import { mimirClient } from './mimir';
import { env } from './helpers/env';
import { Context } from './context';
import { fillRequestVars } from './middleware/requestVars';
import { createDbConstructor, createRedisConstructor } from './database/db';
import { storages } from './middleware/storages';
import { metrics } from './middleware/metrics';

export const mimirHandler = [createMimir(mimirClient)];
const dbConstructor = createDbConstructor();
const redisConstructor = createRedisConstructor();
const logger = createSimpleLogger('/var/log/mimir.log');

redisConstructor().then((redis) => {
  const app = createTwirpServer<Context, typeof mimirHandler, IncomingMessage>(mimirHandler, {
    debug: env.development,
    prefix: '/v2',
  })
    .use(fillRequestVars())
    .use(storages(dbConstructor(), redis))
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
