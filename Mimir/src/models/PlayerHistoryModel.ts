import { Moment } from 'moment-timezone';
import { Model } from './Model.js';
import { PlayerHistoryEntity } from 'src/entities/PlayerHistory.entity.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { sql } from '@mikro-orm/core';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import moment from 'moment';
import { PersonEx } from 'tsclients/proto/atoms.pb.js';
import { PenaltyEntity } from 'src/entities/Penalty.entity.js';
import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';

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
    ruleset: RulesetEntity,
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
    ruleset: RulesetEntity,
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
    ruleset: RulesetEntity
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
    ruleset: RulesetEntity
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
    ruleset: RulesetEntity
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

  async getHistoryItems(
    ruleset: RulesetEntity,
    eventIds: number[],
    timezone: string,
    dateFrom: string | null,
    dateTo: string | null
  ): Promise<Array<PlayerHistoryEntity>> {
    const dateFromUtc = dateFrom ? moment.tz(dateFrom, timezone).utc() : null;
    const dateToUtc = dateTo ? moment.tz(dateTo, timezone).utc() : null;

    if (dateFromUtc && dateToUtc) {
      const itemsFrom = await this.findLastByEventAndDate(eventIds, dateFromUtc);
      const itemsTo = await this.findLastByEventAndDate(eventIds, dateToUtc);
      return this.calculateHistory(itemsFrom, itemsTo, ruleset);
    }

    if (dateFromUtc && !dateToUtc) {
      const itemsFrom = await this.findLastByEventAndDate(eventIds, dateFromUtc);
      const itemsTo = await this.findLastByEvent(eventIds);
      return this.calculateHistory(itemsFrom, itemsTo, ruleset);
    }

    if (!dateFromUtc && dateToUtc) {
      return await this.findLastByEventAndDate(eventIds, dateToUtc);
    }

    return await this.findLastByEvent(eventIds);
  }

  // Input: items from several events, may contain several items for same player
  // Output: items merged, only one item per player, unsorted
  mergeSeveralEvents(items: PlayerHistoryEntity[], ruleset: RulesetEntity): PlayerHistoryEntity[] {
    const result: Record<number, PlayerHistoryEntity> = {};
    for (const item of items) {
      if (!result[item.playerId]) {
        result[item.playerId] = item;
      } else {
        result[item.playerId] = this.makeHistoryItemsSum(result[item.playerId], item, ruleset);
      }
    }
    return Object.values(result);
  }

  mergeData(
    items: PlayerHistoryEntity[],
    playerItems: PersonEx[],
    regData: EventRegisteredPlayersEntity[],
    penalties: Array<Omit<PenaltyEntity, 'id'> & { id?: number }>
  ): Array<PlayerHistoryEntity> {
    const teamNames = regData.reduce(
      (acc, item) => {
        acc[item.playerId] = item.teamName;
        return acc;
      },
      {} as Record<number, string | undefined>
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
        if (!acc[item.playerId]) {
          acc[item.playerId] = { penaltiesCount: 0, penaltiesAmount: 0 };
        }
        acc[item.playerId].penaltiesCount++;
        acc[item.playerId].penaltiesAmount += item.amount;
        return acc;
      },
      {} as Record<number, { penaltiesCount: number; penaltiesAmount: number }>
    );
    return items.map((item) => {
      item.avgScore = item.rating / item.gamesPlayed;
      item.playerTitle = playersMap[item.playerId].title;
      item.playerTenhouId = playersMap[item.playerId].tenhouId;
      item.playerTeamName = teamNames[item.playerId];
      item.playerHasAvatar = playersMap[item.playerId].hasAvatar;
      item.playerLastUpdate = playersMap[item.playerId].lastUpdate;
      item.penaltiesAmount = penaltiesMap[item.playerId].penaltiesAmount;
      item.penaltiesCount = penaltiesMap[item.playerId].penaltiesCount;
      return item;
    });
  }

  sortItems(
    orderBy: string,
    playerItems: Record<number, PersonEx>,
    ratingLines: PlayerHistoryEntity[]
  ): PlayerHistoryEntity[] {
    ratingLines = [...ratingLines];
    switch (orderBy) {
      case 'name':
        return ratingLines.sort((a, b) =>
          playerItems[b.playerId].title.localeCompare(playerItems[a.playerId].title)
        );
      case 'rating':
        return ratingLines.sort((a, b) => {
          if (Math.abs(a.rating - b.rating) < 0.0001) {
            return b.avgPlace - a.avgPlace; // lower is better
          }
          return a.rating - b.rating;
        });
      case 'games_and_rating':
        return ratingLines.sort((a, b) => {
          if (a.gamesPlayed !== b.gamesPlayed) {
            return a.gamesPlayed - b.gamesPlayed;
          }
          if (Math.abs(a.rating - b.rating) < 0.0001) {
            return b.avgPlace - a.avgPlace;
          }
          return a.rating - b.rating;
        });
      case 'avg_place':
        return ratingLines.sort((a, b) => {
          if (Math.abs(a.avgPlace - b.avgPlace) < 0.0001) {
            return b.rating - a.rating;
          }
          return a.avgPlace - b.avgPlace;
        });
      case 'avg_score':
        return ratingLines.sort((a, b) => {
          if (a.avgScore === undefined || b.avgScore === undefined) {
            return 0;
          }
          if (Math.abs(a.avgScore - b.avgScore) < 0.0001) {
            return b.avgPlace - a.avgPlace;
          }
          return a.avgScore - b.avgScore;
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
}
