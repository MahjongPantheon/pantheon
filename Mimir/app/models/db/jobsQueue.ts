import moment from 'moment-timezone';
import { sql } from 'kysely';
import { DatabaseService } from 'services/Database';

export async function getPendingJobs(db: DatabaseService, limit: number) {
  return db.client
    .selectFrom('jobs_queue')
    .selectAll()
    .orderBy('created_at', 'asc')
    .limit(limit)
    .execute();
}

export async function scheduleRebuildAchievements(db: DatabaseService, eventId: number) {
  return await db.client
    .insertInto('jobs_queue')
    .values({
      created_at: moment.utc().format('YYYY-MM-DD hh:mm:ss'),
      job_name: 'achievements',
      job_arguments: JSON.stringify({ eventId }),
    })
    .execute();
}

export async function scheduleRebuildPlayersStats(db: DatabaseService, eventId: number) {
  return sql`
    insert into jobs_queue (created_at, job_name, job_arguments)
    select now(), 'playerStats', '{"playerId":' || player_id || ',"eventId":' || event_id || '}' from event_registered_players where event_id = ${eventId}
    `.execute(db.client);
}

export async function scheduleRebuildSinglePlayerStats(db: DatabaseService, playerId: number) {
  return await db.client
    .insertInto('jobs_queue')
    .values({
      created_at: moment.utc().format('YYYY-MM-DD hh:mm:ss'),
      job_name: 'playerStats',
      job_arguments: JSON.stringify({ playerId }),
    })
    .execute();
}
