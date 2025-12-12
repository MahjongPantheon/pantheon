import { Embedded, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { SessionEntity } from './Session.entity.js';
import { EventEntity } from './Event.entity.js';
import { HandEntity } from './Hand.entity.js';
import { SessionStateEntity } from './SessionState.entity.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';

@Entity({ tableName: 'round' })
export class RoundEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'session_id' })
  session!: SessionEntity;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @OneToMany(() => HandEntity, (hand) => hand.round)
  hands!: HandEntity[];

  @Property({ comment: 'ron, tsumo, draw, abortive draw or chombo' })
  outcome!: RoundOutcome;

  @Property({ comment: '1-4 means east1-4, 5-8 means south1-4, etc' })
  round!: number;

  @Property({ comment: 'count of honba sticks' })
  honba!: number;

  @Property({ nullable: true, type: 'json', comment: 'list of user ids who called riichi' })
  riichi?: number[];

  @Property({ nullable: true, type: 'timestamp', fieldName: 'end_date' })
  endDate?: string;

  @Embedded({
    entity: () => SessionStateEntity,
    fieldName: 'last_session_state',
  })
  lastSessionState?: SessionStateEntity;
}
