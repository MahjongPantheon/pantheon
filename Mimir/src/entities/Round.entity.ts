import { Embedded, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { SessionEntity } from './Session.entity.js';
import { EventEntity } from './Event.entity.js';
import { HandEntity } from './Hand.entity.js';
import { SessionStateEntity } from './SessionState.entity.js';
import { Round, RoundOutcome } from 'tsclients/proto/atoms.pb.js';

@Entity({ tableName: 'round' })
export class RoundEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne({ fieldName: 'session_id' })
  session!: SessionEntity;

  @ManyToOne({ fieldName: 'event_id' })
  event!: EventEntity;

  @OneToMany(() => HandEntity, (hand) => hand.round)
  hands!: HandEntity[];

  @Property({ comment: 'ron, tsumo, draw, abortive draw or chombo' })
  outcome!: RoundOutcome;

  @Property({ comment: '1-4 means east1-4, 5-8 means south1-4, etc' })
  round!: number;

  @Property({ comment: 'count of honba sticks' })
  honba!: number;

  @Property({ nullable: true, type: 'json', comment: 'list of user ids who called riichi' })
  riichi?: number[];

  @Property({ nullable: true, type: 'timestamp', fieldName: 'end_date' })
  endDate?: string;

  @Embedded({
    entity: () => SessionStateEntity,
    fieldName: 'last_session_state',
  })
  lastSessionState?: SessionStateEntity;

  static fromMessage(
    sessionRef: SessionEntity,
    eventRef: EventEntity,
    round: Round,
    lastSessionState: SessionStateEntity
  ) {
    const entity = new RoundEntity();
    entity.session = sessionRef;
    entity.event = eventRef;
    if (round.ron) {
      entity.outcome = RoundOutcome.ROUND_OUTCOME_RON;
      entity.hands = [HandEntity.fromMessage(round.ron)];
      entity.round = round.ron.roundIndex;
      entity.honba = round.ron.honba;
      entity.riichi = round.ron.riichiBets;
    } else if (round.tsumo) {
      entity.outcome = RoundOutcome.ROUND_OUTCOME_TSUMO;
      entity.hands = [HandEntity.fromMessage(round.tsumo)];
      entity.round = round.tsumo.roundIndex;
      entity.honba = round.tsumo.honba;
      entity.riichi = round.tsumo.riichiBets;
    } else if (round.draw) {
      entity.outcome = RoundOutcome.ROUND_OUTCOME_DRAW;
      entity.hands = [HandEntity.fromMessage(round.draw)];
      entity.round = round.draw.roundIndex;
      entity.honba = round.draw.honba;
      entity.riichi = round.draw.riichiBets;
    } else if (round.abort) {
      entity.outcome = RoundOutcome.ROUND_OUTCOME_ABORT;
      entity.hands = [HandEntity.fromMessage(round.abort)];
      entity.round = round.abort.roundIndex;
      entity.honba = round.abort.honba;
      entity.riichi = round.abort.riichiBets;
    } else if (round.chombo) {
      entity.outcome = RoundOutcome.ROUND_OUTCOME_CHOMBO;
      entity.hands = [HandEntity.fromMessage(round.chombo)];
      entity.round = round.chombo.roundIndex;
      entity.honba = round.chombo.honba;
      entity.riichi = [];
    } else if (round.nagashi) {
      entity.outcome = RoundOutcome.ROUND_OUTCOME_NAGASHI;
      entity.hands = [HandEntity.fromMessage(round.nagashi)];
      entity.round = round.nagashi.roundIndex;
      entity.honba = round.nagashi.honba;
      entity.riichi = round.nagashi.riichiBets;
    } else if (round.multiron) {
      entity.outcome = RoundOutcome.ROUND_OUTCOME_MULTIRON;
      entity.hands = round.multiron.wins.map((win) => HandEntity.fromMessage(win));
      entity.round = round.multiron.roundIndex;
      entity.honba = round.multiron.honba;
      entity.riichi = round.multiron.riichiBets;
    }

    entity.endDate = new Date().toISOString();
    entity.lastSessionState = lastSessionState;
    return entity;
  }
}
