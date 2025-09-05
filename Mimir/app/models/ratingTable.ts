import { Database } from '../database/db';
import { createRuleset } from '../rulesets/ruleset';
import moment from 'moment-timezone';
import {
  calculateHistory,
  findLastByEvent,
  findLastByEventAndDate,
  PlayerHistoryItem,
} from './db/playerHistory';
import { getPrefinishedItems } from './db/session';

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
  const dataItems = isAdmin
    ? await getPrefinishedItems(db, ruleset, eventIdList)
    : groupByEvent(await getHistoryItems(db, eventIdList, mainEvent.timezone, dateFrom, dateTo));
  const data = sortItems(orderBy, playerItems, mergeSeveralEvents(dataItems));

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
): Promise<Array<PlayerHistoryItem>> {
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

function groupByEvent(items: Array<PlayerHistoryItem>): Map<number, Array<PlayerHistoryItem>> {
  const result = new Map<number, Array<PlayerHistoryItem>>();
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

export function mergeSeveralEvents(items: Map<number, PlayerHistoryItem[]>): PlayerHistoryItem[] {
  // TODO use makeHistoryItemsSum
}

export function sortItems(
  orderBy: string,
  playerItems: Record<number, Player>,
  ratingLines: Array<PlayerHistoryItem & { avg_score: number }>
): Array<PlayerHistoryItem & { avg_score: number }> {
  ratingLines = [...ratingLines];
  switch (orderBy) {
    case 'name':
      return ratingLines.sort((a, b) =>
        playerItems[b.player_id].title.localeCompare(playerItems[a.player_id].title)
      );
    case 'rating':
      return ratingLines.sort((a, b) => {
        if (Math.abs(a.rating - b.rating) < 0.0001) {
          return b.avg_place - a.avg_place; // lower is better
        }
        return a.rating - b.rating;
      });
    case 'games_and_rating':
      return ratingLines.sort((a, b) => {
        if (a.games_played !== b.games_played) {
          return a.games_played - b.games_played;
        }
        if (Math.abs(a.rating - b.rating) < 0.0001) {
          return b.avg_place - a.avg_place;
        }
        return a.rating - b.rating;
      });
    case 'avg_place':
      return ratingLines.sort((a, b) => {
        if (Math.abs(a.avg_place - b.avg_place) < 0.0001) {
          return b.rating - a.rating;
        }
        return a.avg_place - b.avg_place;
      });
    case 'avg_score':
      return ratingLines.sort((a, b) => {
        if (Math.abs(a.avg_score - b.avg_score) < 0.0001) {
          return b.avg_place - a.avg_place;
        }
        return a.avg_place - b.avg_place;
      });
    case 'chips':
      return ratingLines.sort((a, b) => {
        if (Math.abs((a.chips ?? 0) - (b.chips ?? 0)) < 0.0001) {
          return b.rating - a.rating;
        }
        return (a.chips ?? 0) - (b.chips ?? 0);
      });
    default:
      throw new Error(
        "Parameter orderBy should be either 'name', 'rating', 'games_and_rating', 'avg_place', 'avg_score' or 'chips'"
      );
  }
}
