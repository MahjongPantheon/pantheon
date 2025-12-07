import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { RoundEntity } from './Round.entity.js';

@Entity({ tableName: 'hand' })
export class HandEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'round_id' })
  round!: RoundEntity;

  @Property({ nullable: true })
  han?: number;

  @Property({ nullable: true })
  fu?: number;

  @Property({ nullable: true, comment: 'dora count' })
  dora?: number;

  @Property({ nullable: true, comment: 'ura dora count' })
  uradora?: number;

  @Property({ nullable: true, comment: 'kandora count' })
  kandora?: number;

  @Property({ nullable: true, comment: 'kanuradora count' })
  kanuradora?: number;

  @Property({ nullable: true, type: 'json', comment: 'yaku id list' })
  yaku?: number[];

  @Property({ nullable: true, type: 'json', comment: 'list of tempai user ids' })
  tempai?: number[];

  @Property({ nullable: true, type: 'json', comment: 'list of nagashi user ids' })
  nagashi?: number[];

  @Property({ nullable: true, fieldName: 'winner_id', comment: 'not null only on ron or tsumo' })
  winnerId?: number;

  @Property({ nullable: true, fieldName: 'loser_id', comment: 'not null only on ron or chombo' })
  loserId?: number;

  @Property({ nullable: true, fieldName: 'pao_player_id' })
  paoPlayerId?: number;

  @Property({
    nullable: true,
    fieldName: 'open_hand',
    comment: "boolean, was winner's hand opened or not",
  })
  openHand?: boolean;
}
