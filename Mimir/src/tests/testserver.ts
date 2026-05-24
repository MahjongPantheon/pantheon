import * as Mimir from 'tsclients/proto/mimir.pb.js';
import { mimirServer } from '../mimir.js';
import { createTwirpServer } from 'twirpscript';
import { Context } from '../context.js';
import { createServer, IncomingMessage } from 'http';
import { injectRepository } from '../middleware/injectRepository.js';

import config from '../mikro-orm.config.js';
import { MikroORM } from '@mikro-orm/postgresql';
process.env.TEST = 'true';

const orm = await MikroORM.init(config());
const mimirHandler = [Mimir.createMimir(mimirServer)];

const app = createTwirpServer<Context, typeof mimirHandler, IncomingMessage>(mimirHandler, {
  debug: process.env.NODE_ENV !== 'production',
  prefix: '/v2',
}).use(injectRepository(orm));

createServer(app).listen(4301, () => {
  console.log(`Test server listening on port 4301`);
});
