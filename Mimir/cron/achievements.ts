import { Repository } from "../src/services/Repository.js";
import { JobsQueueEntity } from "../src/entities/JobsQueue.entity";
import { Model } from "../src/models/Model";
import { AchievementsModel } from "../src/models/AchievementsModel.js";

export async function rebuildAchievements(repo: Repository) {
  const jobs = await repo.db.em.findAll(JobsQueueEntity, {
    where: {
      jobName: "achievements",
    },
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
}
