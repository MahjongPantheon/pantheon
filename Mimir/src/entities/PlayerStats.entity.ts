import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity.js';

type PlayerStatsData = Partial<{
  ratingHistory: number[];
  scoreHistory: Record<
    number, // session id
    Array<{
      sessionHash: string;
      eventId: number;
      title: string;
      hasAvatar: boolean;
      lastUpdate: string;
      playerId: number;
      score: number;
      ratingDelta: number;
      place: number;
    }>
  >;
  playersInfo: Array<{
    id: number;
    title: string;
    hasAvatar: boolean;
    lastUpdate: string;
    tenhouId?: string;
  }>;
  placesSummary: Record<number, number>;
  totalPlayedGames: number;
  totalPlayedRounds: number;
  winSummary: {
    ron: number;
    tsumo: number;
    chombo: number;
    feed: number;
    tsumofeed: number;
    winsWithOpen: number;
    winsWithRiichi: number;
    winsWithDama: number;
    unforcedFeedToOpen: number;
    unforcedFeedToRiichi: number;
    unforcedFeedToDama: number;
    draw: number;
    drawTempai: number;
    pointsWon: number;
    pointsLostRon: number;
    pointsLostTsumo: number;
  };
  handsValueSummary: Record<number, number>;
  yakuSummary: Record<number, number>;
  riichiSummary: { riichiWon: number; riichiLost: number; feedUnderRiichi: number };
  doraStat: { count: number; average: number };
  lastUpdate: string;
}>;

@Entity({ tableName: 'player_stats' })
export class PlayerStatsEntity {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'player_id' })
  playerId!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ type: 'json', comment: 'stats precalculated data' })
  data!: PlayerStatsData;

  @Property({ fieldName: 'last_update', nullable: true })
  lastUpdate?: string;
}
