import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy';

import { EventEntity } from './Event.entity.js';

@Entity({ tableName: 'event_registered_players' })
@Unique({ properties: ['event', 'playerId'] })
@Unique({ properties: ['event', 'localId'] })
@Index({ properties: ['ignoreSeating'] })
export class EventRegisteredPlayersEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ fieldName: 'player_id' })
  playerId!: number;

  @Property({ fieldName: 'local_id', type: 'integer', nullable: true })
  localId?: number | null;

  @Property({ fieldName: 'replacement_id', nullable: true })
  replacementId?: number;

  @Property({ fieldName: 'ignore_seating' })
  ignoreSeating!: number;

  @Property({ fieldName: 'team_name', nullable: true })
  teamName?: string;
}
