import { Database } from '../../database/db';
import { PlayerHistory } from '../../database/schema';
import { Moment } from 'moment-timezone';
import { Ruleset } from '../../rulesets/ruleset';

type PlayerHistoryItem = Omit<PlayerHistory, 'id'> & { id: number };

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
): Promise<Omit<PlayerHistory, 'id'>> {
  const items: Array<Omit<PlayerHistory, 'id'>> = await findLastByEventAndPlayer(
    db,
    playerId,
    eventId
  );

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

export function updateAvgPlaceAndGamesCount(item: Omit<PlayerHistory, 'id'>, place: number) {
  let placesSum = item.games_played * item.avg_place;
  placesSum += place;
  item.games_played += 1;
  item.avg_place = placesSum / item.games_played;
  return item;
}

export function makeHistoryItemsSum(
  source: Omit<PlayerHistory, 'id'>,
  add: Omit<PlayerHistory, 'id'>
): Omit<PlayerHistory, 'id'> {
  return {
    player_id: source.player_id,
    event_id: source.event_id,
    session_id: source.session_id,
    games_played: source.games_played + add.games_played,
    avg_place:
      (source.avg_place * source.games_played + add.avg_place * add.games_played) /
      (source.games_played + add.games_played),
    rating: source.rating + add.rating,
    chips: source.chips === null ? null : source.chips + (add.chips ?? 0),
  };
}

export function makeHistoryItemsDiff(
  source: Omit<PlayerHistory, 'id'>,
  sub: Omit<PlayerHistory, 'id'>
): Omit<PlayerHistory, 'id'> {
  return {
    player_id: source.player_id,
    event_id: source.event_id,
    session_id: source.session_id,
    games_played: Math.abs(source.games_played - sub.games_played),
    avg_place:
      Math.abs(source.avg_place * source.games_played - sub.avg_place * sub.games_played) /
      Math.abs(source.games_played - sub.games_played),
    rating: source.rating - sub.rating,
    chips: source.chips === null ? null : source.chips - (sub.chips ?? 0),
  };
}

export function calculateHistory(
  itemsFrom: Array<Omit<PlayerHistory, 'id'>>,
  itemsTo: Array<Omit<PlayerHistory, 'id'>>
) {
  const fromMap = new Map<string, Omit<PlayerHistory, 'id'>>();
  for (const item of itemsFrom) {
    fromMap.set(item.player_id + '_' + item.event_id, item);
  }
  const result = [];
  for (const item of itemsTo) {
    const fromItem = fromMap.get(item.player_id + '_' + item.event_id);
    if (fromItem) {
      if (fromItem.games_played === item.games_played) {
        result.push(makeHistoryItemsDiff(item, fromItem));
      }
    } else {
      result.push(item);
    }
  }
  return result;
}
