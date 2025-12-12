import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity.js';

type PlayerStatsData = Partial<{
  rating_history: number[];
  score_history: Record<
    number, // session id
    Array<{
      session_hash: string;
      event_id: number;
      title: string;
      has_avatar: boolean;
      last_update: string;
      player_id: number;
      score: number;
      rating_delta: number;
      place: number;
    }>
  >;
  players_info: Array<{
    id: number;
    title: string;
    has_avatar: boolean;
    last_update: string;
    tenhou_id?: string;
  }>;
  places_summary: Record<number, number>;
  total_played_games: number;
  total_played_rounds: number;
  win_summary: {
    ron: number;
    tsumo: number;
    chombo: number;
    feed: number;
    tsumofeed: number;
    wins_with_open: number;
    wins_with_riichi: number;
    wins_with_dama: number;
    unforced_feed_to_open: number;
    unforced_feed_to_riichi: number;
    unforced_feed_to_dama: number;
    draw: number;
    draw_tempai: number;
    points_won: number;
    points_lost_ron: number;
    points_lost_tsumo: number;
  };
  hands_value_summary: Record<number, number>;
  yaku_summary: Record<number, number>;
  riichi_summary: { riichi_won: number; riichi_lost: number; feed_under_riichi: number };
  dora_stat: { count: number; average: number };
  last_update: string;
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
