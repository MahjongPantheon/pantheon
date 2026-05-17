import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { Model } from './Model.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { PlayerModel } from './PlayerModel.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { PlayerInSessionModel } from './PlayerInSessionModel.js';
import {
  make_seating_shuffled,
  make_seating_swiss,
  make_seating_interval,
  update_wind_placing_only,
  WindShuffle as MahjongWindShuffle,
} from 'mahjong-seatings-rs-node';
import {
  EventsGetCurrentSeatingResponse,
  SeatingGenerateSwissSeatingPayload,
  SeatingGenerateSwissSeatingResponse,
  SeatingMakeIntervalSeatingPayload,
  SeatingMakePrescriptedSeatingPayload,
  SeatingMakeShuffledSeatingPayload,
  SeatingMakeSwissSeatingPayload,
} from 'tsclients/proto/mimir.pb.js';
import {
  GenericSuccessResponse,
  SessionStatus,
  TournamentGamesStatus,
  WindShuffleMode,
} from 'tsclients/proto/atoms.pb.js';
import { SessionModel } from './SessionModel.js';
import { EventRegistrationModel } from './EventRegistrationModel.js';
import { PenaltyModel } from './PenaltyModel.js';
import { randomInt } from 'node:crypto';
import { EventPrescriptEntity } from 'src/entities/EventPrescript.entity.js';
import { unpackScript } from './EventPrescriptModel.js';

export class SeatingModel extends Model {
  public async getCurrentSeating(eventId: number): Promise<EventsGetCurrentSeatingResponse> {
    const event = await this.repo.em.findOne(EventEntity, eventId, {
      populate: ['ruleset'],
    });
    if (!event) {
      throw new Error('Event not found');
    }
    const startRating = event.ruleset?.rules.startRating;

    const registrations = await this.repo.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: this.repo.em.getReference(EventEntity, eventId), ignoreSeating: 0 },
    });

    const regIds = registrations.map((r) => r.id);

    const playerModel = this.getModel(PlayerModel);
    const players = await playerModel.findById(regIds);

    const historyModel = this.getModel(PlayerHistoryModel);
    const history = await historyModel.findLastByEvent([eventId]);

    const playerInSessionModel = this.getModel(PlayerInSessionModel);
    const seating = await playerInSessionModel.getPlayersSeatingInEvent(eventId, regIds.length);

    const ratings: Record<number, number> = {};
    for (const player of players) {
      ratings[player.id] = startRating;
    }
    for (const hItem of history) {
      if (hItem.rating) {
        ratings[hItem.playerId] = hItem.rating;
      }
    }

    const playerById = players.reduce(
      (acc, player) => {
        acc[player.id] = player;
        return acc;
      },
      {} as Record<number, (typeof players)[0]>
    );

    return {
      seating: seating
        .map((seat) => ({
          ...seat,
          rating: ratings[seat.player_id] ?? 0,
          title: playerById[seat.player_id]?.title,
          hasAvatar: playerById[seat.player_id]?.hasAvatar ?? false,
          lastUpdate: playerById[seat.player_id]?.lastUpdate,
        }))
        .filter((s) => !!s.table_index),
    };
  }

  async makeShuffledSeating(
    payload: SeatingMakeShuffledSeatingPayload
  ): Promise<GenericSuccessResponse> {
    const { eventId, groupsCount, seed, windShuffleMode } = payload;

    const seatingGetter = (
      playersMap: Record<number, number>,
      _seed: number,
      _windShuffleMode: WindShuffleMode,
      previousSeatings: number[][]
    ) =>
      make_seating_shuffled({
        playersMap,
        groupsCount,
        randFactor: _seed,
        windShuffle: this._getWindShuffleMode(_windShuffleMode),
        previousSeatings,
      });

    return this.makeSeatingAndStartGames(eventId, seed, seatingGetter, windShuffleMode);
  }

  async makeSwissSeating(payload: SeatingMakeSwissSeatingPayload): Promise<GenericSuccessResponse> {
    const { eventId, windShuffleMode } = payload;
    const seed = randomInt(999999);
    const seatingGetter = (
      playersMap: Record<number, number>,
      _seed: number,
      _windShuffleMode: WindShuffleMode,
      previousSeatings: number[][]
    ) =>
      make_seating_swiss({
        playersMap,
        randFactor: _seed,
        windShuffle: this._getWindShuffleMode(_windShuffleMode),
        previousSeatings,
      });
    return this.makeSeatingAndStartGames(eventId, seed, seatingGetter, windShuffleMode);
  }

  async makeIntervalSeating(
    payload: SeatingMakeIntervalSeatingPayload
  ): Promise<GenericSuccessResponse> {
    const { eventId, step, windShuffleMode } = payload;
    const seed = randomInt(999999);
    const seatingGetter = (
      playersMap: Record<number, number>,
      _seed: number,
      _windShuffleMode: WindShuffleMode,
      previousSeatings: number[][]
    ) =>
      make_seating_interval({
        playersMap,
        randFactor: seed,
        step,
        windShuffle: this._getWindShuffleMode(_windShuffleMode),
        previousSeatings,
      });
    return this.makeSeatingAndStartGames(eventId, seed, seatingGetter, windShuffleMode);
  }

  async makePrescriptedSeating(
    payload: SeatingMakePrescriptedSeatingPayload
  ): Promise<GenericSuccessResponse> {
    const { eventId, windShuffleMode } = payload;
    const seed = randomInt(999999);
    const prescriptEntity = await this.repo.em.findOne(EventPrescriptEntity, {
      event: this.repo.db.em.getReference(EventEntity, eventId),
    });
    if (!prescriptEntity) {
      throw new Error('No prescript entity found for event');
    }
    const seating = await this._getNextPrescriptedSeating(
      eventId,
      prescriptEntity.script,
      prescriptEntity.nextGame
    );
    const seatingGetter = (
      _playersMap: Record<number, number>, // ignored in this case
      _seed: number,
      _windShuffleMode: WindShuffleMode,
      previousSeatings: number[][]
    ) => {
      return update_wind_placing_only({
        playersMap: seating,
        previousSeatings,
        randFactor: _seed,
        windShuffle: this._getWindShuffleMode(_windShuffleMode),
      });
    };
    const result = await this.makeSeatingAndStartGames(
      eventId,
      seed,
      seatingGetter,
      windShuffleMode
    );
    prescriptEntity.nextGame++;
    await this.repo.em.persistAndFlush(prescriptEntity);
    return result;
  }

  public async resetSeating(eventId: number): Promise<GenericSuccessResponse> {
    await this._ensureActionAllowed(eventId);
    const event = await this.repo.em.findOne(EventEntity, eventId);
    if (
      !event ||
      event.gamesStatus !== TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY
    ) {
      throw new Error(`Event #${eventId} not found or not in proper state`);
    }

    if (event.isPrescripted) {
      const prescript = await this.repo.em.findOne(EventPrescriptEntity, { event });
      if (prescript) {
        prescript.nextGame--;
        this.repo.db.em.persist(prescript);
      }
    }

    event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED;
    this.repo.db.em.persist(event);

    const sessionModel = this.getModel(SessionModel);
    const sessions = await sessionModel.findByEventAndStatus(
      [eventId],
      [SessionStatus.SESSION_STATUS_INPROGRESS]
    );
    this.repo.db.em.remove(sessions);

    await this.repo.db.em.flush();
    return { success: true };
  }

  async generateSwissSeating(
    payload: SeatingGenerateSwissSeatingPayload
  ): Promise<SeatingGenerateSwissSeatingResponse> {
    const event = await this.repo.em.findOne(EventEntity, payload.eventId);
    if (!event) {
      throw new Error(`Event #${payload.eventId} not found`);
    }

    const seatingGetter = (
      playersMap: Record<number, number>,
      seed: number,
      windShuffleMode: WindShuffleMode,
      previousSeatings: number[][]
    ) =>
      make_seating_swiss({
        playersMap,
        randFactor: seed,
        windShuffle: this._getWindShuffleMode(windShuffleMode),
        previousSeatings,
      });

    const { chunks, replacements } = await this.makeSeating(
      event,
      randomInt(999999),
      seatingGetter,
      payload.windShuffleMode ?? WindShuffleMode.WIND_SHUFFLE_MODE_RANDOM
    );

    if (payload.substituteReplacementPlayers) {
      for (const table of chunks) {
        for (const idx in table) {
          if (replacements[table[idx]]) {
            table[idx] = replacements[table[idx]];
          }
        }
      }
    }

    return { tables: chunks.map((table) => ({ players: table })) };
  }

  private async makeSeating(
    event: EventEntity,
    seed: number,
    seatingGetter: (
      playersMap: Record<number, number>,
      seed: number,
      windShuffleMode: WindShuffleMode,
      previousSeatings: number[][]
    ) => number[][],
    windShuffleMode: WindShuffleMode
  ) {
    await this._ensureActionAllowed(event.id);

    const sessionModel = this.getModel(SessionModel);
    const sessions = await sessionModel.findByEventAndStatus(
      [event.id],
      [SessionStatus.SESSION_STATUS_INPROGRESS]
    );
    if (sessions.length === 0) {
      throw new Error('No active session found for this event');
    }

    if (event.useTimer) {
      event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY;
      this.repo.em.persist(event);
    }
    const regModel = this.getModel(EventRegistrationModel);
    const regs = await regModel.findByEventId([event.id]);

    const [playersMap, previousSeatings] = await this._getData(event, regs);
    const seating = seatingGetter(playersMap, seed, windShuffleMode, previousSeatings);

    const chunks = [];
    for (let i = 0; i < seating.length; i += 4) {
      chunks.push(seating.slice(i, i + 4).map((p) => p[0]));
    }

    const replacements: Record<number, number> = {};
    for (const reg of regs) {
      if (reg.replacementId) {
        replacements[reg.playerId] = reg.replacementId;
      }
    }

    return { chunks, replacements };
  }

  private async makeSeatingAndStartGames(
    eventId: number,
    seed: number,
    seatingGetter: (
      playersMap: Record<number, number>,
      seed: number,
      windShuffleMode: WindShuffleMode,
      previousSeatings: number[][]
    ) => number[][],
    windShuffleMode: WindShuffleMode
  ): Promise<GenericSuccessResponse> {
    const sessionModel = this.getModel(SessionModel);
    const event = await this.repo.em.findOne(EventEntity, eventId);
    if (!event) {
      throw new Error(`Event #${eventId} not found`);
    }
    const { chunks, replacements } = await this.makeSeating(
      event,
      seed,
      seatingGetter,
      windShuffleMode
    );
    let tableIndex = 1;
    const promises = [];
    for (const table of chunks) {
      sessionModel.startSession(event, table, tableIndex);

      for (const idx in table) {
        if (replacements[table[idx]]) {
          table[idx] = replacements[table[idx]];
        }
      }
      promises.push(this.repo.skirnir.messageSeatingReady(table, tableIndex, eventId));
      tableIndex++;
    }

    await this.repo.em.flush();
    await Promise.all(promises);

    return { success: true };
  }

  private async _getNextPrescriptedSeating(
    eventId: number,
    script: string,
    nextGameIndex: number
  ): Promise<Record<number, number>> {
    const seating = (unpackScript(script)[nextGameIndex] ?? []).flat(2);
    // replace local ids with real ids
    const regModel = this.getModel(EventRegistrationModel);
    const localIdMap = await regModel.findLocalIdsMapByEvent(eventId, true);
    return seating.map((localId) => localIdMap.get(localId)!);
  }

  private async _ensureActionAllowed(eventId: number): Promise<void> {
    const event = await this.repo.em.findOne(EventEntity, eventId);
    if (!event) {
      throw new Error(`Event #${eventId} not found`);
    }

    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !((await playerModel.isEventAdmin(eventId)) && (await playerModel.isEventReferee(eventId)))
    ) {
      throw new Error("You don't have the necessary permissions to make new seating");
    }

    if (event.finished) {
      throw new Error('Event is already finished');
    }
  }

  private async _getData(
    event: EventEntity,
    regs: EventRegisteredPlayersEntity[]
  ): Promise<[Record<number, number>, number[][]]> {
    const regModel = this.getModel(EventRegistrationModel);
    const ignoredPlayerIds = await regModel.findIgnoredPlayersIdsByEvent([event.id]);

    const penaltyModel = this.getModel(PenaltyModel);
    const penalties = await penaltyModel.findByEventId([event.id], true);
    const penaltyByPlayer = penalties.reduce(
      (acc, penalty) => {
        if (!acc[penalty.playerId]) {
          acc[penalty.playerId] = { amount: 0, count: 0 };
        }
        acc[penalty.playerId].amount += penalty.amount;
        acc[penalty.playerId].count++;
        return acc;
      },
      {} as Record<number, { amount: number; count: number }>
    );

    const historyModel = this.getModel(PlayerHistoryModel);
    const history = await historyModel.findLastByEvent([event.id]);
    const playersMap: Record<number, number> = {};

    // First step is adding players that already played games
    for (const item of history) {
      if (ignoredPlayerIds.includes(item.playerId)) {
        continue;
      }
      playersMap[item.playerId] = item.rating - (penaltyByPlayer[item.playerId]?.amount ?? 0);
    }

    // Second step is adding players that didn't play yet
    // this situation is possible only in online tournament
    // when we added replacement player
    const initialRating = event.ruleset?.rules.startRating ?? 0;
    for (const reg of regs) {
      if (ignoredPlayerIds.includes(reg.playerId)) {
        continue;
      }
      if (!playersMap[reg.playerId]) {
        playersMap[reg.playerId] = initialRating;
      }
    }

    const playerInSessionModel = this.getModel(PlayerInSessionModel);
    const previousSeatings = await playerInSessionModel.getPlayersSeatingInEvent(event.id);

    const tables = previousSeatings
      .map((s) => s.player_id)
      .filter((id) => !ignoredPlayerIds.includes(id));
    const seatingChunks: number[][] = [];
    for (let i = 0; i < tables.length; i += 4) {
      seatingChunks.push(tables.slice(i, i + 4));
    }

    return [playersMap, seatingChunks];
  }

  private _getWindShuffleMode(windShuffleMode: WindShuffleMode): MahjongWindShuffle {
    switch (windShuffleMode) {
      case WindShuffleMode.WIND_SHUFFLE_MODE_RANDOM:
        return 'random';
      case WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED:
        return 'balanced';
      case WindShuffleMode.WIND_SHUFFLE_MODE_PRESCRIPTED:
        return 'prescripted';
      case WindShuffleMode.WIND_SHUFFLE_MODE_UNSPECIFIED:
      default:
        return 'random';
    }
  }
}
