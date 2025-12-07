import { Embedded, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { EventEntity } from './Event.entity.js';
import { SessionStateEntity } from './SessionState.entity.js';

@Entity({ tableName: 'session' })
export class SessionEntity {
  @PrimaryKey()
  id!: number;

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

  @Embedded(() => SessionStateEntity)
  intermediateResults?: SessionStateEntity;

  @Property({ nullable: true, comment: 'original tenhou game link, for access to replay' })
  origLink?: string;

  @Property({ nullable: true, comment: 'tenhou game hash, for deduplication' })
  replayHash?: string;

  @Property({ comment: 'extra time for the session in minutes' })
  extraTime!: number;
}
