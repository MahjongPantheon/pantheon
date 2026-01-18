import {
  PlayersGetAllRoundsResponse,
  PlayersGetLastRoundByHashResponse,
  PlayersGetLastRoundPayload,
  PlayersGetLastRoundResponse,
} from 'tsclients/proto/mimir.pb.js';
import { Model } from './Model.js';
import { GenericSessionPayload } from 'tsclients/proto/atoms.pb.js';
import { SessionModel } from './SessionModel.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { RoundModel } from './RoundModel.js';
import { SessionState } from 'src/aggregates/SessionState.js';
import { formatRound } from 'src/helpers/formatters.js';

export class PlayerInSessionModel extends Model {
  async getLastRound(input: PlayersGetLastRoundPayload): Promise<PlayersGetLastRoundResponse> {
    const sessionModel = this.getModel(SessionModel);
    const sessions = await sessionModel.findLastByPlayerAndEvent(input.playerId, input.eventId);
    this.repo.em.populate(sessions, ['event']);
    if (sessions.length === 0) {
      throw new Error(`Session not found for player ${input.playerId} and event ${input.eventId}`);
    }

    return this._getLastRoundCommon(sessions[0]);
  }

  async getLastRoundByHash(
    input: GenericSessionPayload
  ): Promise<PlayersGetLastRoundByHashResponse> {
    const sessionModel = this.getModel(SessionModel);
    const sessions = await sessionModel.findByRepresentationalHash([input.sessionHash], ['event']);
    if (sessions.length === 0) {
      throw new Error(`Session not found for hash ${input.sessionHash}`);
    }

    return this._getLastRoundCommon(sessions[0]);
  }

  async _getLastRoundCommon(session: SessionEntity): Promise<PlayersGetLastRoundResponse> {
    const roundModel = this.getModel(RoundModel);
    const rounds = await roundModel.findBySessionIds([session.id]);
    if (rounds.length === 0) {
      throw new Error(`Round not found for session ${session.id}`);
    }
    const lastRound = rounds.reduce((prev, curr) => (prev.id > curr.id ? prev : curr));
    const sessionState = new SessionState(
      session.event.ruleset,
      session.intermediateResults?.playerIds ?? [],
      session.intermediateResults
    );
    const lastSessionState = new SessionState(
      session.event.ruleset,
      lastRound.lastSessionState?.playerIds ?? [],
      lastRound.lastSessionState
    );

    const paymentsInfo = roundModel.getRoundPaymentsInfo(session.event, session, lastRound);
    const currentScores = sessionState.getScores();
    const previousScores = lastSessionState.getScores();
    const chombo = sessionState.getChombo();
    const lastChombo = lastSessionState.getChombo();
    const scoresDelta: Record<number, number> = {};
    for (const playerId of Object.keys(currentScores)) {
      scoresDelta[+playerId] = currentScores[+playerId] - previousScores[+playerId];
    }

    return {
      round: {
        sessionHash: session.representationalHash,
        dealer: lastSessionState.getCurrentDealer(),
        roundIndex: lastRound.round,
        riichi: lastSessionState.getRiichiBets(),
        honba: lastSessionState.getHonba(),
        riichiIds: lastRound.riichi,
        scores: Object.keys(currentScores).map((playerId) => ({
          playerId: +playerId,
          score: currentScores[+playerId],
          chomboCount: chombo[+playerId] ?? 0,
        })),
        scoresDelta: Object.keys(scoresDelta).map((playerId) => ({
          playerId: +playerId,
          score: scoresDelta[+playerId],
          chomboCount: (chombo[+playerId] ?? 0) - (lastChombo[+playerId] ?? 0),
        })),
        payments: paymentsInfo,
        round: formatRound(lastRound, lastSessionState.state),
        outcome: lastRound.outcome,
      },
    };
  }

  async getAllRounds(input: GenericSessionPayload): Promise<PlayersGetAllRoundsResponse> {
    const sessionModel = this.getModel(SessionModel);
    const sessions = await sessionModel.findByRepresentationalHash([input.sessionHash], ['event']);
    if (sessions.length === 0) {
      throw new Error(`Session not found for hash ${input.sessionHash}`);
    }

    return this._getAllRounds(sessions[0]);
  }

  async _getAllRounds(session: SessionEntity): Promise<PlayersGetAllRoundsResponse> {
    const roundModel = this.getModel(RoundModel);
    const rounds = await roundModel.findBySessionIds([session.id]);

    if (rounds.length === 0) {
      throw new Error(`Round not found for session ${session.id}`);
    }

    let sessionState = new SessionState(
      session.event.ruleset,
      session.intermediateResults?.playerIds ?? [],
      session.intermediateResults
    );

    const results = [];
    rounds.reverse(); // go backwards so currentState is set properly in the beginning

    for (const round of rounds) {
      const lastSessionState = new SessionState(
        session.event.ruleset,
        round.lastSessionState?.playerIds ?? [],
        round.lastSessionState
      );

      const paymentsInfo = roundModel.getRoundPaymentsInfo(session.event, session, round);
      const currentScores = sessionState.getScores();
      const previousScores = lastSessionState.getScores();
      const chombo = sessionState.getChombo();
      const lastChombo = lastSessionState.getChombo();
      const scoresDelta: Record<number, number> = {};
      for (const playerId of Object.keys(currentScores)) {
        scoresDelta[+playerId] = currentScores[+playerId] - previousScores[+playerId];
      }

      results.push({
        sessionHash: session.representationalHash,
        dealer: lastSessionState.getCurrentDealer(),
        roundIndex: round.round,
        riichi: lastSessionState.getRiichiBets(),
        honba: lastSessionState.getHonba(),
        riichiIds: round.riichi,
        scores: Object.keys(currentScores).map((playerId) => ({
          playerId: +playerId,
          score: currentScores[+playerId],
          chomboCount: chombo[+playerId] ?? 0,
        })),
        scoresDelta: Object.keys(scoresDelta).map((playerId) => ({
          playerId: +playerId,
          score: scoresDelta[+playerId],
          chomboCount: (chombo[+playerId] ?? 0) - (lastChombo[+playerId] ?? 0),
        })),
        payments: paymentsInfo,
        round: formatRound(round, lastSessionState.state),
        outcome: round.outcome,
      });

      sessionState = lastSessionState;
    }

    return { rounds: results.reverse() };
  }
}
