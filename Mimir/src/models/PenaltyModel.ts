import { PenaltyEntity } from 'src/entities/Penalty.entity.js';
import { Model } from './Model.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import {
  CancelPenaltyPayload,
  ChomboResponse,
  GamesAddPenaltyGamePayload,
  GamesAddPenaltyPayload,
  PenaltiesResponse,
} from 'tsclients/proto/mimir.pb.js';
import { PlayerModel } from './PlayerModel.js';
import { EventModel } from './EventModel.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { SessionModel } from './SessionModel.js';
import { GenericSuccessResponse, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { SessionState } from 'src/aggregates/SessionState.js';
import { SessionResultsEntity } from 'src/entities/SessionResults.entity.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { sha1 } from 'src/helpers/crypto.js';
import { randomInt } from 'crypto';
import moment from 'moment';
import { PlayerStatsModel } from './PlayerStatsModel.js';
import { RoundModel } from './RoundModel.js';

export class PenaltyModel extends Model {
  async findBySession(sessionId: number[]) {
    return this.repo.em.findAll(PenaltyEntity, {
      where: { session: this.repo.em.getReference(SessionEntity, sessionId) },
    });
  }

  async findByEventId(eventId: number[], onlyActive = false) {
    return this.repo.em.findAll(PenaltyEntity, {
      where: {
        event: this.repo.em.getReference(EventEntity, eventId),
        cancelled: onlyActive ? 0 : undefined,
      },
    });
  }

  async findByEventAndPlayer(eventId: number, playerId: number) {
    return this.repo.em.findAll(PenaltyEntity, {
      where: {
        event: this.repo.em.getReference(EventEntity, eventId),
        playerId,
      },
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

  async listPenalties(eventId: number): Promise<PenaltiesResponse> {
    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !((await playerModel.isEventAdmin(eventId)) && (await playerModel.isEventReferee(eventId)))
    ) {
      throw new Error("You don't have the necessary permissions to list penalties");
    }

    const penalties = await this.findByEventId([eventId]);
    const referees = await playerModel.findById(penalties.map((p) => p.assignedBy));
    return {
      penalties: penalties.map((p) => ({
        who: p.playerId,
        amount: p.amount,
        reason: p.reason,
        assignedBy: p.assignedBy,
        createdAt: p.createdAt,
        isCancelled: p.cancelled,
        cancellationReason: p.cancelledReason,
        id: p.id,
      })),
      referees: referees.map((r) => ({
        id: r.id,
        title: r.title,
        tenhouId: r.tenhouId,
        hasAvatar: r.hasAvatar,
        lastUpdate: r.lastUpdate,
      })),
    };
  }

  async listMyPenalties(eventId: number, personId: number | null): Promise<PenaltiesResponse> {
    if (!personId) {
      throw new Error('Unauthorized to use this endpoint');
    }
    const penalties = await this.findByEventAndPlayer(eventId, personId);
    const playerModel = this.getModel(PlayerModel);
    const referees = await playerModel.findById(penalties.map((p) => p.assignedBy));
    return {
      penalties: penalties.map((p) => ({
        who: p.playerId,
        amount: p.amount,
        reason: p.reason,
        assignedBy: p.assignedBy,
        createdAt: p.createdAt,
        isCancelled: p.cancelled,
        cancellationReason: p.cancelledReason,
        id: p.id,
      })),
      referees: referees.map((r) => ({
        id: r.id,
        title: r.title,
        tenhouId: r.tenhouId,
        hasAvatar: r.hasAvatar,
        lastUpdate: r.lastUpdate,
      })),
    };
  }

  async cancelPenalty(payload: CancelPenaltyPayload): Promise<GenericSuccessResponse> {
    const penalty = await this.repo.em.findOne(PenaltyEntity, { id: payload.penaltyId });
    if (!penalty) {
      throw new Error('Penalty not found');
    }

    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !(
        (await playerModel.isEventAdmin(penalty.event.id)) &&
        (await playerModel.isEventReferee(penalty.event.id))
      )
    ) {
      throw new Error("You don't have the necessary permissions to cancel penalties");
    }

    penalty.cancelled = 1;
    penalty.cancelledReason = payload.reason ?? undefined;
    await this.repo.em.persistAndFlush(penalty);
    await this.repo.skirnir.messagePenaltyCancelled(
      penalty.playerId,
      penalty.event.id,
      penalty.amount,
      penalty.cancelledReason ?? ''
    );
    return { success: true };
  }

  async listChombo(eventId: number): Promise<ChomboResponse> {
    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !((await playerModel.isEventAdmin(eventId)) && (await playerModel.isEventReferee(eventId)))
    ) {
      throw new Error("You don't have the necessary permissions to list chombo");
    }

    const event = await this.repo.em.findOne(EventEntity, eventId, { populate: ['ruleset'] });
    if (!event) {
      throw new Error('Event not found');
    }

    const roundModel = this.getModel(RoundModel);
    const chombo = await roundModel.findChomboInEvent(eventId);
    const players = await playerModel.findById(
      chombo.flatMap((c) => c.hands.map((h) => h.loserId).filter((id): id is number => !!id))
    );
    return {
      chombos: chombo.flatMap((c) =>
        c.hands.map((h) => ({
          playerId: h.loserId,
          amount: event.ruleset.rules.chomboAmount,
        }))
      ),
      players: players.map((p) => ({
        id: p.id,
        title: p.title,
        hasAvatar: p.hasAvatar,
        lastUpdate: p.lastUpdate,
        tenhouId: p.tenhouId,
      })),
    };
  }
}
