import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity';

@Entity({ tableName: 'player_history' })
export class PlayerHistoryEntity {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'player_id' })
  playerId!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ fieldName: 'session_id' })
  sessionId!: number;

  @Property({ fieldName: 'avg_place' })
  avgPlace!: number;

  @Property({ fieldName: 'chips', nullable: true })
  chips?: number;

  @Property({ fieldName: 'games_played' })
  gamesPlayed!: number;

  @Property({ fieldName: 'rating' })
  rating!: number;
}
