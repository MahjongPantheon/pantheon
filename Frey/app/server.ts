import { createServer, IncomingMessage } from 'http';
import { createTwirpServer } from 'twirpscript';
import { createLogger } from './helpers/logger';
import { createFrey } from 'tsclients/proto/frey.pb';
import { freyClient } from './frey';
import { env } from './helpers/env';
import { Context } from './context';
import { fillRequestVars } from './middleware/requestVars';
import { createDbConstructor, createRedisConstructor } from './database/db';
import { storages } from './middleware/storages';
import { metrics } from './middleware/metrics';
import { wrapErrorObject } from './helpers/errors';

export const freyHandler = [createFrey(freyClient)];
const dbConstructor = createDbConstructor();
const redisConstructor = createRedisConstructor();
const logger = createLogger();

redisConstructor().then((redis) => {
  const app = createTwirpServer<Context, typeof freyHandler, IncomingMessage>(freyHandler, {
    debug: env.development,
    prefix: '/v2',
  })
    .use(fillRequestVars())
    .use(storages(dbConstructor(), redis))
    .use(metrics());

  app.on('requestReceived', (ctx) => {
    logger.info({ method: ctx.method?.name ?? 'Unknown' }, 'Request received');
  });

  app.on('responseSent', (ctx) => {
    logger.info({ method: ctx.method?.name ?? 'Unknown' }, 'Response sent');
  });

  app.on('error', (ctx, err) => {
    logger.error({ method: ctx.method?.name ?? 'Unknown', err }, 'Request errored');
  });

  createServer(app).listen(env.port, () => console.log(`Server listening on port ${env.port}`));
});

process.on('uncaughtException', (err, origin) => {
  logger.error({ origin, err: wrapErrorObject(err) }, 'Uncaught exception');
});
