import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity';

export type AchievementsData = Partial<{
  bestHand: {
    han: number;
    names: string[];
  };
  bestTsumoist: {
    tsumo: number;
    names: string[];
  };
  dovakins: Array<{ count: number; name: string }>;
  yakumans: Array<{
    name: string;
    yaku: number;
  }>;
  shithander: {
    handsCount: number;
    names: string[];
  };
  bestDealer: {
    names: string[];
    bestWinCount: number;
  };
  bestFu: {
    fu: number;
    names: string[];
  };
  impossibleWait: Array<{
    name: string;
    hand: { hand: number; fu?: number };
  }>;
  honoredDonor: Array<{ name: string; count: number }>;
  doraLord: Array<{ name: string; count: number }>;
  catchEmAll: Array<{ name: string; count: number }>;
  favoriteAsapinApprentice: Array<{ name: string; score: number }>;
  andYourRiichiBet: Array<{ name: string; count: number }>;
  covetousKnight: Array<{ name: string; count: number }>;
  ninja: Array<{ name: string; count: number }>;
  needMoreGold: Array<{ name: string; score: number }>;
  riichiNomi: Array<{ name: string; count: number }>;
}>;

@Entity({ tableName: 'achievements' })
export class AchievementsEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ fieldName: 'data', type: 'json', comment: 'achievements precalculated data' })
  data!: AchievementsData;

  @Property({ fieldName: 'last_update', type: 'timestamp', nullable: true })
  lastUpdate?: string;
}
