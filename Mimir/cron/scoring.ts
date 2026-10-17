import { Repository } from '../src/services/Repository.js';
import { JobsQueueEntity } from '../src/entities/JobsQueue.entity.js';
import { Model } from '../src/models/Model.js';
import { EventModel } from '../src/models/EventModel.js';
import { settleJobs } from './settleJobs.js';

export async function rebuildScoring(repo: Repository) {
  // Bound each batch to 20 events.
  const jobs = await repo.em.findAll(JobsQueueEntity, {
    where: { jobName: 'scoring' },
    orderBy: { id: 'asc' },
    limit: 20,
  });
  if (jobs.length === 0) {
    return 0;
  }

  const eventModel = Model.getModel(repo, EventModel);
  await settleJobs(
    jobs.map((job) => async () => {
      const { eventId } = JSON.parse(job.jobArguments);
      try {
        await eventModel.rebuildEventScoring(+eventId);
      } catch (error) {
        throw new Error(
          `Scoring rebuild failed for event ${eventId} (job ${job.id}): ${String(error)}`,
          {
            cause: error,
          }
        );
      }
    })
  );
  repo.em.remove(jobs);
  return jobs.length;
}
