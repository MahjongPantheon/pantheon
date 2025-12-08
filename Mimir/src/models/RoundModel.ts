import { checkRound } from 'src/helpers/roundValidation.js';
import { Model } from './Model.js';
import { RoundEntity } from 'src/entities/db/Round.entity.js';
import { SessionEntity } from 'src/entities/db/Session.entity.js';
import { EventEntity } from 'src/entities/db/Event.entity.js';
import { RulesetEntity } from 'src/entities/db/Ruleset.entity.js';
import { Round, RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { Moment } from 'moment';
import { SessionStateEntity } from 'src/entities/db/SessionState.entity.js';
import { HandEntity } from 'src/entities/db/Hand.entity.js';

export class RoundModel extends Model {
  async findBySessionIds(sessionIds: number[]) {
    return this.repo.db.em.findAll(RoundEntity, {
      where: { session: this.repo.db.em.getReference(SessionEntity, sessionIds) },
      populate: ['hands'],
    });
  }

  async findChomboInEvent(eventId: number) {
    return this.repo.db.em.findAll(RoundEntity, {
      where: {
        event: this.repo.db.em.getReference(EventEntity, eventId),
        outcome: RoundOutcome.ROUND_OUTCOME_CHOMBO,
      },
      populate: ['hands'],
    });
  }

  async saveRound(
    eventId: number,
    sessionId: number,
    players: number[],
    allRegisteredPlayersIds: number[],
    ruleset: RulesetEntity,
    round: Round,
    endDate: Moment,
    lastSessionState: SessionStateEntity
  ) {
    checkRound(players, allRegisteredPlayersIds, ruleset, round);

    if (round.ron) {
      const r = new RoundEntity();
      r.round = round.ron.roundIndex;
      r.riichi = round.ron.riichiBets;
      r.hands = [HandEntity.fromMessage(round.ron, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_RON;
      r.honba = round.ron.honba;
      r.session = this.repo.db.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.db.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.db.em.persist(r.hands[0]);
      this.repo.db.em.persist(r);
    }

    if (round.tsumo) {
      const r = new RoundEntity();
      r.round = round.tsumo.roundIndex;
      r.riichi = round.tsumo.riichiBets;
      r.hands = [HandEntity.fromMessage(round.tsumo, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_TSUMO;
      r.honba = round.tsumo.honba;
      r.session = this.repo.db.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.db.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.db.em.persist(r.hands[0]);
      this.repo.db.em.persist(r);
    }

    if (round.draw) {
      const r = new RoundEntity();
      r.round = round.draw.roundIndex;
      r.riichi = round.draw.riichiBets;
      r.hands = [HandEntity.fromMessage(round.draw, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_DRAW;
      r.honba = round.draw.honba;
      r.session = this.repo.db.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.db.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.db.em.persist(r.hands[0]);
      this.repo.db.em.persist(r);
    }

    if (round.abort) {
      const r = new RoundEntity();
      r.round = round.abort.roundIndex;
      r.riichi = round.abort.riichiBets;
      r.hands = [HandEntity.fromMessage(round.abort, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_ABORT;
      r.honba = round.abort.honba;
      r.session = this.repo.db.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.db.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.db.em.persist(r.hands[0]);
      this.repo.db.em.persist(r);
    }

    if (round.nagashi) {
      const r = new RoundEntity();
      r.round = round.nagashi.roundIndex;
      r.riichi = round.nagashi.riichiBets;
      r.hands = [HandEntity.fromMessage(round.nagashi, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_NAGASHI;
      r.honba = round.nagashi.honba;
      r.session = this.repo.db.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.db.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.db.em.persist(r.hands[0]);
      this.repo.db.em.persist(r);
    }

    if (round.chombo) {
      const r = new RoundEntity();
      r.round = round.chombo.roundIndex;
      r.hands = [HandEntity.fromMessage(round.chombo, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_CHOMBO;
      r.honba = round.chombo.honba;
      r.session = this.repo.db.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.db.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.db.em.persist(r.hands[0]);
      this.repo.db.em.persist(r);
    }

    if (round.multiron) {
      const r = new RoundEntity();
      r.round = round.multiron.roundIndex;
      r.riichi = round.multiron.riichiBets;
      r.hands = round.multiron.wins.map((win) => HandEntity.fromMessage(win, r));

      r.outcome = RoundOutcome.ROUND_OUTCOME_MULTIRON;
      r.honba = round.multiron.honba;
      r.session = this.repo.db.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.db.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      r.hands.forEach((hand) => {
        this.repo.db.em.persist(hand);
      });
      this.repo.db.em.persist(r);
    }

    await this.repo.db.em.flush();
  }
}
