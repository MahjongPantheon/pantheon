import * as Mimir from 'tsclients/proto/mimir.pb.js';
import { mimirServer } from '../mimir.js';
import { createTwirpServer } from 'twirpscript';
import { Context } from '../context.js';
import { createServer, IncomingMessage } from 'http';
import { takeCoverage } from 'node:v8';
import { injectRepository } from '../middleware/injectRepository.js';
import { SkirnirServiceMock } from '../services/SkirnirMock.js';
import { createWorkerRepository } from './workerRepository.js';
import { rebuildAchievements } from '../../cron/achievements.js';
import { rebuildPlayerStats } from '../../cron/player_stats.js';

import config from '../mikro-orm.config.js';
import { MikroORM, RequestContext } from '@mikro-orm/postgresql';

const orm = await MikroORM.init(config());
const mimirHandler = [Mimir.createMimir(mimirServer)];

const app = createTwirpServer<Context, typeof mimirHandler, IncomingMessage>(mimirHandler, {
  debug: process.env.NODE_ENV !== 'production',
  prefix: '/v2',
})
  .use((_req, _res, next) => {
    return RequestContext.create(orm.em, next);
  })
  .use(injectRepository(orm));

app.on('error', (ctx, err) => {
  console.error({
    message: 'Request errored',
    method: ctx.method?.name ?? 'Unknown',
    err,
  });
});

createServer(async (req, res) => {
  if (process.env.NODE_V8_COVERAGE && req.method === 'POST' && req.url === '/__test__/coverage') {
    takeCoverage();
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'POST' && req.url === '/__test__/cron/achievements') {
    try {
      await rebuildAchievements(await createWorkerRepository(orm));
      res.writeHead(204);
      res.end();
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end('Achievements worker failed');
    }
    return;
  }
  if (req.method === 'POST' && req.url === '/__test__/cron/player-stats') {
    try {
      await rebuildPlayerStats(await createWorkerRepository(orm));
      res.writeHead(204);
      res.end();
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end('Player stats worker failed');
    }
    return;
  }
  if (req.method === 'GET' && req.url === '/__test__/skirnir/session-starting-soon') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(SkirnirServiceMock.sessionStartingSoonCalls));
    return;
  }
  if (req.method === 'GET' && req.url === '/__test__/skirnir/call-referee') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(SkirnirServiceMock.callRefereeCalls));
    return;
  }
  app(req, res);
}).listen(4301, () => {
  console.log(`Test server listening on port 4301`);
});
