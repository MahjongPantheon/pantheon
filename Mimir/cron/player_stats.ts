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
    orderBy: { id: 'asc' },
    limit: 300,
  });

  if (jobs.length === 0) {
    return 0;
  }

  const playerModel = Model.getModel(repo, PlayerStatsModel);
  const unique = new Map<string, { playerId: number; eventId: number }>();
  for (const job of jobs) {
    const { playerId, eventId } = JSON.parse(job.jobArguments);
    unique.set(`${+eventId}:${+playerId}`, { playerId: +playerId, eventId: +eventId });
  }
  await settleJobs(
    Array.from(unique.values(), ({ playerId, eventId }) => async () => {
      await playerModel.getPlayerStats(
        { playerId: +playerId, eventIdList: [+eventId] },
        { forceRebuild: true }
      );
    }),
    repo.config.cronConcurrency
  );

  repo.em.remove(jobs);
  return jobs.length;
}
