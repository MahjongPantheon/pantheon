import { Repository } from '../src/services/Repository.js';
import { JobsQueueEntity } from '../src/entities/JobsQueue.entity';
import { Model } from '../src/models/Model';
import { AchievementsModel } from '../src/models/AchievementsModel.js';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../src/mikro-orm.config.js';

export async function rebuildAchievements() {
  const repo = await MikroORM.init(config()).then((orm) => {
    const r = Repository.instance({}, orm);
    return r.cache.connect().then(() => r);
  });

  await repo.em.transactional(async () => {
    const jobs = await repo.em.findAll(JobsQueueEntity, {
      where: {
        jobName: 'achievements',
      },
      limit: 20,
    });

    if (jobs.length === 0) {
      return;
    }

    const achievementsModel = Model.getModel(repo, AchievementsModel);
    const promises = [];
    for (const job of jobs) {
      const { eventId } = JSON.parse(job.jobArguments);
      promises.push(achievementsModel.precalculateAchievements(eventId));
    }
    await Promise.all(promises);
    repo.em.remove(jobs);
  });

  await repo.destroy();
}
