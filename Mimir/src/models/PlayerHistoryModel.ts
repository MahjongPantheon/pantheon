import { Moment } from 'moment-timezone';
import { Ruleset } from 'src/rulesets/ruleset.js';
import { Model } from './Model.js';
import { PlayerHistoryEntity } from 'src/entities/db/PlayerHistory.entity.js';
import { EventEntity } from 'src/entities/db/Event.entity.js';
import { sql } from '@mikro-orm/core';

export class PlayerHistoryModel extends Model {
  async findLastByEvent(eventIds: number[]) {
    const qb = this.repo.db.em
      .getKnex()
      .from('player_history')
      .select([sql`max(id) as mx`, 'player_id', 'event_id'])
      .where({ event: this.repo.db.em.getReference(EventEntity, eventIds) })
      .groupBy(['player_id', 'event_id']);
    const ids = await this.repo.db.em.execute(qb);
    return this.repo.db.em.findAll(PlayerHistoryEntity, {
      where: { id: ids.map((i) => i.mx) },
    });
  }

  async findLastByEventAndDate(eventIds: number[], date: Moment | null) {
    const qb = this.repo.db.em
      .getKnex()
      .from('player_history')
      .leftJoin('session', 'session.id', 'player_history.session_id')
      .select([
        sql`max(player_history.id) as mx`,
        'player_history.player_id',
        'player_history.event_id',
      ])
      .where({
        event: this.repo.db.em.getReference(EventEntity, eventIds),
        ...(date ? { 'session.end_date': { $lt: date.utc().format('YYYY-MM-DD HH:mm:ss') } } : {}),
      })
      .groupBy(['player_history.player_id', 'player_history.event_id']);

    const ids = await this.repo.db.em.execute(qb);
    return this.repo.db.em.findAll(PlayerHistoryEntity, {
      where: { id: ids.map((i) => i.mx) },
    });
  }

  async findLastByEventAndPlayer(eventId: number, playerId: number) {
    return this.repo.db.em.findOne(
      PlayerHistoryEntity,
      {
        event: this.repo.db.em.getReference(EventEntity, eventId),
        playerId,
      },
      { orderBy: { id: -1 } }
    );
  }

  async findAllLastByEventAndPlayer(eventId: number) {
    const qb = this.repo.db.em
      .getKnex()
      .from('player_history as ph1')
      .select('ph1.*')
      .leftJoin('player_history as ph2', 'ph2.event_id', 'ph1.event_id')
      .where('ph1.event_id', '=', eventId)
      .where('ph2.games_played', '>', 'ph1.games_played')
      .where('ph2.id', 'is', null);
    const result = await this.repo.db.em.execute(qb);
    return result.map((row) => this.repo.db.em.map(PlayerHistoryEntity, row));
  }

  async findLastBySessionAndPlayer(sessionId: number, playerId: number) {
    return this.repo.db.em.findOne(
      PlayerHistoryEntity,
      {
        sessionId,
        playerId,
      },
      { orderBy: { id: -1 } }
    );
  }

  async findBySession(sessionId: number) {
    return this.repo.db.em.findAll(PlayerHistoryEntity, {
      where: { sessionId },
    });
  }

  async makeNewHistoryItem(
    ruleset: Ruleset,
    playerId: number,
    eventId: number,
    sessionId: number,
    ratingDelta: number,
    place: number,
    chips?: number
  ) {
    const item = await this.findLastByEventAndPlayer(playerId, eventId);

    let prevItem: PlayerHistoryEntity;
    if (!item) {
      prevItem = new PlayerHistoryEntity();
      prevItem.playerId = playerId;
      prevItem.event = this.repo.db.em.getReference(EventEntity, eventId);
      prevItem.sessionId = sessionId;
      prevItem.gamesPlayed = 0;
      prevItem.avgPlace = 0;
      prevItem.rating = ruleset.rules.startRating;
      prevItem.chips = chips;
      await this.repo.db.em.persistAndFlush(prevItem);
    } else {
      prevItem = item;
    }

    const newItem = new PlayerHistoryEntity();
    newItem.playerId = playerId;
    newItem.event = this.repo.db.em.getReference(EventEntity, eventId);
    newItem.sessionId = sessionId;
    newItem.gamesPlayed = prevItem.gamesPlayed;
    newItem.avgPlace = prevItem.avgPlace;
    newItem.rating = prevItem.rating + ratingDelta;
    newItem.chips = ruleset.rules.chipsValue > 0 ? (prevItem.chips ?? 0) + (chips ?? 0) : 0;

    return this.updateAvgPlaceAndGamesCount(newItem, place);
  }

  public makeNewHistoryItemsForSession(
    lastResultsMap: Record<number, PlayerHistoryEntity>,
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
  ) {
    const lastResults: Record<number, PlayerHistoryEntity> = {};
    for (const playerId in lastResultsMap) {
      const item = new PlayerHistoryEntity();
      item.playerId = parseInt(playerId, 10);
      item.event = this.repo.db.em.getReference(EventEntity, eventId);
      item.sessionId = sessionId;
      item.gamesPlayed = lastResultsMap[playerId].gamesPlayed;
      item.avgPlace = lastResultsMap[playerId].avgPlace;
      item.rating = lastResultsMap[playerId].rating + playersData[playerId].ratingDelta;
      item.chips =
        ruleset.rules.chipsValue > 0
          ? (lastResultsMap[playerId].chips ?? 0) + (playersData[playerId].chips ?? 0)
          : 0;
      lastResults[parseInt(playerId, 10)] = this.updateAvgPlaceAndGamesCount(
        item,
        playersData[playerId].place
      );
    }

    return lastResults;
  }

  public updateAvgPlaceAndGamesCount(item: PlayerHistoryEntity, place: number) {
    item = { ...item };
    let placesSum = item.gamesPlayed * item.avgPlace;
    placesSum += place;
    item.gamesPlayed += 1;
    item.avgPlace = placesSum / item.gamesPlayed;
    return item;
  }

  public makeHistoryItemsSum(
    source: PlayerHistoryEntity,
    add: PlayerHistoryEntity,
    ruleset: Ruleset
  ): PlayerHistoryEntity {
    const sum = new PlayerHistoryEntity();
    sum.playerId = source.playerId;
    sum.event = source.event;
    sum.sessionId = source.sessionId;
    sum.gamesPlayed = source.gamesPlayed + add.gamesPlayed;
    sum.avgPlace =
      (source.avgPlace * source.gamesPlayed + add.avgPlace * add.gamesPlayed) /
      (source.gamesPlayed + add.gamesPlayed);
    sum.rating = source.rating + (add.rating - ruleset.rules.startRating);
    sum.chips = source.chips === undefined ? undefined : source.chips + (add.chips ?? 0);
    return sum;
  }

  public makeHistoryItemsDiff(
    source: PlayerHistoryEntity,
    sub: PlayerHistoryEntity,
    ruleset: Ruleset
  ): PlayerHistoryEntity {
    const diff = new PlayerHistoryEntity();
    diff.playerId = source.playerId;
    diff.event = source.event;
    diff.sessionId = source.sessionId;
    diff.gamesPlayed = Math.abs(source.gamesPlayed - sub.gamesPlayed);
    diff.avgPlace =
      Math.abs(source.avgPlace * source.gamesPlayed - sub.avgPlace * sub.gamesPlayed) /
      Math.abs(source.gamesPlayed - sub.gamesPlayed);
    diff.rating = source.rating - (sub.rating - ruleset.rules.startRating);
    diff.chips = source.chips === undefined ? undefined : source.chips - (sub.chips ?? 0);
    return diff;
  }

  public calculateHistory(
    itemsFrom: Array<PlayerHistoryEntity>,
    itemsTo: Array<PlayerHistoryEntity>,
    ruleset: Ruleset
  ) {
    const fromMap = new Map<string, PlayerHistoryEntity>();
    for (const item of itemsFrom) {
      fromMap.set(item.playerId + '_' + item.event.id, item);
    }
    const result = [];
    for (const item of itemsTo) {
      const fromItem = fromMap.get(item.playerId + '_' + item.event.id);
      if (fromItem) {
        if (fromItem.gamesPlayed === item.gamesPlayed) {
          result.push(this.makeHistoryItemsDiff(item, fromItem, ruleset));
        }
      } else {
        result.push(item);
      }
    }
    return result;
  }
}
