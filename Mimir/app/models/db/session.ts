import { Database } from '../../database/db';
import { Database as DB, Session } from '../../database/schema';
import { SessionStatus } from 'tsclients/proto/atoms.pb';
import { OrderByExpression } from 'kysely';
import moment from 'moment-timezone';

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
