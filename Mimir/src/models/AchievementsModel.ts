import { JobsQueueEntity } from 'src/entities/JobsQueue.entity.js';
import { Model } from './Model.js';
import moment from 'moment';

export class AchievementsModel extends Model {
  async scheduleRebuildAchievements(eventId: number) {
    const job = new JobsQueueEntity();
    job.createdAt = moment.utc().format('YYYY-MM-DD hh:mm:ss');
    job.jobName = 'achievements';
    job.jobArguments = JSON.stringify({ eventId });

    await this.repo.em.persistAndFlush(job);
  }
}
