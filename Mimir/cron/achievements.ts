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
    limit: 20,
  });

  if (jobs.length === 0) {
    return 0;
  }

  const achievementsModel = Model.getModel(repo, AchievementsModel);
  await settleJobs(
    jobs.map((job) => async () => {
      const { eventId } = JSON.parse(job.jobArguments);
      await achievementsModel.precalculateAchievements(eventId);
    })
  );
  repo.em.remove(jobs);
  return jobs.length;
}
