import { EventEntity } from 'src/entities/Event.entity.js';
import { Model } from './Model.js';
import {
  EventsGetEventsByIdPayload,
  EventsGetEventsByIdResponse,
  EventsGetEventsPayload,
  EventsGetEventsResponse,
  EventsGetRatingTableResponse,
  PlayersGetMyEventsResponse,
} from 'tsclients/proto/mimir.pb.js';
import {
  EventType,
  Event,
  PlatformType,
  GenericEventPayload,
  GameConfig,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb.js';
import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { PlayerHistoryEntity } from 'src/entities/PlayerHistory.entity.js';
import { SessionModel } from './SessionModel.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { PenaltyEntity } from 'src/entities/Penalty.entity.js';

export class EventModel extends Model {
  async findById(id: number) {
    return await this.repo.db.em.findOne(
      EventEntity,
      {
        id,
      },
      { fields: ['onlinePlatform', 'ruleset'] }
    );
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
      gamesStatus:
        data.gamesStatus === 'seating_ready'
          ? TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY
          : data.gamesStatus === 'started'
            ? TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED
            : TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_UNSPECIFIED,
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
}
