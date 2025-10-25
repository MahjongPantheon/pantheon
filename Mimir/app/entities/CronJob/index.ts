import moment from 'moment-timezone';
import { sql } from 'kysely';
import { EntityBase } from 'entities/EntityBase';

export class CronJobEntity extends EntityBase {
  async getPendingJobs(limit: number) {
    return this.repo.db.client
      .selectFrom('jobs_queue')
      .selectAll()
      .orderBy('created_at', 'asc')
      .limit(limit)
      .execute();
  }

  async scheduleRebuildAchievements(eventId: number) {
    return await this.repo.db.client
      .insertInto('jobs_queue')
      .values({
        created_at: moment.utc().format('YYYY-MM-DD hh:mm:ss'),
        job_name: 'achievements',
        job_arguments: JSON.stringify({ eventId }),
      })
      .execute();
  }

  async scheduleRebuildPlayersStats(eventId: number) {
    return sql`
    insert into jobs_queue (created_at, job_name, job_arguments)
    select now(), 'playerStats', '{"playerId":' || player_id || ',"eventId":' || event_id || '}' from event_registered_players where event_id = ${eventId}
    `.execute(this.repo.db.client);
  }

  async scheduleRebuildSinglePlayerStats(playerId: number) {
    return await this.repo.db.client
      .insertInto('jobs_queue')
      .values({
        created_at: moment.utc().format('YYYY-MM-DD hh:mm:ss'),
        job_name: 'playerStats',
        job_arguments: JSON.stringify({ playerId }),
      })
      .execute();
  }
}
