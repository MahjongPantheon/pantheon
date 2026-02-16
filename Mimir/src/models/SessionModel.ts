import {
  EndingPolicy,
  EventAdmin,
  PersonEx,
  PlatformType,
  Round,
  RoundOutcome,
  SessionStatus,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb.js';
import moment from 'moment-timezone';
import { Model } from './Model.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { SessionPlayerEntity } from 'src/entities/SessionPlayer.entity.js';
import { SessionResultsModel } from './SessionResultsModel.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { PlayerHistoryEntity } from 'src/entities/PlayerHistory.entity.js';
import { SessionState } from 'src/aggregates/SessionState.js';
import { PlayerModel } from './PlayerModel.js';
import { formatGameResult } from 'src/helpers/formatters.js';
import { RoundModel } from './RoundModel.js';
import { Populate } from '@mikro-orm/postgresql';
import {
  AddExtraTimePayload,
  GamesAddRoundResponse,
  GamesGetSessionOverviewResponse,
  GamesPreviewRoundResponse,
} from 'tsclients/proto/mimir.pb.js';
import { EventModel } from './EventModel.js';
import { RoundEntity } from 'src/entities/Round.entity.js';
import { CronModel } from './CronModel.js';
import { EventRegistrationModel } from './EventRegistrationModel.js';
import { PaymentsInfo } from 'src/helpers/PointsCalc.js';

export class SessionModel extends Model {
  async findById(id: number) {
    return this.repo.em.findOne(SessionEntity, { id });
  }

  async findByReplayHashAndEvent(eventId: number, replayHash: string) {
    return this.repo.em.findOne(SessionEntity, {
      event: this.repo.em.getReference(EventEntity, eventId),
      replayHash,
    });
  }

  async findAllInProgress() {
    return this.repo.em.findAll(SessionEntity, {
      where: { status: SessionStatus.SESSION_STATUS_INPROGRESS },
    });
  }

  // TODO: memoize
  async findByRepresentationalHash(
    hashList: string[],
    populate?: Populate<SessionEntity, 'event'>
  ) {
    return this.repo.em.findAll(SessionEntity, {
      where: { representationalHash: hashList },
      populate,
    });
  }

  async findByEventAndStatus(
    eventIds: number[],
    status: SessionStatus[],
    offset = 0,
    limit: number | null = null,
    orderBy: keyof SessionEntity | null = null,
    order: 'asc' | 'desc' = 'desc'
  ) {
    return this.repo.em.findAll(SessionEntity, {
      where: { status, event: this.repo.em.getReference(EventEntity, eventIds) },
      ...(orderBy !== null
        ? {
            orderBy: { [orderBy]: order === 'asc' ? 1 : -1 },
          }
        : {}),
      limit: limit ?? undefined,
      offset,
    });
  }

  async getPlayersSeatingInEvent(eventId: number) {
    const query = this.repo.em
      .getKnex()
      .from('session')
      .leftJoin('session_player', 'session_player.session_id', 'session.id')
      .select('session_player.player_id', 'session_player.order')
      .where('session.event_id', '=', eventId)
      .orderBy('session.id', 'asc')
      .orderBy('session_player.order', 'asc');

    return this.repo.em.execute<{ player_id: number; order: number }[]>(query);
  }

  async findByPlayerAndEvent(
    playerId: number,
    eventId: number,
    withStatus: SessionStatus | '*' = '*',
    dateFrom?: string,
    dateTo?: string
  ) {
    return this.repo.em
      .createQueryBuilder(SessionEntity)
      .leftJoin('session_player', 'sp')
      .where({
        'sp.player_id': playerId,
        'session.event_id': eventId,
        ...(withStatus !== '*' ? { 'session.status': withStatus } : {}),
        ...(dateFrom
          ? { 'session.start_date': { gte: moment(dateFrom).utc().format('YYYY-MM-DD HH:mm:ss') } }
          : {}),
        ...(dateTo
          ? { 'session.end_date': { lt: moment(dateTo).utc().format('YYYY-MM-DD HH:mm:ss') } }
          : {}),
      })
      .groupBy('session.id')
      .execute<SessionEntity[]>('all', true); // TODO verify proper entities are returned
  }

  async findLastByPlayerAndEvent(
    playerId: number,
    eventId: number,
    withStatus: SessionStatus | '*' = '*'
  ) {
    return this.repo.em
      .createQueryBuilder(SessionEntity)
      .leftJoin('session_player', 'sp')
      .where({
        ...(withStatus !== '*' ? { 'session.status': withStatus } : {}),
        'sp.player_id': playerId,
        'session.event_id': eventId,
      })
      .orderBy({ 'session.id': -1 })
      .limit(1)
      .execute<SessionEntity[]>('get', true); // TODO verify proper entity is returned
  }

  async getGamesCount(eventIdList: number[], withStatus: SessionStatus) {
    return this.repo.em.count(SessionEntity, {
      event: this.repo.em.getReference(EventEntity, eventIdList),
      status: withStatus,
    });
  }

  groupBySession(items: SessionPlayerEntity[]): Record<number, number[]> {
    const result: Record<number, number[]> = {};
    for (const item of items) {
      if (result[item.session.id]) {
        result[item.session.id].push(item.playerId);
      } else {
        result[item.session.id] = [item.playerId];
      }
    }
    return result;
  }

  async getPrefinishedItems(ruleset: RulesetEntity, eventIds: number[]) {
    const sessions = await this.findByEventAndStatus(eventIds, [
      SessionStatus.SESSION_STATUS_PREFINISHED,
    ]);

    const sessionPlayers = this.groupBySession(
      await this.repo.em.findAll(SessionPlayerEntity, {
        where: {
          session: this.repo.em.getReference(
            SessionEntity,
            sessions.map((s) => s.id)
          ),
        },
      })
    );

    const srMdl = this.getModel(SessionResultsModel);
    const phMdl = this.getModel(PlayerHistoryModel);

    // Note: query in loop; though we don't expect too many eventIds in list as it's undocumented
    // lastResults[eventId][sessionId][playerId]
    const lastResults = await Promise.all(
      eventIds.map((eventId) => phMdl.findAllLastByEventAndPlayer(eventId))
    ).then((results) =>
      results.reduce(
        (acc, eventResults) => {
          acc[eventResults[0].event.id] = eventResults.reduce(
            (acc2, item) => {
              acc2[item.sessionId] ??= {};
              acc2[item.sessionId][item.playerId] = item;
              return acc2;
            },
            {} as Record<number, Record<number, PlayerHistoryEntity>>
          );
          return acc;
        },
        {} as Record<number, Record<number, Record<number, PlayerHistoryEntity>>>
      )
    );

    // Apply prefinished results to the last state hash
    for (const session of sessions) {
      if (!session.intermediateResults) {
        continue;
      }
      const sessionState = new SessionState(
        ruleset,
        sessionPlayers[session.id],
        session.intermediateResults
      );
      const sessionResults = srMdl.getUnfinishedSessionResults(
        ruleset,
        session.event.id,
        session.id,
        sessionState,
        sessionPlayers[session.id]
      );
      lastResults[session.event.id][session.id] = phMdl.makeNewHistoryItemsForSession(
        lastResults[session.event.id][session.id],
        ruleset,
        session.event.id,
        session.id,
        sessionResults.reduce(
          (acc, item) => {
            acc[item.playerId] = {
              ratingDelta: item.ratingDelta,
              place: item.place,
              chips: item.chips ?? undefined,
            };
            return acc;
          },
          {} as Record<number, { ratingDelta: number; place: number; chips?: number }>
        )
      );
    }

    // Flatten last results back, no sorting required
    let historyItems: PlayerHistoryEntity[] = [];
    for (const eventId in lastResults) {
      historyItems = historyItems.concat(
        Object.values(lastResults[eventId])
          .map((res) => Object.values(res))
          .flat()
      );
    }

    return historyItems;
  }

  async getFinishedGame(representationalHash: string, substituteReplacementPlayers = false) {
    const playerModel = this.getModel(PlayerModel);
    const roundModel = this.getModel(RoundModel);
    const sessionResultsModel = this.getModel(SessionResultsModel);
    const [session, players] = await Promise.all([
      this.findByRepresentationalHash([representationalHash], ['event']),
      playerModel.findPlayersForSessions([representationalHash], substituteReplacementPlayers),
    ]);
    if (session.length === 0) {
      throw new Error('No session found in database');
    }

    const [results, rounds, replacements] = await Promise.all([
      sessionResultsModel.findBySession([session[0].id]),
      roundModel.findBySessionIds([session[0].id]),
      players.playersData.replaceMap,
    ]);

    return {
      game: formatGameResult(
        session[0],
        session[0].event.onlinePlatform ?? PlatformType.PLATFORM_TYPE_UNSPECIFIED,
        playerModel.substituteReplacements(players.playersData.players, replacements),
        results,
        rounds
      ),
    };
  }

  async getPlayersOfGames(
    sessions: SessionEntity[],
    substituteReplacementPlayers = true
  ): Promise<{
    players: Map<number, PersonEx[]>; // session -> players ordered
    replaceMap: Map<number, PersonEx>; // player -> replacement player
  }> {
    const playerModel = this.getModel(PlayerModel);
    const {
      playersData: { players, replaceMap },
      playerBySession,
    } = await playerModel.findPlayersForSessions(
      sessions.map((s) => s.representationalHash!),
      substituteReplacementPlayers
    );
    const result = new Map<number, PersonEx[]>();
    for (const [playerId, sessionId] of playerBySession) {
      for (const player of players) {
        if (player.id === playerId) {
          // should already be ordered by table order in findPlayersForSessions
          result.set(sessionId, [...(result.get(sessionId) ?? []), player]);
          break;
        }
      }
    }
    return {
      players: result,
      replaceMap,
    };
  }

  async getSessionOverview(sessionHash: string): Promise<GamesGetSessionOverviewResponse> {
    const session = await this.findByRepresentationalHash([sessionHash]);
    if (session.length === 0) {
      throw new Error('Session not found');
    }

    const eventModel = this.getModel(EventModel);
    const event = await eventModel.findById([session[0].event.id]);
    if (event.length === 0) {
      throw new Error('Event not found');
    }

    const playerModel = this.getModel(PlayerModel);
    const {
      playersData: { players, replaceMap },
    } = await playerModel.findPlayersForSessions([session[0].representationalHash!], true);

    const sessionState = new SessionState(
      event[0].ruleset,
      players.map((p) => p.id),
      session[0].intermediateResults
    );

    return {
      id: session[0].id,
      eventId: session[0].event.id,
      tableIndex: session[0].tableIndex,
      players: players.map((player) => ({
        id: player.id,
        title: player.title,
        hasAvatar: player.hasAvatar,
        lastUpdate: player.lastUpdate,
        score: sessionState.getScores()[player.id],
        yakitori: sessionState.getYakitori()[player.id],
        replacedBy: replaceMap.has(player.id)
          ? {
              id: replaceMap.get(player.id)!.id,
              title: replaceMap.get(player.id)!.title,
              hasAvatar: replaceMap.get(player.id)!.hasAvatar,
              lastUpdate: replaceMap.get(player.id)!.lastUpdate,
            }
          : null,
      })),
      timerState: (await eventModel.getTimerStateForSessions(event[0].id, session))[
        session[0].representationalHash!
      ],
      state: {
        dealer: sessionState.getCurrentDealer(),
        round: sessionState.getRound(),
        riichi: sessionState.getRiichiBets(),
        honba: sessionState.getHonba(),
        scores: sessionState.getScores(),
        finished: sessionState.isFinished(),
        chombo: sessionState.getChombo(),
        lastHandStarted: sessionState.lastHandStarted(),
      },
    };
  }

  async addRound(gameHash: string, roundData: Round): Promise<GamesAddRoundResponse> {
    const session = await this.findByRepresentationalHash([gameHash], ['event']);
    if (session.length === 0 || session[0].status !== SessionStatus.SESSION_STATUS_INPROGRESS) {
      throw new Error('Session not found');
    }
    const event = session[0].event;
    if (event.gamesStatus === TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY) {
      throw new Error("Sessions are ready, but not started yet. You can't add new round now");
    }

    const sessionState = new SessionState(
      event.ruleset,
      session[0].intermediateResults?.playerIds ?? [], // TODO check if this is populated properly on game start
      session[0].intermediateResults
    );

    const round =
      roundData.ron ??
      roundData.tsumo ??
      roundData.draw ??
      roundData.abort ??
      roundData.multiron ??
      roundData.nagashi ??
      roundData.chombo ??
      null;

    if (round?.roundIndex !== sessionState.getRound() || round.honba !== sessionState.getHonba()) {
      throw new Error('This round is already recorded (or other round index/honba mismatch)');
    }

    const roundEntity = RoundEntity.fromMessage(
      session[0],
      event,
      roundData,
      session[0].intermediateResults!
    );
    this.repo.em.persist(roundEntity);
    const lastScores = { ...sessionState.getScores() };
    await this.updateSessionState(event, session[0], sessionState, roundEntity);
    this.repo.em.persist(session[0]);
    const currentScores = sessionState.getScores();

    const diff = Object.fromEntries(
      Object.keys(lastScores).map((key) => [+key, [lastScores[+key], currentScores[+key]]])
    ) as Record<string, [number, number]>;

    const whoPlays = sessionState.state.playerIds;
    const eventRegModel = this.getModel(EventRegistrationModel);
    const replacements = await eventRegModel.getSubstitutionPlayers(event.id);
    const playerIds = whoPlays.map((id) => replacements[id] ?? id);
    const adminIds = (await this.repo.frey.GetEventAdmins({ eventId: event.id })).admins.map(
      (admin: EventAdmin) => admin.personId
    );

    this.repo.skirnir.trackSession(session[0].representationalHash!);
    this.repo.skirnir.messageHandRecorded(playerIds, adminIds, event.id, diff, roundData);

    if (sessionState.isFinished() && !event.syncEnd) {
      const cronModel = this.getModel(CronModel);
      await cronModel.scheduleRecalcAchievements(event.id);
      this.repo.skirnir.messageClubSessionEnd(playerIds, event.id, sessionState.getScores());
    }

    // don't forget to store all persisted data to db
    await this.repo.em.flush();
    const chomboCounts = sessionState.getChombo();
    return {
      scores: Object.entries(sessionState.getScores()).map(([playerId, score]) => ({
        playerId: +playerId,
        score,
        chomboCount: chomboCounts[+playerId],
      })),
      round: sessionState.getRound(),
      honba: sessionState.getHonba(),
      riichiBets: sessionState.getRiichiBets(),
      prematurelyFinished: sessionState.state.prematurelyFinished,
      roundJustChanged: sessionState.state.roundJustChanged,
      isFinished: sessionState.isFinished(),
      lastHandStarted: sessionState.lastHandStarted(),
      lastOutcome: roundData,
    };
  }

  async updateSessionState(
    event: EventEntity,
    session: SessionEntity,
    sessionState: SessionState,
    round: RoundEntity
  ) {
    let payments: PaymentsInfo = {
      direct: {},
      riichi: {},
      honba: {},
    };
    const cronModel = this.getModel(CronModel);
    const lastTimer = event.lastTimer;
    const noTimeLeft =
      event.useTimer &&
      lastTimer &&
      lastTimer + (event.gameDuration ?? 0) * 60 + session.extraTime < new Date().getTime();

    switch (event.ruleset.rules.endingPolicy) {
      case EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND: {
        if (noTimeLeft && round.outcome !== RoundOutcome.ROUND_OUTCOME_CHOMBO) {
          if (!sessionState.lastHandStarted()) {
            payments = sessionState.update(round);
            sessionState.setLastHandStarted(true);
          } else {
            // this is red zone in fact
            payments = sessionState.update(round);
            sessionState.forceFinish();
          }
        } else {
          sessionState.update(round);
          if (
            noTimeLeft &&
            sessionState.lastHandStarted() &&
            round.outcome === RoundOutcome.ROUND_OUTCOME_CHOMBO &&
            event.ruleset.rules.chomboEndsGame
          ) {
            sessionState.forceFinish();
          }
        }

        if (sessionState.isFinished()) {
          await cronModel.scheduleRecalcStats(event.id, sessionState.state.playerIds);
          await this.prefinish(event, session, sessionState);
        } else {
          session.intermediateResults = sessionState.state;
        }
        break;
      }
      case EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND: {
        payments = sessionState.update(round);

        if (
          noTimeLeft &&
          (round.outcome !== RoundOutcome.ROUND_OUTCOME_CHOMBO ||
            event.ruleset.rules.chomboEndsGame)
        ) {
          sessionState.forceFinish();
        }

        if (sessionState.isFinished()) {
          await cronModel.scheduleRecalcStats(event.id, sessionState.state.playerIds);
          await this.prefinish(event, session, sessionState);
        } else {
          session.intermediateResults = sessionState.state;
        }
        break;
      }
      case EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED:
      default: {
        payments = sessionState.update(round);

        // We should finish game here for offline events, but online ones will be finished manually in model.
        // Looks ugly :( But works as expected, so let it be until we find better solution.
        if (!event.isOnline && sessionState.isFinished()) {
          await cronModel.scheduleRecalcStats(event.id, sessionState.state.playerIds);
          await this.prefinish(event, session, sessionState);
        } else {
          session.intermediateResults = sessionState.state;
        }
        break;
      }
    }

    return payments;
  }

  async prefinish(event: EventEntity, session: SessionEntity, sessionState: SessionState) {
    // pre-finish state is not applied for games without synchronous ending
    if (!event.syncEnd) {
      return this.finish(event, session, sessionState);
    }

    if (session.status === SessionStatus.SESSION_STATUS_PREFINISHED) {
      return;
    }

    session.status = SessionStatus.SESSION_STATUS_PREFINISHED;
    session.endDate = new Date().toISOString();
    session.intermediateResults = sessionState.state;
  }

  async finish(event: EventEntity, session: SessionEntity, sessionState: SessionState) {
    if (session.status === SessionStatus.SESSION_STATUS_FINISHED) {
      return;
    }

    // Set end date if it is empty; for prefinished games it won't be.
    session.endDate ??= new Date().toISOString();
    session.status = SessionStatus.SESSION_STATUS_FINISHED;
    return this.finalizeGame(event, session, sessionState);
  }

  async finalizeGame(
    event: EventEntity,
    session: SessionEntity,
    sessionState: SessionState,
    useSavedReplacements = false
  ) {
    if (!useSavedReplacements) {
      const eventRegModel = this.getModel(EventRegistrationModel);
      // save replacements to session state for possible recalculations
      const players = await eventRegModel.findByPlayerAndEvent(
        session.intermediateResults?.playerIds ?? [],
        session.event.id
      );
      const replacements = players.reduce(
        (acc, player) => {
          if (player.replacementId) {
            acc[player.id] = player.replacementId;
          }
          return acc;
        },
        {} as Record<number, number>
      );
      sessionState.setReplacements(replacements);
    }

    const results = this.getSessionResults(event, session, sessionState);
    const playerHistoryModel = this.getModel(PlayerHistoryModel);
    results.forEach((result) => {
      // persist session history item
      this.repo.em.persist(result);
      // persists player history item inside
      playerHistoryModel.makeNewHistoryItem(
        event.ruleset,
        result.playerId,
        event.id,
        session.id,
        result.ratingDelta,
        result.place,
        result.chips
      );
    });

    session.intermediateResults = sessionState.state;
  }

  getSessionResults(event: EventEntity, session: SessionEntity, sessionState: SessionState) {
    const resultsModel = this.getModel(SessionResultsModel);
    return resultsModel.getUnfinishedSessionResults(
      event.ruleset,
      event.id,
      session.id,
      sessionState,
      sessionState.state.playerIds
    );
  }

  async previewRound(gameHash: string, roundData: Round): Promise<GamesPreviewRoundResponse> {
    const session = await this.findByRepresentationalHash([gameHash], ['event']);
    if (session.length === 0 || session[0].status !== SessionStatus.SESSION_STATUS_INPROGRESS) {
      throw new Error('Session not found');
    }
    const event = session[0].event;
    if (event.gamesStatus === TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY) {
      throw new Error("Sessions are ready, but not started yet. You can't add new round now");
    }

    const sessionState = new SessionState(
      event.ruleset,
      session[0].intermediateResults?.playerIds ?? [], // TODO check if this is populated properly on game start
      session[0].intermediateResults
    );

    const round =
      roundData.ron ??
      roundData.tsumo ??
      roundData.draw ??
      roundData.abort ??
      roundData.multiron ??
      roundData.nagashi ??
      roundData.chombo ??
      null;

    if (round?.roundIndex !== sessionState.getRound() || round.honba !== sessionState.getHonba()) {
      throw new Error('This round is already recorded (or other round index/honba mismatch)');
    }

    const currentDealer = sessionState.getCurrentDealer();
    const currentRoundIndex = sessionState.getRound();
    const currentRiichi = sessionState.getRiichiBets();
    const currentHonba = sessionState.getHonba();
    const currentScores = sessionState.getScores();
    const roundEntity = RoundEntity.fromMessage(
      session[0],
      event,
      roundData,
      session[0].intermediateResults!
    );
    const payments = await this.updateSessionState(event, session[0], sessionState, roundEntity);

    const whoPlays = sessionState.state.playerIds;
    const eventRegModel = this.getModel(EventRegistrationModel);
    const replacements = await eventRegModel.getSubstitutionPlayers(event.id);
    const playerIds = whoPlays.map((id) => replacements[id] ?? id);

    if (sessionState.isFinished() && !event.syncEnd) {
      const cronModel = this.getModel(CronModel);
      await cronModel.scheduleRecalcAchievements(event.id);
      this.repo.skirnir.messageClubSessionEnd(playerIds, event.id, sessionState.getScores());
    }

    // don't forget to store all persisted data to db
    await this.repo.em.flush();
    const chomboCounts = sessionState.getChombo();
    const toPaymentLog = ([dir, amount]: [string, number]) => ({
      from: +dir.split('<-')[1] || undefined,
      to: +dir.split('<-')[0] || undefined,
      amount,
    });
    return {
      state: {
        sessionHash: gameHash,
        dealer: currentDealer,
        roundIndex: currentRoundIndex,
        riichi: currentRiichi,
        honba: currentHonba,
        riichiIds: (round as { riichiBets?: number[] }).riichiBets ?? [],
        scores: Object.entries(sessionState.getScores()).map(([playerId, score]) => ({
          playerId: +playerId,
          score,
          chomboCount: chomboCounts[+playerId],
        })),
        scoresDelta: Object.entries(sessionState.getScores()).map(([playerId, score]) => ({
          playerId: +playerId,
          score: score - currentScores[+playerId],
          chomboCount: chomboCounts[+playerId],
        })),
        payments: {
          direct: Object.entries(payments.direct).map(toPaymentLog),
          riichi: Object.entries(payments.riichi).map(toPaymentLog),
          honba: Object.entries(payments.honba).map(toPaymentLog),
        },
        round: sessionState.getRound(),
        outcome: roundData.ron
          ? RoundOutcome.ROUND_OUTCOME_RON
          : roundData.tsumo
            ? RoundOutcome.ROUND_OUTCOME_TSUMO
            : roundData.draw
              ? RoundOutcome.ROUND_OUTCOME_DRAW
              : roundData.abort
                ? RoundOutcome.ROUND_OUTCOME_ABORT
                : roundData.nagashi
                  ? RoundOutcome.ROUND_OUTCOME_NAGASHI
                  : roundData.multiron
                    ? RoundOutcome.ROUND_OUTCOME_MULTIRON
                    : roundData.chombo
                      ? RoundOutcome.ROUND_OUTCOME_CHOMBO
                      : RoundOutcome.ROUND_OUTCOME_UNSPECIFIED,
      },
    };
  }

  async mayDefinalize(session: SessionEntity) {
    if (session.status !== SessionStatus.SESSION_STATUS_FINISHED) {
      return false;
    }

    if (!session.endDate || !(await this.isLastForPlayers(session))) {
      return false;
    }

    const endDate = moment.tz(session.endDate, session.event.timezone);
    const now = moment.tz(session.event.timezone);
    return !(now.diff(endDate, 'days') > 0 || now.diff(endDate, 'hours') >= 3);
  }

  /**
   * Check if current session is chronologically last for all its players.
   * Exclude cancelled games, as they're not counted
   */
  async isLastForPlayers(session: SessionEntity) {
    const query = this.repo.em
      .getKnex()
      .select('*')
      .from('session_player')
      .join('session', (qb) =>
        qb
          .on('session_player.session_id', 'session.id')
          .andOnIn('session.event_id', [session.event.id])
          .andOnNotIn('session.status', [SessionStatus.SESSION_STATUS_CANCELLED])
      )
      .whereIn('session_player.player_id', session.intermediateResults?.playerIds ?? [])
      .orderBy('session_player.id', 'desc')
      .limit(4);
    const lastSessions = await this.repo.em.execute(query);
    for (const lastSession of lastSessions) {
      if (lastSession.id !== session.id) {
        return false;
      }
    }
    return true;
  }

  async addExtraTime(addExtraTimePayload: AddExtraTimePayload) {
    const sessions = await this.repo.db.em.find(
      SessionEntity,
      {
        representationalHash: addExtraTimePayload.sessionHashList,
      },
      { populate: ['event'] }
    );

    if (!sessions.every((s) => s.event.id === sessions[0].event.id)) {
      throw new Error('Sessions must belong to the same event');
    }

    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !(
        (await playerModel.isEventAdmin(sessions[0].event.id)) &&
        (await playerModel.isEventReferee(sessions[0].event.id))
      )
    ) {
      throw new Error("You don't have the necessary permissions to add extra time");
    }

    for (const session of sessions) {
      session.extraTime += addExtraTimePayload.extraTime;
      this.repo.db.em.persist(session);
    }

    await this.repo.db.em.flush();
    return { success: true };
  }
}
