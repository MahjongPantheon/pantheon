import { Database } from '../../database/db';
import { PlayerHistory } from '../../database/schema';
import { Moment } from 'moment-timezone';
import { Ruleset } from '../../rulesets/ruleset';

export type PlayerHistoryItem = Omit<PlayerHistory, 'id'> & { id?: number };

export async function findLastByEvent(
  db: Database,
  eventIds: number[]
): Promise<PlayerHistoryItem[]> {
  const ids = await db
    .selectFrom('player_history')
    .select([({ fn }) => fn.max('player_history.id').as('mx'), 'player_id', 'event_id'])
    .where('event_id', 'in', eventIds)
    .groupBy(['player_id', 'event_id'])
    .execute();
  return await db
    .selectFrom('player_history')
    .selectAll()
    .where(
      'id',
      'in',
      ids.map((i) => i.mx)
    )
    .execute();
}

export async function findLastByEventAndDate(
  db: Database,
  eventIds: number[],
  date: Moment | null
): Promise<PlayerHistoryItem[]> {
  let expr = db
    .selectFrom('player_history')
    .select([
      ({ fn }) => fn.max('player_history.id').as('mx'),
      'player_history.player_id',
      'player_history.event_id',
    ])
    .leftJoin('session', 'session.id', 'player_history.session_id');
  if (date) {
    expr = expr.where('session.end_date', '<', date.utc().format('YYYY-MM-DD HH:mm:ss'));
  }

  expr = expr
    .where('player_history.event_id', 'in', eventIds)
    .groupBy(['player_history.player_id', 'player_history.event_id']);
  const ids = await expr.execute();
  return await db
    .selectFrom('player_history')
    .selectAll()
    .where(
      'id',
      'in',
      ids.map((i) => i.mx)
    )
    .execute();
}

export async function findLastByEventAndPlayer(
  db: Database,
  eventId: number,
  playerId: number
): Promise<PlayerHistoryItem[]> {
  return await db
    .selectFrom('player_history')
    .selectAll()
    .where('player_id', '=', playerId)
    .where('event_id', '=', eventId)
    .orderBy('id', 'desc')
    .limit(1)
    .execute();
}

export async function findAllLastByEventAndPlayer(
  db: Database,
  eventId: number
): Promise<PlayerHistoryItem[]> {
  return await db
    .selectFrom('player_history as ph1')
    .selectAll('ph1')
    .leftJoin('player_history as ph2', (join) =>
      join.onRef('ph2.event_id', '=', 'ph1.event_id').onRef('ph2.player_id', '=', 'ph1.player_id')
    )
    .where('ph1.event_id', '=', eventId)
    .whereRef('ph2.games_played', '>', 'ph1.games_played')
    .where('ph2.id', 'is', null)
    .execute();
}

export async function findLastBySessionAndPlayer(
  db: Database,
  sessionId: number,
  playerId: number
): Promise<PlayerHistoryItem[]> {
  return await db
    .selectFrom('player_history')
    .selectAll()
    .where('player_id', '=', playerId)
    .where('session_id', '=', sessionId)
    .orderBy('id', 'desc')
    .limit(1)
    .execute();
}

export async function findBySession(db: Database, sessionId: number): Promise<PlayerHistoryItem[]> {
  return await db
    .selectFrom('player_history')
    .selectAll()
    .where('session_id', '=', sessionId)
    .execute();
}

export async function makeNewHistoryItem(
  db: Database,
  ruleset: Ruleset,
  playerId: number,
  eventId: number,
  sessionId: number,
  ratingDelta: number,
  place: number,
  chips?: number
): Promise<PlayerHistoryItem> {
  const items: Array<PlayerHistoryItem> = await findLastByEventAndPlayer(db, playerId, eventId);

  let prevItem;
  if (items.length === 0) {
    prevItem = {
      player_id: playerId,
      event_id: eventId,
      session_id: sessionId,
      games_played: 0,
      avg_place: 0,
      rating: ruleset.rules.startRating,
      chips: chips ?? null,
    };
    await db.insertInto('player_history').values(prevItem).execute();
  } else {
    prevItem = items[0];
  }

  return updateAvgPlaceAndGamesCount(
    {
      player_id: playerId,
      event_id: eventId,
      session_id: sessionId,
      games_played: prevItem.games_played,
      avg_place: prevItem.avg_place,
      rating: prevItem.rating + ratingDelta,
      chips: ruleset.rules.chipsValue > 0 ? (prevItem.chips ?? 0) + (chips ?? 0) : 0,
    },
    place
  );
}

export function makeNewHistoryItemsForSession(
  lastResultsMap: Record<number, PlayerHistoryItem>,
  ruleset: Ruleset,
  eventId: number,
  sessionId: number,
  playersData: Record<
    number, // playerId
    {
      ratingDelta: number;
      place: number;
      chips?: number;
    }
  >
): Record<number, PlayerHistoryItem> {
  const lastResults: Record<number, PlayerHistoryItem> = {};
  for (const playerId in lastResultsMap) {
    lastResults[parseInt(playerId, 10)] = updateAvgPlaceAndGamesCount(
      {
        player_id: parseInt(playerId, 10),
        event_id: eventId,
        session_id: sessionId,
        games_played: lastResultsMap[playerId].games_played,
        avg_place: lastResultsMap[playerId].avg_place,
        rating: lastResultsMap[playerId].rating + playersData[playerId].ratingDelta,
        chips:
          ruleset.rules.chipsValue > 0
            ? (lastResultsMap[playerId].chips ?? 0) + (playersData[playerId].chips ?? 0)
            : 0,
      },
      playersData[playerId].place
    );
  }

  return lastResults;
}

export function updateAvgPlaceAndGamesCount(item: PlayerHistoryItem, place: number) {
  item = { ...item };
  let placesSum = item.games_played * item.avg_place;
  placesSum += place;
  item.games_played += 1;
  item.avg_place = placesSum / item.games_played;
  return item;
}

export function makeHistoryItemsSum(
  source: PlayerHistoryItem,
  add: PlayerHistoryItem,
  ruleset: Ruleset
): PlayerHistoryItem {
  return {
    player_id: source.player_id,
    event_id: source.event_id,
    session_id: source.session_id,
    games_played: source.games_played + add.games_played,
    avg_place:
      (source.avg_place * source.games_played + add.avg_place * add.games_played) /
      (source.games_played + add.games_played),
    rating: source.rating + (add.rating - ruleset.rules.startRating),
    chips: source.chips === null ? null : source.chips + (add.chips ?? 0),
  };
}

export function makeHistoryItemsDiff(
  source: PlayerHistoryItem,
  sub: PlayerHistoryItem,
  ruleset: Ruleset
): PlayerHistoryItem {
  return {
    player_id: source.player_id,
    event_id: source.event_id,
    session_id: source.session_id,
    games_played: Math.abs(source.games_played - sub.games_played),
    avg_place:
      Math.abs(source.avg_place * source.games_played - sub.avg_place * sub.games_played) /
      Math.abs(source.games_played - sub.games_played),
    rating: source.rating - (sub.rating - ruleset.rules.startRating),
    chips: source.chips === null ? null : source.chips - (sub.chips ?? 0),
  };
}

export function calculateHistory(
  itemsFrom: Array<PlayerHistoryItem>,
  itemsTo: Array<PlayerHistoryItem>,
  ruleset: Ruleset
) {
  const fromMap = new Map<string, PlayerHistoryItem>();
  for (const item of itemsFrom) {
    fromMap.set(item.player_id + '_' + item.event_id, item);
  }
  const result = [];
  for (const item of itemsTo) {
    const fromItem = fromMap.get(item.player_id + '_' + item.event_id);
    if (fromItem) {
      if (fromItem.games_played === item.games_played) {
        result.push(makeHistoryItemsDiff(item, fromItem, ruleset));
      }
    } else {
      result.push(item);
    }
  }
  return result;
}
