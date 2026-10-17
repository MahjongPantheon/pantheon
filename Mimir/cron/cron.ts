import cron from 'node-cron';
import { Repository } from '../src/services/Repository.js';
import config from '../src/mikro-orm.config.js';
import { MikroORM } from '@mikro-orm/postgresql';
import { sendStats } from './send_stats.js';
import { rebuildPlayerStats } from './player_stats.js';
import { rebuildAchievements } from './achievements.js';

async function initRepo(): Promise<Repository> {
  return MikroORM.init(config()).then((orm) => {
    const r = Repository.instance({}, orm);
    return r.cache.connect().then(() => r);
  });
}

cron.schedule(
  '* * * * *',
  async () => {
    await initRepo().then((repo) => sendStats(repo).then(() => repo.destroy()));
  },
  { noOverlap: true }
);

cron.schedule(
  '* * * * *',
  async () => {
    await initRepo().then((repo) => rebuildAchievements(repo).then(() => repo.destroy()));
  },
  { noOverlap: true }
);

cron.schedule(
  '* * * * *',
  async () => {
    await initRepo().then((repo) => rebuildPlayerStats(repo).then(() => repo.destroy()));
  },
  { noOverlap: true }
);
