import { Database } from '../../database/db';
import { scheduleRebuildSinglePlayerStats } from './jobsQueue';

export async function invalidateByPlayer(db: Database, playerId: number) {
  const stats = await db
    .selectFrom('player_stats')
    .where('player_id', '=', playerId)
    .select(({ fn }) => fn.count('id').as('cnt'))
    .execute();
  if (Number(stats[0].cnt) > 0) {
    await scheduleRebuildSinglePlayerStats(db, playerId);
  }
}
