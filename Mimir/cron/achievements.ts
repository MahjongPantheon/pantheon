import { Repository } from '../src/services/Repository.js';
import { JobsQueueEntity } from '../src/entities/JobsQueue.entity';
import { Model } from '../src/models/Model';
import { AchievementsModel } from '../src/models/AchievementsModel.js';
import { settleJobs } from './settleJobs.js';

export async function rebuildAchievements(repo: Repository) {
  const jobs = await repo.em.findAll(JobsQueueEntity, {
    where: {
      jobName: 'achievements',
    },
    orderBy: { id: 'asc' },
    limit: 20,
  });

  if (jobs.length === 0) {
    return 0;
  }

  const achievementsModel = Model.getModel(repo, AchievementsModel);
  const eventIds = new Set(jobs.map((job) => +JSON.parse(job.jobArguments).eventId));
  await settleJobs(
    Array.from(eventIds, (eventId) => async () => {
      await achievementsModel.precalculateAchievements(eventId);
    }),
    repo.config.cronConcurrency
  );
  repo.em.remove(jobs);
  return jobs.length;
}
