import { JobsQueueEntity } from 'src/entities/db/JobsQueue.entity.js';
import { Model } from './Model.js';
import moment from 'moment';
import { PlayerStatsEntity } from 'src/entities/db/PlayerStats.entity.js';

export class PlayerStatsModel extends Model {
  async scheduleRebuildPlayersStats(eventId: number) {
    await this.repo.db.em.execute(`
      insert into jobs_queue (created_at, job_name, job_arguments)
      select now(), 'playerStats', '{"playerId":' || player_id || ',"eventId":' || event_id || '}'
      from event_registered_players where event_id = ${eventId}
    `);
  }

  async scheduleRebuildSinglePlayerStats(playerId: number) {
    const job = new JobsQueueEntity();
    job.createdAt = moment.utc().format('YYYY-MM-DD hh:mm:ss');
    job.jobName = 'playerStats';
    job.jobArguments = JSON.stringify({ playerId });
    await this.repo.db.em.persistAndFlush(job);
  }

  async invalidateByPlayer(playerId: number) {
    const statsCnt = await this.repo.db.em.count(PlayerStatsEntity, { playerId });
    if (statsCnt > 0) {
      await this.scheduleRebuildSinglePlayerStats(playerId);
    }
  }
}
