import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity';

@Entity({ tableName: 'event_prescript' })
export class EventPrescriptEntity {
  @PrimaryKey()
  id!: number;

  @OneToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ fieldName: 'script', type: 'text', comment: 'predefined event seating script' })
  script!: string;

  @Property({ fieldName: 'next_game' })
  nextGame!: number;
}
