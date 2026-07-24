import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { EventEntity } from "./Event.entity.js";

export type AchievementsData = Partial<{
  bestHand: {
    han: number;
    playerIds: number[];
  };
  bestTsumoist: {
    tsumo: number;
    playerIds: number[];
  };
  dovakins: { count: number; playerIds: number[] };
  yakumans: Array<{ playerId: number; yakuman?: number[]; kazoe?: boolean }>;
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
    hand: { han: number; fu?: number };
    amount: number;
  }>;
  braveSapper: {
    count: number;
    playerIds: number[];
  };
  dieHard: {
    count: number;
    playerIds: number[];
  };
  justAsPlanned: {
    count: number;
    playerIds: number[];
  };
  honoredDonor: Array<{ playerId: number; count: number }>;
  doraLord: Array<{ playerId: number; average: number }>;
  catchEmAll: { playerIds: number[]; count: number };
  favoriteAsapinApprentice: Array<{ playerId: number; score: number }>;
  favoriteTsuchidaApprentice: Array<{ playerId: number; count: number }>;
  andYourRiichiBet: Array<{ playerId: number; count: number }>;
  covetousKnight: Array<{ playerId: number; count: number }>;
  ninja: {
    count: number;
    playerIds: number[];
  };
  needMoreGold: Array<{ playerId: number; score: number }>;
  riichiNomi: {
    count: number;
    playerIds: number[];
  };
  carefulPlanning: Array<{ playerId: number; score: number }>;
}>;

@Entity({ tableName: "achievements" })
@Index({ properties: ["event"] })
export class AchievementsEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: "event_id" })
  event!: EventEntity;

  @Property({
    fieldName: "data",
    type: "json",
    comment: "achievements precalculated data",
  })
  data!: AchievementsData;

  @Property({
    fieldName: "last_update",
    type: "string",
    columnType: "timestamp",
    nullable: true,
  })
  lastUpdate?: string;
}
