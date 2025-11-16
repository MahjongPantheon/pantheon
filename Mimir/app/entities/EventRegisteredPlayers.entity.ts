import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity';

@Entity({ tableName: 'event_registered_players' })
export class EventRegisteredPlayersEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ fieldName: 'player_id' })
  playerId!: number;

  @Property({ fieldName: 'local_id', nullable: true })
  localId?: number;

  @Property({ fieldName: 'replacement_id', nullable: true })
  replacementId?: number;

  @Property({ fieldName: 'ignore_seating' })
  ignoreSeating!: number;

  @Property({ fieldName: 'team_name', nullable: true })
  teamName?: string;
}
