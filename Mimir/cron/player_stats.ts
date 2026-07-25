import { Repository } from "../src/services/Repository.js";
import { JobsQueueEntity } from "../src/entities/JobsQueue.entity";
import { Model } from "../src/models/Model";
import { PlayerStatsModel } from "../src/models/PlayerStatsModel";

export async function rebuildPlayerStats(repo: Repository) {
  const jobs = await repo.em.findAll(JobsQueueEntity, {
    where: {
      jobName: "playerStats",
    },
  });

  if (jobs.length === 0) {
    return;
  }

  const playerModel = Model.getModel(repo, PlayerStatsModel);
  const promises = [];
  for (const job of jobs) {
    const { playerId, eventId } = JSON.parse(job.jobArguments);
    promises.push(
      playerModel.getPlayerStats({
        playerId: +playerId,
        eventIdList: [+eventId],
      }),
    );
  }

  await Promise.all(promises);
}
