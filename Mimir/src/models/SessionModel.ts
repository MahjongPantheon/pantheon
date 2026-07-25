import {
  EndingPolicy,
  EventAdmin,
  GenericSessionPayload,
  PersonEx,
  PlatformType,
  Round,
  RoundOutcome,
  SessionStatus,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb.js';
import moment from 'moment-timezone';
import { Model } from './Model.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { EventEntity } from '../entities/Event.entity.js';
import { SessionPlayerEntity } from '../entities/SessionPlayer.entity.js';
import { SessionResultsModel } from './SessionResultsModel.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { PlayerHistoryEntity } from '../entities/PlayerHistory.entity.js';
import { SessionState } from '../helpers/SessionState.js';
import { PlayerModel } from './PlayerModel.js';
import { formatGameResult } from '../helpers/formatters.js';
import { RoundModel } from './RoundModel.js';
import { Populate } from '@mikro-orm/postgresql';
import {
  AddExtraTimePayload,
  GamesAddRoundResponse,
  GamesDropLastRoundPayload,
  GamesGetSessionOverviewResponse,
  GamesPreviewRoundResponse,
  GamesStartGamePayload,
} from 'tsclients/proto/mimir.pb.js';
import { EventModel } from './EventModel.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { CronModel } from './CronModel.js';
import { EventRegistrationModel } from './EventRegistrationModel.js';
import { PaymentsInfo } from '../helpers/PointsCalc.js';
import { sha1 } from '../helpers/crypto.js';
import { randomInt } from 'crypto';
import { SessionStateEntity } from '../entities/SessionState.entity.js';
import { Context } from '../context.js';
import { PlayerStatsModel } from './PlayerStatsModel.js';
import { AchievementsModel } from './AchievementsModel.js';

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
    populate?: Populate<SessionEntity, 'event' | 'event.ruleset' | 'event.ruleset.rules'>
  ) {
    return this.repo.em.findAll(SessionEntity, {
      where: { representationalHash: { $in: hashList } },
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
      where: {
        status,
        event: {
          id: {
            $in: eventIds,
          },
        },
      },
      ...(orderBy !== null
        ? {
            orderBy: { [orderBy]: order === 'asc' ? 1 : -1 },
          }
        : {}),
      limit: limit ?? undefined,
      offset,
      populate: ['players'],
    });
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
      .leftJoin('players', 'sp')
      .where({
        'sp.player_id': playerId,
        event_id: eventId,
        ...(withStatus !== '*' ? { status: withStatus } : {}),
        ...(dateFrom
          ? {
              start_date: {
                gte: moment(dateFrom).utc().format('YYYY-MM-DD HH:mm:ss'),
              },
            }
          : {}),
        ...(dateTo
          ? {
              end_date: {
                lt: moment(dateTo).utc().format('YYYY-MM-DD HH:mm:ss'),
              },
            }
          : {}),
      })
      .groupBy('id')
      .execute()
      .then((result) => result.map((item) => this.repo.em.map(SessionEntity, item)));
  }

  async findLastByPlayerAndEvent(
    playerId: number,
    eventId: number,
    withStatus: SessionStatus | '*' = '*'
  ) {
    return this.repo.em
      .createQueryBuilder(SessionEntity)
      .leftJoin('players', 'sp')
      .where({
        ...(withStatus !== '*' ? { status: withStatus } : {}),
        'sp.player_id': playerId,
        event_id: eventId,
      })
      .orderBy({ id: -1 })
      .limit(1)
      .execute()
      .then((result) => result.map((item) => this.repo.em.map(SessionEntity, item)));
  }

  async getGamesCount(eventIdList: number[], withStatus: SessionStatus) {
    return this.repo.em.count(SessionEntity, {
      event: {
        id: {
          $in: eventIdList,
        },
      },
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

    const [results, rounds] = await Promise.all([
      sessionResultsModel.findBySession([session[0].id]),
      roundModel.findBySessionIds([session[0].id]),
    ]);
    const replacements = players.playersData.replaceMap;

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

  /**
   * Get players and substitutions
   * Note: all sessions must belong to the same event
   * @param sessions
   * @param substituteReplacementPlayers
   * @returns
   */
  async getPlayersOfGames(
    sessions: SessionEntity[],
    substituteReplacementPlayers = true
  ): Promise<{
    players: Map<number, PersonEx[]>; // session -> players ordered
    replaceMap: Map<number, PersonEx>; // player -> replacement player
  }> {
    if (sessions.length === 0) {
      return { players: new Map(), replaceMap: new Map() };
    }
    const eventId = sessions[0].event.id;
    // invariant check
    if (sessions.some((s) => s.event.id !== eventId)) {
      throw new Error('All sessions must belong to the same event');
    }

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
        ratingDelta: 0, // probably unused, check and remove some day
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
        roundIndex: sessionState.getRound(),
        riichiCount: sessionState.getRiichiBets(),
        honbaCount: sessionState.getHonba(),
        scores: Object.entries(sessionState.getScores()).map(([playerId, score]) => ({
          playerId: +playerId,
          score,
          chomboCount: sessionState.getChombo()[+playerId] ?? 0,
        })),
        finished: sessionState.isFinished(),
        chombo: Object.entries(sessionState.getChombo()).map(([playerId, amount]) => ({
          playerId: +playerId,
          amount,
        })),
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
      session[0].intermediateResults ? session[0].intermediateResults.clone() : undefined
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
      lastOutcome: roundData.ron
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
          payments = sessionState.update(round);
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

  async startGame(gamesStartGamePayload: GamesStartGamePayload, context: Context) {
    const eventModel = this.getModel(EventModel);
    const event = await eventModel.findById([gamesStartGamePayload.eventId]);
    if (!event.length) {
      throw new Error(`Event id #${gamesStartGamePayload.eventId} not found`);
    }

    if (event[0].finished) {
      throw new Error(`Event id #${gamesStartGamePayload.eventId} is already finished`);
    }

    const playerModel = this.getModel(PlayerModel);
    const players = await playerModel.findById(gamesStartGamePayload.players);
    if (players.length !== gamesStartGamePayload.players.length) {
      throw new Error(`Some players do not exist in database`);
    }

    this.repo.em.persist(event[0]);

    const newSession = this.startSession(event[0], gamesStartGamePayload.players, null);

    this.repo.em.flush();

    context.repository.skirnir.trackSession(newSession.representationalHash!);
    return { sessionHash: newSession.representationalHash! };
  }

  // Internal method to start arbitrary session from seating code or other sources
  startSession(event: EventEntity, playerIds: number[], tableIndex: number | null) {
    const sessionState = new SessionState(event.ruleset, playerIds);

    if (event.ruleset.rules.withYakitori) {
      sessionState.setYakitori(Object.fromEntries(playerIds.map((id) => [id, true])));
    }

    const newSession = this.repo.em.create(SessionEntity, {
      event,
      status: SessionStatus.SESSION_STATUS_INPROGRESS,
      replayHash: null,
      tableIndex,
      extraTime: 0,
      startDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      players: [],
      representationalHash: sha1(
        playerIds.join(',') +
          moment().format('YYYY-MM-DD HH:mm') +
          (process.env.SEED_REPEAT ? '' : randomInt(999999).toString())
      ),
      intermediateResults: this.repo.em.create(SessionStateEntity, sessionState.state),
    });
    this.repo.em.persist(newSession);

    const sessionPlayers = playerIds.map((playerId, order) => {
      return this.repo.em.create(SessionPlayerEntity, {
        order: order + 1,
        playerId,
        session: newSession,
      });
    });
    this.repo.em.persist(sessionPlayers);

    return newSession;
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

  async cancelGame(payload: GenericSessionPayload) {
    const session = await this.findByRepresentationalHash([payload.sessionHash]);
    if (session.length === 0) {
      throw new Error('Session not found');
    }

    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !(
        (await playerModel.isEventAdmin(session[0].event.id)) ||
        (await playerModel.isEventReferee(session[0].event.id))
      )
    ) {
      throw new Error("You don't have the necessary permissions to cancel game");
    }

    if (session[0].status !== SessionStatus.SESSION_STATUS_INPROGRESS) {
      throw new Error('Session is not in progress');
    }
    session[0].status = SessionStatus.SESSION_STATUS_CANCELLED;
    await this.repo.em.persistAndFlush(session[0]);

    return { success: true };
  }

  async finalizeGames(eventId: number) {
    const sessionModel = this.getModel(SessionModel);
    const sessions = await sessionModel.findByEventAndStatus(
      [eventId],
      [SessionStatus.SESSION_STATUS_PREFINISHED]
    );
    if (sessions.length === 0) {
      return { success: true };
    }

    const playerModel = this.getModel(PlayerModel);

    if (
      !this.repo.meta.personId ||
      !((await playerModel.isEventAdmin(eventId)) || (await playerModel.isEventReferee(eventId)))
    ) {
      throw new Error("You don't have the necessary permissions to finish games");
    }

    const achievementsModel = this.getModel(AchievementsModel);
    const eventModel = this.getModel(EventModel);
    const playerRegModel = this.getModel(EventRegistrationModel);

    const [regs, event] = await Promise.all([
      playerRegModel.findByEventId([eventId]),
      eventModel.findById([eventId]),
      achievementsModel.scheduleRebuildAchievements(eventId),
    ]);

    const playerMap = new Map(regs.map((reg) => [reg.playerId, reg.replacementId]));
    const promises = [];
    const skirnirPromises = [];
    for (const session of sessions) {
      const sessionState = new SessionState(
        event[0].ruleset,
        session.intermediateResults?.playerIds ?? [],
        session.intermediateResults
      );
      promises.push(
        this.finish(session.event, session, sessionState).then(() => {
          this.repo.em.persist(session);
        })
      );

      const whoPlays = [...sessionState.state.playerIds];
      for (let i = 0; i < sessionState.state.playerIds.length; i++) {
        const replacementId = playerMap.get(sessionState.state.playerIds[i]);
        if (replacementId) {
          whoPlays[i] = replacementId;
        }
      }
      skirnirPromises.push(
        this.repo.skirnir.messageTournamentSessionEnd(whoPlays, eventId, sessionState.getScores())
      );
    }
    await Promise.all(promises);
    await this.repo.em.flush();
    await Promise.all(skirnirPromises);
    return { success: true };
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
    const session = await this.findByRepresentationalHash(
      [gameHash],
      ['event', 'event.ruleset', 'event.ruleset.rules']
    );
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
      session[0].intermediateResults
    );
    const payments = await this.updateSessionState(event, session[0], sessionState, roundEntity);

    const chomboCounts = sessionState.getChombo();
    const toPaymentLog = ([dir, amount]: [string, number]) => ({
      from: +dir.split('<-')[1] || undefined,
      to: +dir.split('<-')[0] || undefined,
      amount,
    });
    const results = {
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
          direct: Object.entries(payments.direct)
            .map(toPaymentLog)
            .filter((i) => i.amount),
          riichi: Object.entries(payments.riichi)
            .map(toPaymentLog)
            .filter((i) => i.amount),
          honba: Object.entries(payments.honba)
            .map(toPaymentLog)
            .filter((i) => i.amount),
        },
        round: roundData,
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

    return results;
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
      .from('session_players')
      .join('session', (qb) =>
        qb
          .on('session_players.session_id', 'session.id')
          .andOnIn('session.event_id', [session.event.id])
          .andOnNotIn('session.status', [SessionStatus.SESSION_STATUS_CANCELLED])
      )
      .whereIn('session_players.player_id', session.intermediateResults?.playerIds ?? [])
      .orderBy('session_players.id', 'desc')
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
    const sessions = await this.repo.em.find(
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
        (await playerModel.isEventAdmin(sessions[0].event.id)) ||
        (await playerModel.isEventReferee(sessions[0].event.id))
      )
    ) {
      throw new Error("You don't have the necessary permissions to add extra time");
    }

    for (const session of sessions) {
      session.extraTime += addExtraTimePayload.extraTime;
      this.repo.em.persist(session);
    }

    await this.repo.em.flush();
    return { success: true };
  }

  async dropLastRound(payload: GamesDropLastRoundPayload) {
    const sessions = await this.findByRepresentationalHash([payload.sessionHash], ['event']);
    if (sessions.length === 0) {
      throw new Error('Session not found');
    }

    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !(
        (await playerModel.isEventAdmin(sessions[0].event.id)) ||
        (await playerModel.isEventReferee(sessions[0].event.id))
      )
    ) {
      throw new Error("You don't have the necessary permissions to drop last round");
    }

    if (sessions[0].status === SessionStatus.SESSION_STATUS_FINISHED) {
      throw new Error('Cannot drop last round for a finished session');
    }

    const savedSessionState = new SessionState(
      sessions[0].event.ruleset,
      sessions[0].intermediateResults?.playerIds ?? [],
      sessions[0].intermediateResults
    );

    for (const res of payload.intermediateResults) {
      if (res.score !== savedSessionState.getScores()[res.playerId]) {
        throw new Error("Can't cancel round: was it already cancelled by someone else?");
      }
    }

    const roundModel = this.getModel(RoundModel);
    const rounds = await roundModel.findBySessionIds([sessions[0].id]);

    if (rounds.length === 0) {
      throw new Error('No rounds to drop');
    }

    const lastRound = rounds.pop()!;
    sessions[0].intermediateResults = lastRound.lastSessionState;
    sessions[0].status = SessionStatus.SESSION_STATUS_INPROGRESS;
    this.repo.em.remove(lastRound.hands);
    this.repo.em.remove(lastRound);
    this.repo.em.persist(sessions[0]);

    await this.repo.em.flush();
    return { success: true };
  }

  async definalizeGame(hash: string) {
    const session = await this.findByRepresentationalHash([hash]);
    if (session.length === 0) {
      throw new Error('Session not found');
    }
    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !(
        (await playerModel.isEventAdmin(session[0].event.id)) ||
        (await playerModel.isEventReferee(session[0].event.id))
      )
    ) {
      throw new Error("You don't have the necessary permissions to definalize game");
    }

    if (!this.mayDefinalize(session[0])) {
      throw new Error('Session cannot be definalized');
    }

    const playerHistoryModel = this.getModel(PlayerHistoryModel);
    const sessionResultsModel = this.getModel(SessionResultsModel);
    const [playerResults, sessionResults] = await Promise.all([
      playerHistoryModel.findBySession(session[0].id),
      sessionResultsModel.findBySession([session[0].id]),
    ]);
    this.repo.em.remove(playerResults);
    this.repo.em.remove(sessionResults);

    session[0].status = SessionStatus.SESSION_STATUS_INPROGRESS;
    this.repo.em.persist(session[0]);

    const playerStatsModel = this.getModel(PlayerStatsModel);
    await playerStatsModel.scheduleRebuildPlayersStats(session[0].event.id);

    await this.repo.em.flush();
    return { success: true };
  }

  async forceFinishGame(hash: string) {
    const session = await this.findByRepresentationalHash([hash], ['event']);
    if (session.length === 0) {
      throw new Error('Session not found');
    }

    // Check if we have rights to update the event
    const playerModel = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !(
        (await playerModel.isEventAdmin(session[0].event.id)) ||
        (await playerModel.isEventReferee(session[0].event.id))
      )
    ) {
      throw new Error("You don't have the necessary permissions to force finish game");
    }

    const sessionState = new SessionState(
      session[0].event.ruleset,
      session[0].intermediateResults?.playerIds ?? [],
      session[0].intermediateResults
    );
    await this.finish(session[0].event, session[0], sessionState);
    sessionState.forceFinish();
    this.repo.em.persist(session[0]);
    await this.repo.em.flush();

    const achievementsModel = this.getModel(AchievementsModel);
    await achievementsModel.scheduleRebuildAchievements(session[0].event.id);

    const whoPlays = sessionState.state.playerIds;
    const eventRegModel = this.getModel(EventRegistrationModel);
    const replacements = await eventRegModel.getSubstitutionPlayers(session[0].event.id);
    const playerIds = whoPlays.map((id) => replacements[id] ?? id);

    this.repo.skirnir.messageClubSessionEnd(
      playerIds,
      session[0].event.id,
      sessionState.getScores()
    );

    return { success: true };
  }
}
