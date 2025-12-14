import { EventEntity } from 'src/entities/Event.entity.js';
import { Model } from './Model.js';
import {
  EventsGetAllRegisteredPlayersPayload,
  EventsGetAllRegisteredPlayersResponse,
  EventsGetEventsByIdPayload,
  EventsGetEventsByIdResponse,
  EventsGetEventsPayload,
  EventsGetEventsResponse,
  EventsGetLastGamesPayload,
  EventsGetLastGamesResponse,
  EventsGetRatingTableResponse,
  EventsGetTimerStateResponse,
  PlayersGetCurrentSessionsPayload,
  PlayersGetMyEventsResponse,
} from 'tsclients/proto/mimir.pb.js';
import {
  EventType,
  Event,
  PlatformType,
  GenericEventPayload,
  GameConfig,
  TournamentGamesStatus,
  SessionStatus,
  RegisteredPlayer,
} from 'tsclients/proto/atoms.pb.js';
import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { PlayerHistoryEntity } from 'src/entities/PlayerHistory.entity.js';
import { SessionModel } from './SessionModel.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { PenaltyEntity } from 'src/entities/Penalty.entity.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { formatGameResult } from 'src/helpers/formatters.js';
import { SessionResultsModel } from './SessionResultsModel.js';
import { RoundModel } from './RoundModel.js';
import { PlayerModel } from './PlayerModel.js';
import { EventRegistrationModel } from './EventRegistrationModel.js';

export class EventModel extends Model {
  async findById(id: number[]) {
    return await this.repo.db.em.findAll(EventEntity, {
      where: {
        id,
      },
      populate: ['onlinePlatform', 'ruleset'],
    });
  }

  protected _formatEventList(
    events: EventEntity[],
    sessionCounts: Record<number, number>
  ): Event[] {
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      isRatingShown: !e.hideResults,
      tournamentStarted: !e.isOnline && !!e.syncStart && sessionCounts[e.id] > 0,
      type: e.isOnline
        ? EventType.EVENT_TYPE_ONLINE
        : e.syncStart
          ? EventType.EVENT_TYPE_TOURNAMENT
          : EventType.EVENT_TYPE_LOCAL,
      hasSeries: e.seriesLength > 0,
      achievementsShown: !e.hideAchievements,
      platformId: e.onlinePlatform ?? PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      finished: !!e.finished,
      isPrescripted: !!e.isPrescripted,
      isTeam: !!e.isTeam,
      isListed: !!e.isListed,
      minGamesCount: e.minGamesCount,
      withYakitori: e.ruleset.rules.withYakitori,
      withChips: e.ruleset.rules.chipsValue > 0,
    }));
  }

  protected async _getSessionCounts(eventIds: number[]): Promise<Record<number, number>> {
    const sessions = await this.repo.db.em.execute(
      this.repo.db.em
        .getKnex()
        .from('sessions')
        .select('id', 'event_id', 'count(*) as session_count')
        .where('event_id', 'in', eventIds)
        .groupBy('event_id')
    );

    return sessions.reduce(
      (acc, session) => {
        acc[session.event_id] = session.session_count;
        return acc;
      },
      {} as Record<number, number>
    );
  }

  async getEvents(
    eventsGetEventsPayload: EventsGetEventsPayload
  ): Promise<EventsGetEventsResponse> {
    const [data, total] = await this.repo.db.em.findAndCount(
      EventEntity,
      {
        ...(eventsGetEventsPayload.filter
          ? {
              title: {
                $ilike: `%${eventsGetEventsPayload.filter}%`,
              },
            }
          : {}),
        ...(eventsGetEventsPayload.filterUnlisted
          ? {
              is_listed: 1,
            }
          : {}),
      },
      {
        limit: Math.min(eventsGetEventsPayload.limit, 100),
        offset: eventsGetEventsPayload.offset,
        orderBy: { id: -1 },
      }
    );

    const sessionCounts = await this._getSessionCounts(data.map((e) => e.id));

    return {
      events: this._formatEventList(data, sessionCounts),
      total,
    };
  }

  async getEventsById(
    eventsGetEventsByIdPayload: EventsGetEventsByIdPayload
  ): Promise<EventsGetEventsByIdResponse> {
    const data = await this.repo.db.em.findAll(EventEntity, {
      where: {
        id: eventsGetEventsByIdPayload.ids,
      },
      orderBy: { id: -1 },
    });

    const sessionCounts = await this._getSessionCounts(data.map((e) => e.id));

    return {
      events: this._formatEventList(data, sessionCounts),
    };
  }

  async getMyEvents(personId: number): Promise<PlayersGetMyEventsResponse> {
    const regs = await this.repo.db.em.findAll(EventRegisteredPlayersEntity, {
      where: {
        playerId: personId,
      },
      fields: ['event'],
    });

    const events =
      regs.length === 0
        ? []
        : await this.repo.db.em.findAll(EventEntity, {
            where: {
              id: regs.map((r) => r.event.id),
              finished: 0,
            },
            fields: ['id', 'title', 'isOnline', 'description'],
          });
    return {
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description, // TODO md transform
        isOnline: !!e.isOnline,
      })),
    };
  }

  async getGameConfig(genericEventPayload: GenericEventPayload): Promise<GameConfig> {
    const data = await this.repo.db.em.findOne(
      EventEntity,
      {
        id: genericEventPayload.eventId,
      },
      {
        orderBy: {
          id: -1,
        },
      }
    );

    if (!data) {
      throw new Error('Event not found');
    }

    return {
      allowPlayerAppend: !!data.allowPlayerAppend,
      allowViewOtherTables: !!data.allowViewOtherTables,
      autoSeating: !!data.autoSeating,
      eventDescription: data.description,
      eventStatHost: data.statHost,
      eventTitle: data.title,
      gameDuration: data.gameDuration ?? 0,
      gamesStatus: data.gamesStatus ?? TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_UNSPECIFIED,
      hideAddReplayButton: !data.isOnline,
      hideResults: !!data.hideResults,
      isFinished: !!data.finished,
      isOnline: !!data.isOnline,
      isPrescripted: !!data.isPrescripted,
      isTeam: !!data.isTeam,
      lobbyId: data.lobbyId ?? 0,
      minGamesCount: data.minGamesCount,
      rulesetConfig: data.ruleset.rules,
      rulesetTitle: data.ruleset.title,
      seriesLength: data.seriesLength,
      sortByGames: !!data.sortByGames,
      syncEnd: !!data.syncEnd,
      syncStart: !!data.syncStart,
      timezone: data.timezone,
      usePenalty: !!data.usePenalty,
      useTimer: !!data.useTimer,
    };
  }

  async getRatingTable(
    eventIdList: number[],
    orderBy: string,
    order: 'asc' | 'desc',
    isAdmin: boolean,
    onlyMinGames: boolean,
    dateFrom: string | null,
    dateTo: string | null
  ): Promise<EventsGetRatingTableResponse> {
    const events = await this.repo.db.em.findAll(EventEntity, { where: { id: eventIdList } });
    const mainEvent = events.find((e) => e.id === eventIdList[0]);
    if (!mainEvent) {
      throw new Error('Main event not found');
    }

    const sessionModel = this.getModel(SessionModel);
    const playerHistoryModel = this.getModel(PlayerHistoryModel);

    const dataItems: PlayerHistoryEntity[] = isAdmin
      ? await sessionModel.getPrefinishedItems(mainEvent.ruleset, eventIdList)
      : await playerHistoryModel.getHistoryItems(
          mainEvent.ruleset,
          eventIdList,
          mainEvent.timezone,
          dateFrom,
          dateTo
        );
    const playerItems = (
      await this.repo.frey.GetPersonalInfo({ ids: dataItems.map((item) => item.playerId) })
    ).people;

    const regData = await this.repo.db.em.findAll(EventRegisteredPlayersEntity, {
      where: { event: mainEvent },
    });

    const penalties = await this.repo.db.em.findAll(PenaltyEntity, {
      where: { event: events },
    });

    const historyItems = playerHistoryModel.mergeData(
      playerHistoryModel.mergeSeveralEvents(dataItems, mainEvent.ruleset),
      playerItems,
      regData,
      penalties
    );
    const data = playerHistoryModel.sortItems(orderBy, playerItems, historyItems);

    if (order === 'desc') {
      data.reverse();
    }

    if (mainEvent.sortByGames) {
      data.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
    }

    if (onlyMinGames) {
      data.filter((r) => r.gamesPlayed >= mainEvent.minGamesCount);
    }

    return {
      list: data.map((item) => ({
        id: item.playerId,
        title: item.playerTitle,
        tenhouId: item.playerTenhouId,
        rating: item.rating,
        chips: item.chips ?? 0,
        winnerZone:
          item.rating - (item.penaltiesAmount ?? 0) >= mainEvent.ruleset.rules.startRating,
        avgPlace: item.avgPlace,
        avgScore: item.avgScore,
        gamesPlayed: item.gamesPlayed,
        teamName: item.playerTeamName,
        hasAvatar: item.playerHasAvatar,
        lastUpdate: item.playerLastUpdate,
        penaltiesAmount: item.penaltiesAmount,
        penaltiesCount: item.penaltiesCount,
      })),
    };
  }

  async getLastFinishedGames(
    eventList: EventEntity[],
    limit: number,
    offset: number,
    orderBy: keyof SessionEntity,
    order: 'asc' | 'desc'
  ): Promise<EventsGetLastGamesResponse> {
    const sessionModel = this.getModel(SessionModel);
    const roundModel = this.getModel(RoundModel);
    const sessionResultsModel = this.getModel(SessionResultsModel);

    const games = await sessionModel.findByEventAndStatus(
      eventList.map((event) => event.id),
      [SessionStatus.SESSION_STATUS_FINISHED],
      limit,
      offset,
      orderBy,
      order
    );

    const gamesCount = await sessionModel.getGamesCount(
      eventList.map((event) => event.id),
      SessionStatus.SESSION_STATUS_FINISHED
    );

    const sessionResults = await sessionResultsModel.findBySession(games.map((game) => game.id));

    const rounds = await roundModel.findBySessionIds(games.map((game) => game.id));

    const players = await sessionModel.getPlayersOfGames(games);

    return {
      games: games.map((g) =>
        formatGameResult(
          g,
          eventList[0].onlinePlatform ?? PlatformType.PLATFORM_TYPE_UNSPECIFIED,
          players.players.get(g.id) ?? [],
          sessionResults,
          rounds
        )
      ),
      totalGames: gamesCount,
    };
  }

  async getTimerState(eventId: number) {
    const event = await this.findById([eventId]);
    if (event.length === 0) {
      throw new Error('Event not found');
    }

    if (!event[0].useTimer) {
      throw new Error('Timer is not enabled for this event');
    }

    const timerState: EventsGetTimerStateResponse = {
      started: false,
      finished: false,
      timeRemaining: 0,
      waitingForTimer:
        event[0].gamesStatus === TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY,
      haveAutostart: event[0].nextGameStartTime > 0 && event[0].timeToStart > 0,
      autostartTimer: event[0].nextGameStartTime - Date.now() / 1000,
      // show seating for 10 mins after start
      hideSeatingAfter: (event[0].gameDuration! - 10) * 60,
    };
    if (!event[0].lastTimer) {
      timerState.started = false;
      timerState.finished = false;
      timerState.timeRemaining = 0;
    } else if (event[0].lastTimer + (event[0].gameDuration ?? 0) * 60 > Date.now() / 1000) {
      // game in progress
      timerState.started = true;
      timerState.finished = false;
      timerState.timeRemaining =
        event[0].lastTimer + (event[0].gameDuration ?? 0) * 60 - Date.now() / 1000;
    }
    return timerState;
  }

  async getTimerStateForSessions(
    eventId: number,
    sessions: SessionEntity[]
  ): Promise<Record<string, EventsGetTimerStateResponse>> {
    const event = await this.findById([eventId]);
    if (event.length === 0) {
      throw new Error('Event not found');
    }

    if (!event[0].useTimer) {
      return {};
    }

    const timerState: Record<string, EventsGetTimerStateResponse> = {};
    for (const session of sessions) {
      if (event[0].finished) {
        timerState[session.representationalHash!] = {
          started: false,
          finished: true,
          timeRemaining: 0,
          waitingForTimer: false,
          haveAutostart: false,
          autostartTimer: 0,
          hideSeatingAfter: 0,
        };
      } else {
        timerState[session.representationalHash!] = {
          started: false,
          finished: false,
          timeRemaining: 0,
          waitingForTimer:
            event[0].gamesStatus === TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY,
          haveAutostart: event[0].nextGameStartTime > 0 && event[0].timeToStart > 0,
          autostartTimer: event[0].nextGameStartTime - Date.now() / 1000,
          // show seating for 10 mins after start
          hideSeatingAfter: (event[0].gameDuration! - 10) * 60,
        };
        if (!event[0].lastTimer) {
          timerState[session.representationalHash!].started = false;
          timerState[session.representationalHash!].finished = false;
          timerState[session.representationalHash!].timeRemaining = 0;
        } else if (
          event[0].lastTimer + (event[0].gameDuration ?? 0) * 60 + session.extraTime >
          Date.now() / 1000
        ) {
          // game in progress
          timerState[session.representationalHash!].started = true;
          timerState[session.representationalHash!].finished = false;
          timerState[session.representationalHash!].timeRemaining =
            event[0].lastTimer +
            (event[0].gameDuration ?? 0) * 60 +
            session.extraTime -
            Date.now() / 1000;
        }
      }
    }
    return timerState;
  }

  async getLastGames(eventsGetLastGamesPayload: EventsGetLastGamesPayload) {
    if (eventsGetLastGamesPayload.eventIdList.length === 0) {
      throw new Error('Event id list is empty');
    }

    const events = await this.findById(eventsGetLastGamesPayload.eventIdList);

    if (events.length !== eventsGetLastGamesPayload.eventIdList.length) {
      throw new Error('Some of events were not found in database');
    }

    if (
      eventsGetLastGamesPayload.orderBy &&
      !['id', 'endDate'].includes(eventsGetLastGamesPayload.orderBy)
    ) {
      throw new Error('Invalid orderBy parameter; Valid options: id, endDate');
    }

    if (
      eventsGetLastGamesPayload.order &&
      !['asc', 'desc'].includes(eventsGetLastGamesPayload.order)
    ) {
      throw new Error('Invalid order parameter; Valid options: asc, desc');
    }

    return this.getLastFinishedGames(
      events,
      eventsGetLastGamesPayload.limit,
      eventsGetLastGamesPayload.offset,
      eventsGetLastGamesPayload.orderBy as 'id' | 'endDate',
      eventsGetLastGamesPayload.order as 'asc' | 'desc'
    );
  }

  async getCurrentGames(playersGetCurrentSessionsPayload: PlayersGetCurrentSessionsPayload) {
    const event = await this.findById([playersGetCurrentSessionsPayload.eventId]);

    if (event.length === 0) {
      throw new Error('Event not found');
    }

    const sessionModel = this.getModel(SessionModel);
    const sessions = await sessionModel.findByPlayerAndEvent(
      playersGetCurrentSessionsPayload.playerId,
      playersGetCurrentSessionsPayload.eventId,
      SessionStatus.SESSION_STATUS_INPROGRESS
    );

    const timerState = await this.getTimerStateForSessions(
      playersGetCurrentSessionsPayload.eventId,
      sessions
    );

    const { players, replaceMap } = await sessionModel.getPlayersOfGames(sessions, true);
    const playerModel = this.getModel(PlayerModel);

    return {
      sessions: sessions.map((s) => ({
        ...s,
        status: s.status!,
        sessionHash: s.representationalHash!,
        timerState: timerState[s.representationalHash!],
        players: playerModel.substituteReplacements(players.get(s.id)!, replaceMap),
      })),
    };
  }

  async getAllRegisteredPlayers(
    eventsGetAllRegisteredPlayersPayload: EventsGetAllRegisteredPlayersPayload
  ): Promise<EventsGetAllRegisteredPlayersResponse> {
    if (eventsGetAllRegisteredPlayersPayload.eventIds.length === 0) {
      throw new Error('Event IDs parameter is required');
    }
    const events = await this.findById(eventsGetAllRegisteredPlayersPayload.eventIds);
    if (events.length !== eventsGetAllRegisteredPlayersPayload.eventIds.length) {
      throw new Error('One or more events not found');
    }
    const needLocalIds = events.length === 1 && events[0].isPrescripted;
    const playerModel = this.getModel(PlayerModel);
    const { players, replaceMap } = await playerModel.findPlayersForEvents(
      eventsGetAllRegisteredPlayersPayload.eventIds
    );
    const eventRegModel = this.getModel(EventRegistrationModel);
    const ignoredPlayers = await eventRegModel.findIgnoredPlayersIdsByEvent(
      eventsGetAllRegisteredPlayersPayload.eventIds
    );
    let localMap: Map<number, number> = new Map();
    let teamNames: Map<number, string> = new Map();
    if (needLocalIds) {
      localMap = new Map(
        (await eventRegModel.findLocalIdsMapByEvent(events[0].id))
          .entries()
          .map(([key, value]) => [value, key])
      );
    }
    if (events[0].isTeam) {
      teamNames = await eventRegModel.findTeamNameMapByEvent(events[0].id);
    }
    return {
      players: players.map((player) => {
        const localId = localMap.get(player.id);
        const teamName = teamNames.get(player.id);
        const data: RegisteredPlayer = {
          id: player.id,
          title: player.title,
          localId,
          teamName,
          tenhouId: player.tenhouId,
          majsoulId: player.msAccountId,
          majsoulNickname: player.msNickname,
          hasAvatar: player.hasAvatar,
          lastUpdate: player.lastUpdate,
          ignoreSeating: ignoredPlayers.includes(player.id),
          replacedBy: replaceMap.has(player.id)
            ? {
                id: replaceMap.get(player.id)!.id,
                title: replaceMap.get(player.id)!.title,
                hasAvatar: replaceMap.get(player.id)!.hasAvatar,
                lastUpdate: replaceMap.get(player.id)!.lastUpdate,
              }
            : null,
        };
        return data;
      }),
    };
  }
}
