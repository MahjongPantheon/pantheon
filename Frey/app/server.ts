import { createServer, IncomingMessage } from 'http';
import { createTwirpServer } from 'twirpscript';
import { createFrey } from './clients/proto/frey.pb';
import { freyClient } from './frey';
import { env } from './helpers/env';
import { Context } from './context';
import { fillRequestVars } from './middleware/requestVars';
import { createDbConstructor, createRedisConstructor } from './database/db';
import { storages } from './middleware/storages';
import { Log } from './helpers/log';
import { metrics } from './middleware/metrics';

export const freyHandler = [createFrey(freyClient)];
const dbConstructor = createDbConstructor();
const redisConstructor = createRedisConstructor();
const logger = new Log('/var/log/frey.log');

redisConstructor().then((redis) => {
  const app = createTwirpServer<Context, typeof freyHandler, IncomingMessage>(freyHandler, {
    debug: env.development,
    prefix: '/v2',
  })
    .use(fillRequestVars())
    .use(storages(dbConstructor(), redis))
    .use(metrics());

  app.on('requestReceived', (ctx) => {
    logger.logStart(ctx.method?.name ?? 'Unknown', []);
  });

  app.on('responseSent', (ctx) => {
    logger.logSuccess(ctx.method?.name ?? 'Unknown', []);
  });

  app.on('error', (ctx, err) => {
    logger.logFailure(ctx.method?.name ?? 'Unknown', [err.msg]);
  });

  createServer(app).listen(env.port, () => console.log(`Server listening on port ${env.port}`));
});
