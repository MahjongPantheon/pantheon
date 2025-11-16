import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity.js';
import { SessionEntity } from './Session.entity.js';

@Entity({ tableName: 'session_results' })
export class SessionResultsEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @ManyToOne({ fieldName: 'session_id' })
  session!: SessionEntity;

  @Property({ fieldName: 'player_id' })
  playerId!: number;

  @Property()
  place!: number;

  @Property({ comment: 'how many points player has at the end, before any uma/oka calc' })
  score!: number;

  @Property({
    fieldName: 'rating_delta',
    comment: 'resulting score after uma/oka and starting points subtraction',
  })
  ratingDelta!: number;

  @Property({ nullable: true })
  chips?: number;
}
