import { JobsQueueEntity } from 'src/entities/JobsQueue.entity.js';
import { Model } from './Model.js';

export class CronModel extends Model {
  public async getPendingJobs(limit: number) {
    return this.repo.db.em.findAll(JobsQueueEntity, { orderBy: { createdAt: 'asc' }, limit });
  }

  public async scheduleRecalcStats(eventId: number, playerIds: number[]) {
    playerIds.forEach((id) => {
      const job = new JobsQueueEntity();
      job.createdAt = new Date().toISOString();
      job.jobName = 'playerStats';
      job.jobArguments = JSON.stringify({ eventId, playerId: id });
      this.repo.db.em.persist(job);
    });

    await this.repo.db.em.flush();
  }

  public async scheduleRecalcAchievements(eventId: number) {
    const job = new JobsQueueEntity();
    job.createdAt = new Date().toISOString();
    job.jobName = 'achievements';
    job.jobArguments = JSON.stringify({ eventId });
    await this.repo.db.em.persistAndFlush(job);
  }
}
