import { createRuleset, Ruleset } from '../rulesets/ruleset';
import moment from 'moment-timezone';
import {
  calculateHistory,
  findLastByEvent,
  findLastByEventAndDate,
  makeHistoryItemsSum,
  PlayerHistoryItem,
} from './db/playerHistory';
import { getPrefinishedItems } from './db/session';
import { PersonEx } from 'tsclients/proto/atoms.pb';
import { EventsGetRatingTableResponse } from 'tsclients/proto/mimir.pb';
import { Penalty } from 'database/schema';
import { FreyService } from 'services/Frey';
import { DatabaseService } from 'services/Database';

export async function getRatingTable(
  db: DatabaseService,
  frey: FreyService,
  eventIdList: number[],
  orderBy: string,
  order: 'asc' | 'desc',
  isAdmin: boolean,
  onlyMinGames: boolean,
  dateFrom: string | null,
  dateTo: string | null
): Promise<EventsGetRatingTableResponse> {
  const events = await db.client
    .selectFrom('event')
    .select(['id', 'sort_by_games', 'min_games_count', 'ruleset_config', 'timezone']) // TODO
    .where('id', 'in', eventIdList)
    .execute();
  const mainEvent = events.find((e) => e.id === eventIdList[0]);
  if (!mainEvent) {
    throw new Error('Main event not found');
  }
  const ruleset = createRuleset('custom', mainEvent.ruleset_config);
  const dataItems: PlayerHistoryItem[] = isAdmin
    ? await getPrefinishedItems(db, ruleset, eventIdList)
    : await getHistoryItems(db, ruleset, eventIdList, mainEvent.timezone, dateFrom, dateTo);
  const playerItems = (await frey.GetPersonalInfo({ ids: dataItems.map((item) => item.player_id) }))
    .people;

  const regData = await db.client
    .selectFrom('event_registered_players')
    .select(['player_id', 'team_name'])
    .where('event_id', '=', mainEvent.id)
    .execute();
  const penalties = await db.client
    .selectFrom('penalty')
    .selectAll()
    .where('event_id', 'in', eventIdList)
    .execute();

  const historyItems = mergeData(
    mergeSeveralEvents(dataItems, ruleset),
    playerItems,
    regData,
    penalties
  );
  const data = sortItems(orderBy, playerItems, historyItems);

  if (order === 'desc') {
    data.reverse();
  }

  if (mainEvent.sort_by_games) {
    data.sort((a, b) => b.games_played - a.games_played);
  }

  if (onlyMinGames) {
    data.filter((r) => r.games_played >= mainEvent.min_games_count);
  }

  return {
    list: data.map((item) => ({
      id: item.player_id,
      title: item.playerTitle,
      tenhouId: item.playerTenhouId,
      rating: item.rating,
      chips: item.chips ?? 0,
      winnerZone: item.rating - item.penaltiesAmount >= ruleset.rules.startRating,
      avgPlace: item.avg_place,
      avgScore: item.avg_score,
      gamesPlayed: item.games_played,
      teamName: item.playerTeamName,
      hasAvatar: item.playerHasAvatar,
      lastUpdate: item.playerLastUpdate,
      penaltiesAmount: item.penaltiesAmount,
      penaltiesCount: item.penaltiesCount,
    })),
  };
}

async function getHistoryItems(
  db: DatabaseService,
  ruleset: Ruleset,
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
    return calculateHistory(itemsFrom, itemsTo, ruleset);
  }

  if (dateFromUtc && !dateToUtc) {
    const itemsFrom = await findLastByEventAndDate(db, eventIds, dateFromUtc);
    const itemsTo = await findLastByEvent(db, eventIds);
    return calculateHistory(itemsFrom, itemsTo, ruleset);
  }

  if (!dateFromUtc && dateToUtc) {
    return await findLastByEventAndDate(db, eventIds, dateToUtc);
  }

  return await findLastByEvent(db, eventIds);
}

// Input: items from several events, may contain several items for same player
// Output: items merged, only one item per player, unsorted
export function mergeSeveralEvents(
  items: PlayerHistoryItem[],
  ruleset: Ruleset
): PlayerHistoryItem[] {
  const result: Record<number, PlayerHistoryItem> = {};
  for (const item of items) {
    if (!result[item.player_id]) {
      result[item.player_id] = item;
    } else {
      result[item.player_id] = makeHistoryItemsSum(result[item.player_id], item, ruleset);
    }
  }
  return Object.values(result);
}

export function mergeData(
  items: PlayerHistoryItem[],
  playerItems: PersonEx[],
  regData: Array<{ player_id: number; team_name: string | null }>,
  penalties: Array<Omit<Penalty, 'id'> & { id?: number }>
): Array<
  PlayerHistoryItem & {
    avg_score: number;
    playerTitle: string;
    playerTenhouId: string;
    playerTeamName: string | null;
    playerHasAvatar: boolean;
    playerLastUpdate: string;
    penaltiesAmount: number;
    penaltiesCount: number;
  }
> {
  const teamNames = regData.reduce(
    (acc, item) => {
      acc[item.player_id] = item.team_name;
      return acc;
    },
    {} as Record<number, string | null>
  );
  const playersMap = playerItems.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<number, PersonEx>
  );
  const penaltiesMap = penalties.reduce(
    (acc, item) => {
      if (!acc[item.player_id]) {
        acc[item.player_id] = { penaltiesCount: 0, penaltiesAmount: 0 };
      }
      acc[item.player_id].penaltiesCount++;
      acc[item.player_id].penaltiesAmount += item.amount;
      return acc;
    },
    {} as Record<number, { penaltiesCount: number; penaltiesAmount: number }>
  );
  return items.map((item) => ({
    ...item,
    avg_score: item.rating / item.games_played,
    playerTitle: playersMap[item.player_id].title,
    playerTenhouId: playersMap[item.player_id].tenhouId,
    playerTeamName: teamNames[item.player_id],
    playerHasAvatar: playersMap[item.player_id].hasAvatar,
    playerLastUpdate: playersMap[item.player_id].lastUpdate,
    ...penaltiesMap[item.player_id],
  }));
}

export function sortItems<T extends PlayerHistoryItem & { avg_score: number }>(
  orderBy: string,
  playerItems: Record<number, PersonEx>,
  ratingLines: T[]
): T[] {
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
