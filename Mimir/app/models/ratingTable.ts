import { Database } from '../database/db';
import { createRuleset } from '../rulesets/ruleset';
import moment from 'moment-timezone';
import { calculateHistory, findLastByEvent, findLastByEventAndDate } from './db/playerHistory';
import { PlayerHistory } from '../database/schema';

export async function getRatingTable(
  db: Database,
  eventIdList: number[],
  orderBy: string,
  order: 'asc' | 'desc',
  isAdmin: boolean,
  onlyMinGames: boolean,
  dateFrom: string | null,
  dateTo: string | null
) {
  const events = await db
    .selectFrom('event')
    .select(['id', 'sort_by_games', 'min_games_count', 'ruleset_config', 'timezone']) // TODO
    .where('id', 'in', eventIdList)
    .execute();
  const mainEvent = events.find((e) => e.id === eventIdList[0]);
  if (!mainEvent) {
    throw new Error('Main event not found');
  }
  const ruleset = createRuleset('custom', mainEvent.ruleset_config);
  const dataItems = groupByEvent(
    await getHistoryItems(db, eventIdList, mainEvent.timezone, dateFrom, dateTo)
  );
  const fakePrefinishedItems = isAdmin ? getFakePrefinishedItems(eventIdList) : [];
  const data = sortItems(ruleset.rules.startRating, orderBy, playerItems, dataItems);

  if (order === 'desc') {
    data.reverse();
  }

  if (mainEvent.sort_by_games) {
    data.sort((a, b) => b.games_played - a.games_played);
  }

  if (onlyMinGames) {
    data.filter((r) => r.games_played >= mainEvent.min_games_count);
  }

  return data;
}

async function getHistoryItems(
  db: Database,
  eventIds: number[],
  timezone: string,
  dateFrom: string | null,
  dateTo: string | null
): Promise<Array<Omit<PlayerHistory, 'id'>>> {
  const dateFromUtc = dateFrom ? moment.tz(dateFrom, timezone).utc() : null;
  const dateToUtc = dateTo ? moment.tz(dateTo, timezone).utc() : null;

  if (dateFromUtc && dateToUtc) {
    const itemsFrom = await findLastByEventAndDate(db, eventIds, dateFromUtc);
    const itemsTo = await findLastByEventAndDate(db, eventIds, dateToUtc);
    return calculateHistory(itemsFrom, itemsTo);
  }

  if (dateFromUtc && !dateToUtc) {
    const itemsFrom = await findLastByEventAndDate(db, eventIds, dateFromUtc);
    const itemsTo = await findLastByEvent(db, eventIds);
    return calculateHistory(itemsFrom, itemsTo);
  }

  if (!dateFromUtc && dateToUtc) {
    return await findLastByEventAndDate(db, eventIds, dateToUtc);
  }

  return await findLastByEvent(db, eventIds);
}

function groupByEvent(
  items: Array<Omit<PlayerHistory, 'id'>>
): Map<number, Array<Omit<PlayerHistory, 'id'>>> {
  const result = new Map<number, Array<Omit<PlayerHistory, 'id'>>>();
  for (const item of items) {
    const list = result.get(item.event_id);
    if (list) {
      list.push(item);
    } else {
      result.set(item.event_id, [item]);
    }
  }
  return result;
}
