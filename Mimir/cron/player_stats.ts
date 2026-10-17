import { Repository } from '../src/services/Repository.js';
import { JobsQueueEntity } from '../src/entities/JobsQueue.entity';
import { Model } from '../src/models/Model';
import { PlayerStatsModel } from '../src/models/PlayerStatsModel';
import { settleJobs } from './settleJobs.js';

export async function rebuildPlayerStats(repo: Repository) {
  const jobs = await repo.em.findAll(JobsQueueEntity, {
    where: {
      jobName: 'playerStats',
    },
    limit: 300,
  });

  if (jobs.length === 0) {
    return 0;
  }

  const playerModel = Model.getModel(repo, PlayerStatsModel);
  await settleJobs(
    jobs.map((job) => async () => {
      const { playerId, eventId } = JSON.parse(job.jobArguments);
      await playerModel.getPlayerStats(
        { playerId: +playerId, eventIdList: [+eventId] },
        { forceRebuild: true }
      );
    })
  );

  repo.em.remove(jobs);
  return jobs.length;
}
