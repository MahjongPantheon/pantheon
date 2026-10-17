import { Repository } from '../src/services/Repository.js';
import { JobsQueueEntity } from '../src/entities/JobsQueue.entity';
import { Model } from '../src/models/Model';
import { PlayerStatsModel } from '../src/models/PlayerStatsModel';
import { FlushMode } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../src/mikro-orm.config.js';

export async function rebuildPlayerStats() {
  const repo = await MikroORM.init(config()).then((orm) => {
    const r = Repository.instance({}, orm);
    return r.cache.connect().then(() => r);
  });

  await repo.em.transactional(
    async () => {
      const jobs = await repo.em.findAll(JobsQueueEntity, {
        where: {
          jobName: 'playerStats',
        },
        limit: 300,
      });

      if (jobs.length === 0) {
        return;
      }

      const playerModel = Model.getModel(repo, PlayerStatsModel);
      const promises = [];
      for (const job of jobs) {
        const { playerId, eventId } = JSON.parse(job.jobArguments);
        promises.push(
          playerModel.getPlayerStats(
            { playerId: +playerId, eventIdList: [+eventId] },
            { forceRebuild: true }
          )
        );
      }
      await Promise.all(promises);

      repo.em.remove(jobs);
    },
    // Concurrent rebuilds share this unit of work; defer query-triggered flushes until all finish.
    { flushMode: FlushMode.COMMIT }
  );

  await repo.destroy();
}
