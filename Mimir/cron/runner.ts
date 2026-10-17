import { FlushMode } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../src/mikro-orm.config.js';
import { Repository } from '../src/services/Repository.js';
import { rebuildAchievements } from './achievements.js';
import { rebuildPlayerStats } from './player_stats.js';
import { sendStats } from './send_stats.js';
import { JobName, jobLockKey, jobLockNamespace } from './jobs.js';

const handlers = {
  achievements: rebuildAchievements,
  playerStats: rebuildPlayerStats,
  metrics: sendStats,
};

export async function withJobLock(repo: Repository, name: JobName, handler: () => Promise<number>) {
  return repo.em.transactional(
    async () => {
      const [lock] = await repo.em.execute<{ acquired: boolean }[]>(
        'select pg_try_advisory_xact_lock(?, ?) as acquired',
        [jobLockNamespace, jobLockKey(name)]
      );
      if (!lock.acquired) {
        return { status: 'skipped' as const, processed: 0 };
      }
      return { status: 'completed' as const, processed: await handler() };
    },
    { flushMode: FlushMode.COMMIT }
  );
}

export async function runJob(repo: Repository, name: JobName) {
  return withJobLock(repo, name, () => handlers[name](repo));
}

export async function runWorker(name: JobName) {
  const startedAt = Date.now();
  console.log(JSON.stringify({ job: name, status: 'started' }));
  const orm = await MikroORM.init(config());
  const repo = Repository.instance({}, orm);
  try {
    await repo.cache.connect();
    const result = await runJob(repo, name);
    console.log(JSON.stringify({ job: name, ...result, durationMs: Date.now() - startedAt }));
  } finally {
    await repo.destroy();
  }
}
