import { Database } from '../database/db';

export async function getRatingTable(
  db: Database,
  eventIdList: number[],
  orderBy: string,
  order: 'asc' | 'desc',
  isAdmin: boolean,
  onlyMinGames: boolean,
  dateFrom: string,
  dateTo: string
) {
  const events = await db
    .selectFrom('event')
    .select([]) // TODO
    .where('id', 'in', eventIdList)
    .execute();
  const regs = await db
    .selectFrom('event_registered_players')
    .select([]) // TODO
    .where('event_id', 'in', eventIdList)
    .execute();
}
