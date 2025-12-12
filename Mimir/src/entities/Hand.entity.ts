import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { RoundEntity } from './Round.entity.js';
import {
  AbortResult,
  ChomboResult,
  DrawResult,
  MultironWin,
  NagashiResult,
  RonResult,
  TsumoResult,
} from 'tsclients/proto/atoms.pb.js';

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

  static fromMessage(
    message:
      | RonResult
      | TsumoResult
      | DrawResult
      | AbortResult
      | ChomboResult
      | NagashiResult
      | MultironWin,
    r?: RoundEntity
  ) {
    const hand = new HandEntity();
    if ('han' in message) {
      hand.han = message.han;
    }
    if ('fu' in message) {
      hand.fu = message.fu;
    }
    if ('dora' in message) {
      hand.dora = message.dora;
    }
    if ('uradora' in message) {
      hand.uradora = message.uradora;
    }
    if ('kandora' in message) {
      hand.kandora = message.kandora;
    }
    if ('kanuradora' in message) {
      hand.kanuradora = message.kanuradora;
    }
    if ('yaku' in message) {
      hand.yaku = message.yaku;
    }
    if ('tempai' in message) {
      hand.tempai = message.tempai;
    }
    if ('nagashi' in message) {
      hand.nagashi = message.nagashi;
    }
    if ('winnerId' in message) {
      hand.winnerId = message.winnerId;
    }
    if ('loserId' in message) {
      hand.loserId = message.loserId;
    }
    if ('paoPlayerId' in message) {
      hand.paoPlayerId = message.paoPlayerId;
    }
    if ('openHand' in message) {
      hand.openHand = message.openHand;
    }
    if (r) {
      hand.round = r;
    }
    return hand;
  }
}
