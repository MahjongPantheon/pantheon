import { createServer, IncomingMessage } from 'http';
import { createTwirpServer } from 'twirpscript';
import { createMimir } from 'tsclients/proto/mimir.pb.js';
import { mimirServer } from './mimir.js';
import { Context } from './context.js';
import { metrics } from './middleware/metrics.js';
import { injectRepository } from './middleware/injectRepository.js';

import config from './mikro-orm.config.js';
import { MikroORM } from '@mikro-orm/postgresql';

const orm = await MikroORM.init(config());

export const mimirHandler = [createMimir(mimirServer)];

const app = createTwirpServer<Context, typeof mimirHandler, IncomingMessage>(mimirHandler, {
  debug: process.env.NODE_ENV !== 'production',
  prefix: '/v2',
})
  .use(injectRepository(orm))
  .use(metrics());

app.on('requestReceived', (ctx) => {
  ctx.repository.log.info('Request received', ctx.method?.name ?? 'Unknown');
});

app.on('responseSent', (ctx) => {
  ctx.repository.log.info('Response sent', ctx.method?.name ?? 'Unknown');
});

app.on('error', (ctx, err) => {
  ctx.repository.log.error('Request errored', ctx.method?.name ?? 'Unknown', err);
});

const port = parseInt(process.env.PORT ?? '4001');
createServer(app).listen(port, () => console.log(`Server listening on port ${port}`));
