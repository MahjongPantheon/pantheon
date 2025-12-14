import { PersonEx, PlatformType, SessionStatus } from 'tsclients/proto/atoms.pb.js';
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
import { GamesGetSessionOverviewResponse } from 'tsclients/proto/mimir.pb.js';
import { EventModel } from './EventModel.js';

export class SessionModel extends Model {
  async findById(id: number) {
    return this.repo.db.em.findOne(SessionEntity, { id });
  }

  async findByReplayHashAndEvent(eventId: number, replayHash: string) {
    return this.repo.db.em.findOne(SessionEntity, {
      event: this.repo.db.em.getReference(EventEntity, eventId),
      replayHash,
    });
  }

  async findAllInProgress() {
    return this.repo.db.em.findAll(SessionEntity, {
      where: { status: SessionStatus.SESSION_STATUS_INPROGRESS },
    });
  }

  // TODO: memoize
  async findByRepresentationalHash(
    hashList: string[],
    populate?: Populate<SessionEntity, 'event'>
  ) {
    return this.repo.db.em.findAll(SessionEntity, {
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
    return this.repo.db.em.findAll(SessionEntity, {
      where: { status, event: this.repo.db.em.getReference(EventEntity, eventIds) },
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
    const query = this.repo.db.em
      .getKnex()
      .from('session')
      .leftJoin('session_player', 'session_player.session_id', 'session.id')
      .select('session_player.player_id', 'session_player.order')
      .where('session.event_id', '=', eventId)
      .orderBy('session.id', 'asc')
      .orderBy('session_player.order', 'asc');

    return this.repo.db.em.execute<{ player_id: number; order: number }[]>(query);
  }

  async findByPlayerAndEvent(
    playerId: number,
    eventId: number,
    withStatus: SessionStatus | '*' = '*',
    dateFrom?: string,
    dateTo?: string
  ) {
    return this.repo.db.em
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
    return this.repo.db.em
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
    return this.repo.db.em.count(SessionEntity, {
      event: this.repo.db.em.getReference(EventEntity, eventIdList),
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
      await this.repo.db.em.findAll(SessionPlayerEntity, {
        where: {
          session: this.repo.db.em.getReference(
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
              if (!acc2[item.sessionId]) {
                acc2[item.sessionId] = {};
              }
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
}
