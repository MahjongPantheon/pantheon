import cron from 'node-cron';
import { Repository } from '../src/services/Repository.js';
import config from '../src/mikro-orm.config.js';
import { MikroORM } from '@mikro-orm/postgresql';
import { sendStats } from './send_stats.js';
import { rebuildPlayerStats } from './player_stats.js';

let _repo: Promise<Repository> | undefined;

async function initRepo(): Promise<Repository> {
  _repo ??= MikroORM.init(config()).then((orm) => {
    const r = Repository.instance({}, orm);
    return r.cache.connect().then(() => r);
  });

  return _repo;
}

cron.schedule(
  '* * * * *',
  async () => {
    await initRepo().then((repo) => sendStats(repo));
  },
  { noOverlap: true }
);

cron.schedule(
  '* * * * *',
  async () => {
    await initRepo().then((repo) => rebuildPlayerStats(repo));
  },
  { noOverlap: true }
);
