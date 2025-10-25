import { EntityBase } from 'entities/EntityBase';
import { Moment } from 'moment-timezone';
import { Ruleset } from 'rulesets/ruleset';
import { PlayerHistoryItem, updateAvgPlaceAndGamesCount } from './playerHistory';

export class PlayerHistoryEntity extends EntityBase {
  async findLastByEvent(eventIds: number[]): Promise<PlayerHistoryItem[]> {
    const ids = await this.repo.db.client
      .selectFrom('player_history')
      .select([({ fn }) => fn.max('player_history.id').as('mx'), 'player_id', 'event_id'])
      .where('event_id', 'in', eventIds)
      .groupBy(['player_id', 'event_id'])
      .execute();
    return await this.repo.db.client
      .selectFrom('player_history')
      .selectAll()
      .where(
        'id',
        'in',
        ids.map((i) => i.mx)
      )
      .execute();
  }

  async findLastByEventAndDate(
    eventIds: number[],
    date: Moment | null
  ): Promise<PlayerHistoryItem[]> {
    let expr = this.repo.db.client
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
    return await this.repo.db.client
      .selectFrom('player_history')
      .selectAll()
      .where(
        'id',
        'in',
        ids.map((i) => i.mx)
      )
      .execute();
  }

  async findLastByEventAndPlayer(eventId: number, playerId: number): Promise<PlayerHistoryItem[]> {
    return await this.repo.db.client
      .selectFrom('player_history')
      .selectAll()
      .where('player_id', '=', playerId)
      .where('event_id', '=', eventId)
      .orderBy('id', 'desc')
      .limit(1)
      .execute();
  }

  async findAllLastByEventAndPlayer(eventId: number): Promise<PlayerHistoryItem[]> {
    return await this.repo.db.client
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

  async findLastBySessionAndPlayer(
    sessionId: number,
    playerId: number
  ): Promise<PlayerHistoryItem[]> {
    return await this.repo.db.client
      .selectFrom('player_history')
      .selectAll()
      .where('player_id', '=', playerId)
      .where('session_id', '=', sessionId)
      .orderBy('id', 'desc')
      .limit(1)
      .execute();
  }

  async findBySession(sessionId: number): Promise<PlayerHistoryItem[]> {
    return await this.repo.db.client
      .selectFrom('player_history')
      .selectAll()
      .where('session_id', '=', sessionId)
      .execute();
  }

  async makeNewHistoryItem(
    ruleset: Ruleset,
    playerId: number,
    eventId: number,
    sessionId: number,
    ratingDelta: number,
    place: number,
    chips?: number
  ): Promise<PlayerHistoryItem> {
    const items: Array<PlayerHistoryItem> = await this.findLastByEventAndPlayer(playerId, eventId);

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
      await this.repo.db.client.insertInto('player_history').values(prevItem).execute();
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
}
