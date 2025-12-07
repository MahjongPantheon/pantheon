import { JobsQueueEntity } from 'src/entities/db/JobsQueue.entity.js';
import { Model } from './Model.js';

export class CronModel extends Model {
  public async getPendingJobs(limit: number) {
    return this.repo.db.em.findAll(JobsQueueEntity, { orderBy: { createdAt: 'asc' }, limit });
  }
}
