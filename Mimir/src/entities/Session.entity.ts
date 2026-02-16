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

  @Property({ fieldName: 'table_index', nullable: true, comment: 'table number in tournament' })
  tableIndex?: number;

  @Property({
    fieldName: 'representational_hash',
    nullable: true,
    comment: 'hash to find this game from client mobile app',
  })
  representationalHash?: string;

  @Property({ fieldName: 'start_date', nullable: true })
  startDate?: string;

  @Property({ fieldName: 'end_date', nullable: true })
  endDate?: string;

  @Embedded({
    entity: () => SessionStateEntity,
    nullable: true,
    object: true,
    fieldName: 'intermediate_results',
  })
  intermediateResults?: SessionStateEntity;

  @Property({
    fieldName: 'orig_link',
    nullable: true,
    comment: 'original tenhou game link, for access to replay',
  })
  origLink?: string;

  @Property({
    fieldName: 'replay_hash',
    nullable: true,
    comment: 'tenhou game hash, for deduplication',
  })
  replayHash?: string;

  @Property({ fieldName: 'extra_time', comment: 'extra time for the session in seconds' })
  extraTime!: number;
}
