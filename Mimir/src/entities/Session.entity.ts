import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity.js';
import type { LastSessionState } from './Round.entity.js';

@Entity({ tableName: 'session' })
export class SessionEntity {
  @PrimaryKey()
  id!: string;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ nullable: true, comment: 'planned / inprogress / prefinished / finished' })
  status?: string;

  @Property({ nullable: true, comment: 'table number in tournament' })
  tableIndex?: number;

  @Property({ nullable: true, comment: 'hash to find this game from client mobile app' })
  representationalHash?: string;

  @Property({ nullable: true })
  startDate?: string;

  @Property({ nullable: true })
  endDate?: string;

  @Property({
    nullable: true,
    type: 'json',
    comment: 'results for in-progress sessions',
  })
  intermediateResults?: LastSessionState;

  @Property({ nullable: true, comment: 'original tenhou game link, for access to replay' })
  origLink?: string;

  @Property({ nullable: true, comment: 'tenhou game hash, for deduplication' })
  replayHash?: string;

  @Property({ comment: 'extra time for the session in minutes' })
  extraTime!: number;
}
