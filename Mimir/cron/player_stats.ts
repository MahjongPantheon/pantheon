import { Repository } from '../src/services/Repository.js';
import { JobsQueueEntity } from '../src/entities/JobsQueue.entity';
import { Model } from '../src/models/Model';
import { PlayerStatsModel } from '../src/models/PlayerStatsModel';

export async function rebuildPlayerStats(repo: Repository) {
  const jobs = await repo.em.findAll(JobsQueueEntity, {
    where: {
      jobName: 'playerStats',
    },
  });

  if (jobs.length === 0) {
    return;
  }

  const playerModel = Model.getModel(repo, PlayerStatsModel);
  const results = await Promise.allSettled(
    jobs.map((job) => {
      const { playerId, eventId } = JSON.parse(job.jobArguments);
      return playerModel.getPlayerStats(
        { playerId: +playerId, eventIdList: [+eventId] },
        { forceRebuild: true, deferFlush: true }
      );
    })
  );
  const failed = results.find((result) => result.status === 'rejected');
  if (failed?.status === 'rejected') {
    throw failed.reason;
  }

  repo.em.remove(jobs);
  await repo.em.flush();
}
