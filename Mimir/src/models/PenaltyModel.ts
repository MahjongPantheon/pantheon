import { PenaltyEntity } from 'src/entities/Penalty.entity.js';
import { Model } from './Model.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { GamesAddPenaltyGamePayload, GamesAddPenaltyPayload } from 'tsclients/proto/mimir.pb.js';
import { PlayerModel } from './PlayerModel.js';
import { EventModel } from './EventModel.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { SessionModel } from './SessionModel.js';
import { SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { SessionState } from 'src/aggregates/SessionState.js';
import { SessionResultsEntity } from 'src/entities/SessionResults.entity.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { sha1 } from 'src/helpers/crypto.js';
import { randomInt } from 'crypto';
import moment from 'moment';
import { PlayerStatsModel } from './PlayerStatsModel.js';

export class PenaltyModel extends Model {
  async findBySession(sessionId: number[]) {
    return this.repo.em.findAll(PenaltyEntity, {
      where: { session: this.repo.em.getReference(SessionEntity, sessionId) },
    });
  }

  async addPenalty(payload: GamesAddPenaltyPayload) {
    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !(
        (await playerModel.isEventAdmin(payload.eventId)) &&
        (await playerModel.isEventReferee(payload.eventId))
      )
    ) {
      throw new Error("You don't have the necessary permissions to add penalties");
    }

    const eventModel = this.getModel(EventModel);
    const event = await eventModel.findById([payload.eventId]);
    if (event.length === 0) {
      throw new Error('Event not found');
    }

    if (!event[0].usePenalty) {
      throw new Error('Penalties are not enabled for this event');
    }

    const player = await playerModel.findById([payload.playerId]);
    if (player.length === 0) {
      throw new Error('Player not found');
    }

    const penalty = this.repo.em.create(PenaltyEntity, {
      event: this.repo.em.getReference(EventEntity, payload.eventId),
      playerId: payload.playerId,
      createdAt: new Date().toISOString(),
      amount: payload.amount,
      reason: payload.reason,
      assignedBy: this.repo.meta.personId ?? 0,
      cancelled: 0,
    });

    const sessionModel = this.getModel(SessionModel);
    const session = await sessionModel.findLastByPlayerAndEvent(
      payload.playerId,
      payload.eventId,
      SessionStatus.SESSION_STATUS_INPROGRESS
    );
    if (session.length > 0) {
      penalty.session = this.repo.em.getReference(SessionEntity, session[0].id);
    }

    await this.repo.skirnir.messagePenaltyApplied(
      payload.playerId,
      payload.eventId,
      payload.amount,
      payload.reason
    );

    await this.repo.em.persistAndFlush(penalty);
    return { success: true };
  }

  async addPenaltyGame(payload: GamesAddPenaltyGamePayload) {
    const playerModel = this.getModel(PlayerModel);
    if (!this.repo.meta.personId || !(await playerModel.isEventAdmin(payload.eventId))) {
      throw new Error("You don't have the necessary permissions to add penalties");
    }

    const eventModel = this.getModel(EventModel);
    const event = await eventModel.findById([payload.eventId]);
    if (event.length === 0) {
      throw new Error('Event not found');
    }

    const players = await playerModel.findById(payload.players);
    if (players.length !== 4) {
      throw new Error('Some players were not found');
    }

    const session = this.repo.db.em.create(SessionEntity, {
      event: this.repo.em.getReference(EventEntity, payload.eventId),
      status: SessionStatus.SESSION_STATUS_INPROGRESS,
      representationalHash: sha1(
        payload.players.join(',') +
          moment().format('YYYY-MM-DD HH:mm') +
          (process.env.SEED_REPEAT ? '' : randomInt(999999).toString())
      ),
      intermediateResults: new SessionState(event[0].ruleset, payload.players).state,
      replayHash: null,
      tableIndex: null,
      extraTime: 0,
    });
    await this.repo.db.em.persistAndFlush(session);

    const playerHistoryModel = this.getModel(PlayerHistoryModel);

    const penalty = 1 * event[0].ruleset.rules.replacementPlayerFixedPoints;
    let i = 1;
    const promises = [];
    for (const playerId of payload.players) {
      const sessionResult = this.repo.db.em.create(SessionResultsEntity, {
        event: event[0],
        session,
        playerId,
        place: i,
        score: event[0].ruleset.rules.startPoints,
        ratingDelta: penalty,
        chips: null,
      });
      this.repo.db.em.persist(sessionResult);
      promises.push(
        playerHistoryModel.makeNewHistoryItem(
          event[0].ruleset,
          playerId,
          payload.eventId,
          session.id,
          penalty,
          i
        )
      );
      i++;
    }
    await Promise.all(promises);

    session.endDate = new Date().toISOString();
    session.status = SessionStatus.SESSION_STATUS_FINISHED;
    this.repo.db.em.persist(session);

    await this.repo.db.em.flush();

    const playerStatsModel = this.getModel(PlayerStatsModel);
    await playerStatsModel.scheduleRebuildPlayersStats(payload.eventId);

    return { sessionHash: session.representationalHash! };
  }
}
