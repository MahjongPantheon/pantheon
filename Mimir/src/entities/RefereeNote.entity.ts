import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { EventEntity } from './Event.entity.js';

@Entity({ tableName: 'referee_note' })
@Index({ properties: ['event', 'createdAt'] })
export class RefereeNoteEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ fieldName: 'player_id', nullable: true, type: 'integer' })
  playerId?: number;

  @Property({ fieldName: 'author_id' })
  authorId!: number;

  @Property({ fieldName: 'content', type: 'text' })
  content!: string;

  @Property({ fieldName: 'created_at', type: 'string', columnType: 'timestamp' })
  createdAt!: string;
}
