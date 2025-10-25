import { DatabaseService } from 'services/Database';
import { scheduleRebuildSinglePlayerStats } from './jobsQueue';

export async function invalidateByPlayer(db: DatabaseService, playerId: number) {
  const stats = await db.client
    .selectFrom('player_stats')
    .where('player_id', '=', playerId)
    .select(({ fn }) => fn.count('id').as('cnt'))
    .execute();
  if (Number(stats[0].cnt) > 0) {
    await scheduleRebuildSinglePlayerStats(db, playerId);
  }
}
