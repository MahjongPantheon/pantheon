import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { SessionEntity } from './Session.entity';
import { EventEntity } from './Event.entity';

export type LastSessionState = {
  _scores: Record<number, number>; // player_id -> score
  _chips?: number;
  _chombo: number[];
  _round: number;
  _honba: number;
  _riichiBets: number;
  _prematurelyFinished: boolean;
  _roundJustChanged: boolean;
  _lastHandStarted: boolean;
  _lastOutcome: string;
  _yakitori: number[]; // players ids
  _replacements: number[]; // players ids
  _isFinished: boolean;
};

@Entity({ tableName: 'round' })
export class RoundEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'session_id' })
  session!: SessionEntity;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @Property({ comment: 'ron, tsumo, draw, abortive draw or chombo' })
  outcome!: string;

  @Property({ nullable: true })
  han?: number;

  @Property({ nullable: true })
  fu?: number;

  @Property({ comment: '1-4 means east1-4, 5-8 means south1-4, etc' })
  round!: number;

  @Property({ nullable: true, comment: 'dora count' })
  dora?: number;

  @Property({ nullable: true, comment: 'ura dora count' })
  uradora?: number;

  @Property({ nullable: true, comment: 'kandora count' })
  kandora?: number;

  @Property({ nullable: true, comment: 'kanuradora count' })
  kanuradora?: number;

  @Property({
    nullable: true,
    fieldName: 'multi_ron',
    comment: 'double or triple ron flag to properly display results of round',
  })
  multiRon?: number;

  @Property({ nullable: true, type: 'json', comment: 'list of user ids who called riichi' })
  riichi?: number[];

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

  @Property({ nullable: true, type: 'timestamp', fieldName: 'end_date' })
  endDate?: string;

  @Property({
    nullable: true,
    type: 'json',
    fieldName: 'last_session_state',
    comment: 'session intermediate results before this round was registered',
  })
  lastSessionState?: LastSessionState;
}
