import { checkRound } from 'src/helpers/roundValidation.js';
import { Model } from './Model.js';
import { RoundEntity } from 'src/entities/Round.entity.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { Round, RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { Moment } from 'moment';
import { SessionStateEntity } from 'src/entities/SessionState.entity.js';
import { HandEntity } from 'src/entities/Hand.entity.js';
import { SessionState } from 'src/aggregates/SessionState.js';
import { PaymentsInfo, PointsCalc } from 'src/helpers/PointsCalc.js';

export class RoundModel extends Model {
  async findBySessionIds(sessionIds: number[]) {
    return this.repo.em.findAll(RoundEntity, {
      where: { session: this.repo.em.getReference(SessionEntity, sessionIds) },
      populate: ['hands'],
    });
  }

  async findChomboInEvent(eventId: number) {
    return this.repo.em.findAll(RoundEntity, {
      where: {
        event: this.repo.em.getReference(EventEntity, eventId),
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
      r.session = this.repo.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.em.persist(r.hands[0]);
      this.repo.em.persist(r);
    }

    if (round.tsumo) {
      const r = new RoundEntity();
      r.round = round.tsumo.roundIndex;
      r.riichi = round.tsumo.riichiBets;
      r.hands = [HandEntity.fromMessage(round.tsumo, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_TSUMO;
      r.honba = round.tsumo.honba;
      r.session = this.repo.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.em.persist(r.hands[0]);
      this.repo.em.persist(r);
    }

    if (round.draw) {
      const r = new RoundEntity();
      r.round = round.draw.roundIndex;
      r.riichi = round.draw.riichiBets;
      r.hands = [HandEntity.fromMessage(round.draw, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_DRAW;
      r.honba = round.draw.honba;
      r.session = this.repo.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.em.persist(r.hands[0]);
      this.repo.em.persist(r);
    }

    if (round.abort) {
      const r = new RoundEntity();
      r.round = round.abort.roundIndex;
      r.riichi = round.abort.riichiBets;
      r.hands = [HandEntity.fromMessage(round.abort, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_ABORT;
      r.honba = round.abort.honba;
      r.session = this.repo.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.em.persist(r.hands[0]);
      this.repo.em.persist(r);
    }

    if (round.nagashi) {
      const r = new RoundEntity();
      r.round = round.nagashi.roundIndex;
      r.riichi = round.nagashi.riichiBets;
      r.hands = [HandEntity.fromMessage(round.nagashi, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_NAGASHI;
      r.honba = round.nagashi.honba;
      r.session = this.repo.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.em.persist(r.hands[0]);
      this.repo.em.persist(r);
    }

    if (round.chombo) {
      const r = new RoundEntity();
      r.round = round.chombo.roundIndex;
      r.hands = [HandEntity.fromMessage(round.chombo, r)];

      r.outcome = RoundOutcome.ROUND_OUTCOME_CHOMBO;
      r.honba = round.chombo.honba;
      r.session = this.repo.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      this.repo.em.persist(r.hands[0]);
      this.repo.em.persist(r);
    }

    if (round.multiron) {
      const r = new RoundEntity();
      r.round = round.multiron.roundIndex;
      r.riichi = round.multiron.riichiBets;
      r.hands = round.multiron.wins.map((win) => HandEntity.fromMessage(win, r));

      r.outcome = RoundOutcome.ROUND_OUTCOME_MULTIRON;
      r.honba = round.multiron.honba;
      r.session = this.repo.em.getReference(SessionEntity, sessionId);
      r.event = this.repo.em.getReference(EventEntity, eventId);
      r.endDate = endDate.toISOString();
      r.lastSessionState = lastSessionState;

      r.hands.forEach((hand) => {
        this.repo.em.persist(hand);
      });
      this.repo.em.persist(r);
    }

    await this.repo.em.flush();
  }

  getRoundPaymentsInfo(event: EventEntity, session: SessionEntity, round: RoundEntity) {
    const sessionState = new SessionState(
      event.ruleset,
      session.intermediateResults?.playerIds ?? [],
      session.intermediateResults
    );

    const calc = new PointsCalc();
    switch (round.outcome) {
      case RoundOutcome.ROUND_OUTCOME_RON: {
        calc.ron(
          event.ruleset.rules,
          sessionState.getCurrentDealer() === round.hands[0].winnerId,
          sessionState.getScores(),
          round.hands[0].winnerId!,
          round.hands[0].loserId!,
          round.hands[0].han!,
          round.hands[0].fu!,
          round.riichi ?? [],
          round.honba,
          sessionState.getRiichiBets(),
          round.hands[0].paoPlayerId,
          null,
          round.riichi?.length ?? 0
        );
        return calc.lastPaymentsInfo();
      }
      case RoundOutcome.ROUND_OUTCOME_TSUMO: {
        calc.tsumo(
          event.ruleset.rules,
          sessionState.getCurrentDealer(),
          sessionState.getScores(),
          round.hands[0].winnerId!,
          round.hands[0].han!,
          round.hands[0].fu!,
          round.riichi ?? [],
          round.honba,
          sessionState.getRiichiBets(),
          round.hands[0].paoPlayerId
        );
        return calc.lastPaymentsInfo();
      }
      case RoundOutcome.ROUND_OUTCOME_DRAW: {
        calc.draw(sessionState.getScores(), round.hands[0].tempai ?? [], round.riichi ?? []);
        return calc.lastPaymentsInfo();
      }
      case RoundOutcome.ROUND_OUTCOME_ABORT: {
        calc.abort(sessionState.getScores(), round.riichi ?? []);
        return calc.lastPaymentsInfo();
      }
      case RoundOutcome.ROUND_OUTCOME_CHOMBO: {
        calc.chombo(
          event.ruleset.rules,
          sessionState.getCurrentDealer(),
          round.hands[0].loserId!,
          sessionState.getScores()
        );
        return calc.lastPaymentsInfo();
      }
      case RoundOutcome.ROUND_OUTCOME_NAGASHI: {
        calc.nagashi(
          sessionState.getScores(),
          sessionState.getCurrentDealer(),
          round.riichi ?? [],
          round.hands[0].nagashi ?? []
        );
        return calc.lastPaymentsInfo();
      }
      case RoundOutcome.ROUND_OUTCOME_MULTIRON: {
        const riichiWinners = calc.assignRiichiBets(
          round.hands.map((h) => h.winnerId!),
          round.riichi ?? [],
          round.hands[0].loserId!,
          sessionState.getRiichiBets(),
          sessionState.getHonba(),
          sessionState.state.playerIds
        );
        calc.resetPaymentsInfo();
        let payments: PaymentsInfo = {
          direct: {},
          riichi: {},
          honba: {},
        };
        for (const hand of round.hands) {
          calc.ron(
            event.ruleset.rules,
            sessionState.getCurrentDealer() === hand.winnerId,
            sessionState.getScores(),
            hand.winnerId!,
            hand.loserId!,
            hand.han!,
            hand.fu!,
            riichiWinners[hand.winnerId!].fromPlayers,
            riichiWinners[hand.loserId!].honba,
            riichiWinners[hand.winnerId!].fromTable,
            round.hands[0].paoPlayerId,
            null, // TODO: why closest winner is not required here?
            round.riichi?.length ?? 0
          );
          const lastPayments = calc.lastPaymentsInfo();
          payments = {
            direct: {
              ...payments.direct,
              ...lastPayments.direct,
            },
            riichi: {
              ...payments.riichi,
              ...lastPayments.riichi,
            },
            honba: {
              ...payments.honba,
              ...lastPayments.honba,
            },
          };
        }
        return payments;
      }
      case RoundOutcome.ROUND_OUTCOME_UNSPECIFIED:
      default:
        throw new Error('Unrecognized round outcome');
    }
  }
}
