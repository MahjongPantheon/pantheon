import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity.js';
import { SessionEntity } from './Session.entity.js';

@Entity({ tableName: 'penalty' })
export class PenaltyEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ fieldName: 'player_id' })
  playerId!: number;

  @ManyToOne({ nullable: true, fieldName: 'session_id' })
  session?: SessionEntity;

  @Property({ fieldName: 'amount' })
  amount!: number;

  @Property({ fieldName: 'assigned_by' })
  assignedBy!: number;

  @Property({ fieldName: 'cancelled' })
  cancelled!: number;

  @Property({ fieldName: 'cancelled_reason', nullable: true })
  cancelledReason?: string;

  @Property({ fieldName: 'created_at', type: 'timestamp' })
  createdAt!: string;

  @Property({ fieldName: 'reason', type: 'text' })
  reason!: string;
}
