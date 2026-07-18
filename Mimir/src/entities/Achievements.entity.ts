import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity.js';

export type AchievementsData = Partial<{
  bestHand: {
    han: number;
    playerIds: number[];
  };
  bestTsumoist: {
    tsumo: number;
    playerIds: number[];
  };
  dovakins: Array<{ count: number; playerId: number }>;
  yakumans: Array<{
    playerId: number;
    yaku: number;
  }>;
  shithander: {
    handsCount: number;
    playerIds: number[];
  };
  bestDealer: {
    playerIds: number[];
    bestWinCount: number;
  };
  bestFu: {
    fu: number;
    playerIds: number[];
  };
  impossibleWait: Array<{
    playerId: number;
    hand: { hand: number; fu?: number };
  }>;
  honoredDonor: Array<{ playerId: number; count: number }>;
  doraLord: Array<{ playerId: number; count: number }>;
  catchEmAll: Array<{ playerId: number; count: number }>;
  favoriteAsapinApprentice: Array<{ playerId: number; score: number }>;
  andYourRiichiBet: Array<{ playerId: number; count: number }>;
  covetousKnight: Array<{ playerId: number; count: number }>;
  ninja: Array<{ playerId: number; count: number }>;
  needMoreGold: Array<{ playerId: number; score: number }>;
  riichiNomi: Array<{ playerId: number; count: number }>;
  carefulPlanning: Array<{ playerId: number; score: number }>;
}>;

@Entity({ tableName: 'achievements' })
@Index({ properties: ['event'] })
export class AchievementsEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({
    fieldName: 'data',
    type: 'json',
    comment: 'achievements precalculated data',
  })
  data!: AchievementsData;

  @Property({
    fieldName: 'last_update',
    type: 'string',
    columnType: 'timestamp',
    nullable: true,
  })
  lastUpdate?: string;
}
