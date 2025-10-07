import { Database } from '../../database/db';
import { Database as DB, PlayerHistory, Session, SessionPlayer } from '../../database/schema';
import { SessionStatus } from 'tsclients/proto/atoms.pb';
import { OrderByExpression } from 'kysely';
import moment from 'moment-timezone';
import { getUnfinishedSessionResults } from './sessionResults';
import {
  findAllLastByEventAndPlayer,
  makeNewHistoryItemsForSession,
  PlayerHistoryItem,
} from './playerHistory';
import { Ruleset } from '../../rulesets/ruleset';
import { SessionState } from '../../helpers/SessionState';

export async function findById(db: Database, id: number) {
  return db.selectFrom('session').selectAll().where('id', '=', id).execute();
}

export async function findByReplayHashAndEvent(db: Database, eventId: number, replayHash: string) {
  return db
    .selectFrom('session')
    .selectAll()
    .where('event_id', '=', eventId)
    .where('replay_hash', '=', replayHash)
    .execute();
}

export async function findAllInProgress(db: Database) {
  return db
    .selectFrom('session')
    .where('status', '=', SessionStatus.SESSION_STATUS_INPROGRESS)
    .execute();
}

// TODO: memoize
export async function findByRepresentationalHash(db: Database, hashList: string[]) {
  return db
    .selectFrom('session')
    .selectAll()
    .where('representational_hash', 'in', hashList)
    .execute();
}

export async function findByEventAndStatus(
  db: Database,
  eventIds: number[],
  status: SessionStatus[],
  offset = 0,
  limit: number | null = null,
  orderBy: OrderByExpression<DB, 'session', Session> = 'id',
  order: 'asc' | 'desc' = 'desc'
) {
  let qb = db
    .selectFrom('session')
    .selectAll()
    .where('status', 'in', status)
    .where('event_id', 'in', eventIds);
  if (limit) {
    qb = qb.limit(limit);
  }
  return qb.offset(offset).orderBy(orderBy, order).execute();
}

export async function getPlayersSeatingInEvent(db: Database, eventId: number) {
  return db
    .selectFrom('session')
    .leftJoin('session_player', 'session_player.session_id', 'session.id')
    .select('session_player.player_id')
    .select('session_player.order')
    .where('session.event_id', '=', eventId)
    .orderBy('session.id', 'asc')
    .orderBy('session_player.order', 'asc')
    .execute();
}

export async function findByPlayerAndEvent(
  db: Database,
  playerId: number,
  eventId: number,
  withStatus: SessionStatus | '*' = '*',
  dateFrom?: string,
  dateTo?: string
) {
  let qb = db
    .selectFrom('session')
    .selectAll('session')
    .leftJoin('session_player', 'session_player.session_id', 'session.id')
    .where('session_player.player_id', '=', playerId)
    .where('session.event_id', '=', eventId)
    .groupBy('session.id');

  if (withStatus !== '*') {
    qb = qb.where('session.status', '=', withStatus);
  }
  if (dateFrom) {
    qb = qb.where('session.end_date', '>=', moment(dateFrom).utc().format('YYYY-MM-DD HH:mm:ss'));
  }
  if (dateTo) {
    qb = qb.where('session.end_date', '<', moment(dateTo).utc().format('YYYY-MM-DD HH:mm:ss'));
  }
  return qb.execute();
}

export async function findLastByPlayerAndEvent(
  db: Database,
  playerId: number,
  eventId: number,
  withStatus: SessionStatus | '*' = '*'
) {
  let qb = db
    .selectFrom('session')
    .selectAll('session')
    .leftJoin('session_player', 'session_player.session_id', 'session.id');
  if (withStatus !== '*') {
    qb = qb.where('session.status', '=', withStatus);
  }
  qb = qb
    .where('session_player.player_id', '=', playerId)
    .where('session.event_id', '=', eventId)
    .orderBy('session.id', 'desc')
    .limit(1);

  return qb.execute();
}

export async function getGamesCount(
  db: Database,
  eventIdList: number[],
  withStatus: SessionStatus
) {
  return Number(
    (
      await db
        .selectFrom('session')
        .select(({ fn }) => fn.count('id').as('cnt'))
        .where('event_id', 'in', eventIdList)
        .where('status', '=', withStatus)
        .execute()
    )[0].cnt
  );
}

function groupBySession(items: Array<Omit<SessionPlayer, 'id'>>): Record<number, number[]> {
  const result: Record<number, number[]> = {};
  for (const item of items) {
    if (result[item.session_id]) {
      result[item.session_id].push(item.player_id);
    } else {
      result[item.session_id] = [item.player_id];
    }
  }
  return result;
}

export async function getPrefinishedItems(
  db: Database,
  ruleset: Ruleset,
  eventIds: number[]
): Promise<Omit<PlayerHistory, 'id'>[]> {
  const sessions = await findByEventAndStatus(db, eventIds, [
    SessionStatus.SESSION_STATUS_PREFINISHED,
  ]);

  const sessionPlayers = groupBySession(
    await db
      .selectFrom('session_player')
      .selectAll()
      .where(
        'session_id',
        'in',
        sessions.map((s) => s.id)
      )
      .execute()
  );

  // Note: query in loop; though we don't expect too many eventIds in list as it's undocumented
  // lastResults[eventId][sessionId][playerId]
  const lastResults = await Promise.all(
    eventIds.map((eventId) => findAllLastByEventAndPlayer(db, eventId))
  ).then((results) =>
    results.reduce(
      (acc, eventResults) => {
        acc[eventResults[0].event_id] = eventResults.reduce(
          (acc2, item) => {
            if (!acc2[item.session_id]) {
              acc2[item.session_id] = {};
            }
            acc2[item.session_id][item.player_id] = item;
            return acc2;
          },
          {} as Record<number, Record<number, PlayerHistoryItem>>
        );
        return acc;
      },
      {} as Record<number, Record<number, Record<number, PlayerHistoryItem>>>
    )
  );

  // Apply prefinished results to the last state hash
  for (const session of sessions) {
    if (!session.intermediate_results) {
      continue;
    }
    const sessionState = SessionState.fromJson(
      ruleset,
      sessionPlayers[session.id],
      session.intermediate_results
    );
    const sessionResults = getUnfinishedSessionResults(
      ruleset,
      session.event_id,
      session.id,
      sessionState,
      sessionPlayers[session.id]
    );
    lastResults[session.event_id][session.id] = makeNewHistoryItemsForSession(
      lastResults[session.event_id][session.id],
      ruleset,
      session.event_id,
      session.id,
      sessionResults.reduce(
        (acc, item) => {
          acc[item.player_id] = {
            ratingDelta: item.rating_delta,
            place: item.place,
            chips: item.chips ?? undefined,
          };
          return acc;
        },
        {} as Record<number, { ratingDelta: number; place: number; chips?: number }>
      )
    );
  }

  // Flatten last results back, no sorting required
  let historyItems: Omit<PlayerHistory, 'id'>[] = [];
  for (const eventId in lastResults) {
    historyItems = historyItems.concat(
      Object.values(lastResults[eventId])
        .map((res) => Object.values(res))
        .flat()
    );
  }

  return historyItems;
}
