import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { SessionEntity } from './Session.entity.js';

@Entity({ tableName: 'session_players' })
export class SessionPlayerEntity {
  @PrimaryKey()
  id!: number;

  @Property({ comment: 'Order of the player at the table, 1 = first east, 2 = first south, etc' })
  order!: number;

  @Property({ fieldName: 'player_id' })
  playerId!: number;

  @ManyToOne({ fieldName: 'session_id' })
  session!: SessionEntity;
}
