import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { EventEntity } from './Event.entity.js';

@Entity({ tableName: 'player_history' })
@Index({ properties: ['event'] })
export class PlayerHistoryEntity {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'player_id' })
  playerId!: number;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ fieldName: 'session_id' })
  sessionId!: number;

  @Property({ fieldName: 'avg_place' })
  avgPlace!: number;

  @Property({ fieldName: 'chips', nullable: true })
  chips?: number;

  @Property({ fieldName: 'games_played' })
  gamesPlayed!: number;

  @Property({ fieldName: 'rating' })
  rating!: number;

  // Calculated fields not saved to DB
  avgScore?: number;
  playerTitle?: string;
  playerTenhouId?: string;
  playerTeamName?: string | null;
  playerHasAvatar?: boolean;
  playerLastUpdate?: string;
  penaltiesAmount?: number;
  penaltiesCount?: number;

  clone(): PlayerHistoryEntity {
    const cloned = new PlayerHistoryEntity();
    cloned.id = this.id;
    cloned.playerId = this.playerId;
    cloned.event = this.event;
    cloned.sessionId = this.sessionId;
    cloned.avgPlace = this.avgPlace;
    cloned.chips = this.chips;
    cloned.gamesPlayed = this.gamesPlayed;
    cloned.rating = this.rating;
    cloned.avgScore = this.avgScore;
    cloned.playerTitle = this.playerTitle;
    cloned.playerTenhouId = this.playerTenhouId;
    cloned.playerTeamName = this.playerTeamName;
    cloned.playerHasAvatar = this.playerHasAvatar;
    cloned.playerLastUpdate = this.playerLastUpdate;
    cloned.penaltiesAmount = this.penaltiesAmount;
    cloned.penaltiesCount = this.penaltiesCount;
    return cloned;
  }
}
