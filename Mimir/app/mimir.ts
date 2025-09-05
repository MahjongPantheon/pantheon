import {
  GenericEventPayload,
  GameConfig,
  GenericSessionPayload,
  GenericSuccessResponse,
  EventData,
  EventType,
  PlatformType,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb';
import { Context } from './context';
import {
  AddExtraTimePayload,
  CallRefereePayload,
  CancelPenaltyPayload,
  ChomboResponse,
  ClearStatCachePayload,
  EventsGetAchievementsPayload,
  EventsGetAchievementsResponse,
  EventsGetAllRegisteredPlayersPayload,
  EventsGetAllRegisteredPlayersResponse,
  EventsGetCurrentSeatingResponse,
  EventsGetEventForEditPayload,
  EventsGetEventForEditResponse,
  EventsGetEventsByIdPayload,
  EventsGetEventsByIdResponse,
  EventsGetEventsPayload,
  EventsGetEventsResponse,
  EventsGetGameResponse,
  EventsGetGamesSeriesResponse,
  EventsGetLastGamesPayload,
  EventsGetLastGamesResponse,
  EventsGetPrescriptedEventConfigResponse,
  EventsGetRatingTablePayload,
  EventsGetRatingTableResponse,
  EventsGetRulesetsResponse,
  EventsGetStartingTimerResponse,
  EventsGetTablesStatePayload,
  EventsGetTablesStateResponse,
  EventsGetTimerStateResponse,
  EventsRegisterPlayerPayload,
  EventsUnregisterPlayerPayload,
  EventsUpdateEventPayload,
  EventsUpdatePlayerReplacementPayload,
  EventsUpdatePlayerSeatingFlagPayload,
  EventsUpdatePlayersLocalIdsPayload,
  EventsUpdatePlayersTeamsPayload,
  EventsUpdatePrescriptedEventConfigPayload,
  GamesAddOnlineReplayPayload,
  GamesAddOnlineReplayResponse,
  GamesAddPenaltyGamePayload,
  GamesAddPenaltyPayload,
  GamesAddRoundPayload,
  GamesAddRoundResponse,
  GamesDropLastRoundPayload,
  GamesGetSessionOverviewResponse,
  GamesPreviewRoundPayload,
  GamesPreviewRoundResponse,
  GamesStartGamePayload,
  GetCurrentStatePayload,
  GetCurrentStateResponse,
  Mimir,
  PenaltiesResponse,
  PlayersGetAllRoundsResponse,
  PlayersGetCurrentSessionsPayload,
  PlayersGetCurrentSessionsResponse,
  PlayersGetLastResultsPayload,
  PlayersGetLastResultsResponse,
  PlayersGetLastRoundByHashResponse,
  PlayersGetLastRoundPayload,
  PlayersGetLastRoundResponse,
  PlayersGetMyEventsPayload,
  PlayersGetMyEventsResponse,
  PlayersGetPlayerPayload,
  PlayersGetPlayerResponse,
  PlayersGetPlayerStatsPayload,
  PlayersGetPlayerStatsResponse,
  SeatingGenerateSwissSeatingPayload,
  SeatingGenerateSwissSeatingResponse,
  SeatingGetNextPrescriptedSeatingResponse,
  SeatingMakeIntervalSeatingPayload,
  SeatingMakePrescriptedSeatingPayload,
  SeatingMakeShuffledSeatingPayload,
  TypedGamesAddOnlineReplayPayload,
} from 'tsclients/proto/mimir.pb';
import { createRuleset } from './rulesets/ruleset';

export const mimirServer: Mimir<Context> = {
  GetRulesets: function (): EventsGetRulesetsResponse {
    return [
      createRuleset('ema'),
      createRuleset('jpmlA'),
      createRuleset('wrc'),
      createRuleset('tenhounet'),
      createRuleset('rrc'),
    ].reduce(
      (acc, r) => {
        acc.rulesets.push(r.rules);
        acc.rulesetTitles.push(r.title);
        acc.rulesetIds.push(r.id);
        return acc;
      },
      { rulesets: [], rulesetIds: [], rulesetTitles: [] } as EventsGetRulesetsResponse
    );
  },
  GetEvents: async function (
    eventsGetEventsPayload: EventsGetEventsPayload,
    context: Context
  ): Promise<EventsGetEventsResponse> {
    let qb = context.db
      .selectFrom('event')
      .leftJoin('session', 'session.event_id', 'event.id')
      .select([
        'event.id',
        'event.title',
        'event.description',
        'event.is_online',
        'event.sync_start',
        'event.finished',
        'event.is_prescripted',
        'event.is_team',
        'event.is_listed',
        'event.hide_results',
        'event.hide_achievements',
        'event.min_games_count',
        'event.series_length',
        'event.ruleset_config',
        'event.online_platform',
        ({ fn }) => fn.count('session.id').as('sessioncnt'),
      ]);
    let qbcount = context.db.selectFrom('event').select(({ fn }) => fn.count('id').as('count'));
    if (eventsGetEventsPayload.filter) {
      qb = qb.where('title', 'ilike', `%${eventsGetEventsPayload.filter}%`);
      qbcount = qbcount.where('title', 'ilike', `%${eventsGetEventsPayload.filter}%`);
    }
    if (eventsGetEventsPayload.filterUnlisted) {
      qb = qb.where('is_listed', '=', 1);
      qbcount = qbcount.where('is_listed', '=', 1);
    }
    qb = qb
      .groupBy('event.id')
      .orderBy('id', 'desc')
      .limit(eventsGetEventsPayload.limit)
      .offset(eventsGetEventsPayload.offset);

    const counts = await qbcount.execute();
    const data = await qb.execute();
    return {
      events: data.map((e) => {
        const ruleset = createRuleset('custom', e.ruleset_config);
        return {
          id: e.id,
          title: e.title,
          description: e.description,
          isRatingShown: !e.hide_results,
          tournamentStarted: !e.is_online && !!e.sync_start && Number(e.sessioncnt) > 0,
          type: e.is_online
            ? EventType.EVENT_TYPE_ONLINE
            : e.sync_start
              ? EventType.EVENT_TYPE_TOURNAMENT
              : EventType.EVENT_TYPE_LOCAL,
          hasSeries: e.series_length > 0,
          achievementsShown: !e.hide_achievements,
          platformId:
            e.online_platform === 'TENHOU'
              ? PlatformType.PLATFORM_TYPE_TENHOUNET
              : e.online_platform === 'MAJSOUL'
                ? PlatformType.PLATFORM_TYPE_MAHJONGSOUL
                : PlatformType.PLATFORM_TYPE_UNSPECIFIED,
          finished: !!e.finished,
          isPrescripted: !!e.is_prescripted,
          isTeam: !!e.is_team,
          isListed: !!e.is_listed,
          minGamesCount: e.min_games_count,
          sessions: Number(e.sessioncnt),
          withYakitori: ruleset.rules.withYakitori,
          withChips: ruleset.rules.chipsValue > 0,
        };
      }),
      total: Number(counts[0].count),
    };
  },
  GetEventsById: async function (
    eventsGetEventsByIdPayload: EventsGetEventsByIdPayload,
    context: Context
  ): Promise<EventsGetEventsByIdResponse> {
    const data = await context.db
      .selectFrom('event')
      .leftJoin('session', 'session.event_id', 'event.id')
      .select([
        'event.id',
        'event.title',
        'event.description',
        'event.is_online',
        'event.sync_start',
        'event.finished',
        'event.is_prescripted',
        'event.is_team',
        'event.is_listed',
        'event.hide_results',
        'event.hide_achievements',
        'event.min_games_count',
        'event.series_length',
        'event.ruleset_config',
        'event.online_platform',
        ({ fn }) => fn.count('session.id').as('sessioncnt'),
      ])
      .groupBy('event.id')
      .orderBy('event.id', 'desc')
      .where('event.id', 'in', eventsGetEventsByIdPayload.ids)
      .execute();

    return {
      events: data.map((e) => {
        const ruleset = createRuleset('custom', e.ruleset_config);
        return {
          id: e.id,
          title: e.title,
          description: e.description,
          isRatingShown: !e.hide_results,
          tournamentStarted: !e.is_online && !!e.sync_start && Number(e.sessioncnt) > 0,
          type: e.is_online
            ? EventType.EVENT_TYPE_ONLINE
            : e.sync_start
              ? EventType.EVENT_TYPE_TOURNAMENT
              : EventType.EVENT_TYPE_LOCAL,
          hasSeries: e.series_length > 0,
          achievementsShown: !e.hide_achievements,
          platformId:
            e.online_platform === 'TENHOU'
              ? PlatformType.PLATFORM_TYPE_TENHOUNET
              : e.online_platform === 'MAJSOUL'
                ? PlatformType.PLATFORM_TYPE_MAHJONGSOUL
                : PlatformType.PLATFORM_TYPE_UNSPECIFIED,
          finished: !!e.finished,
          isPrescripted: !!e.is_prescripted,
          isTeam: !!e.is_team,
          isListed: !!e.is_listed,
          minGamesCount: e.min_games_count,
          sessions: Number(e.sessioncnt),
          withYakitori: ruleset.rules.withYakitori,
          withChips: ruleset.rules.chipsValue > 0,
        };
      }),
    };
  },
  GetMyEvents: async function (
    _playersGetMyEventsPayload: PlayersGetMyEventsPayload,
    context: Context
  ): Promise<PlayersGetMyEventsResponse> {
    const regs = await context.db
      .selectFrom('event_registered_players')
      .select(['event_id'])
      .where('event_registered_players.player_id', '=', context.personId)
      .execute();
    const events =
      regs.length === 0
        ? []
        : await context.db
            .selectFrom('event')
            .where(
              'id',
              'in',
              regs.map((r) => r.event_id)
            )
            .where('finished', '=', 0)
            .select(['id', 'title', 'is_online', 'description'])
            .execute();
    return {
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description, // TODO md transform
        isOnline: !!e.is_online,
      })),
    };
  },
  GetGameConfig: async function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GameConfig> {
    const data = await context.db
      .selectFrom('event')
      .select([
        'id',
        'title',
        'description',
        'stat_host',
        'allow_player_append',
        'allow_view_other_tables',
        'auto_seating',
        'game_duration',
        'games_status',
        'hide_results',
        'finished',
        'is_online',
        'is_prescripted',
        'is_team',
        'lobby_id',
        'min_games_count',
        'series_length',
        'sort_by_games',
        'sync_start',
        'sync_end',
        'timezone',
        'use_penalty',
        'use_timer',
        'ruleset_config',
      ])
      .orderBy('event.id', 'desc')
      .where('event.id', '=', genericEventPayload.eventId)
      .execute();

    const ruleset = createRuleset('custom', data[0].ruleset_config);
    return {
      allowPlayerAppend: !!data[0].allow_player_append,
      allowViewOtherTables: !!data[0].allow_view_other_tables,
      autoSeating: !!data[0].auto_seating,
      eventDescription: data[0].description,
      eventStatHost: data[0].stat_host,
      eventTitle: data[0].title,
      gameDuration: data[0].game_duration ?? 0,
      gamesStatus:
        data[0].games_status === 'seating_ready'
          ? TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY
          : data[0].games_status === 'started'
            ? TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED
            : TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_UNSPECIFIED,
      hideAddReplayButton: !data[0].is_online,
      hideResults: !!data[0].hide_results,
      isFinished: !!data[0].finished,
      isOnline: !!data[0].is_online,
      isPrescripted: !!data[0].is_prescripted,
      isTeam: !!data[0].is_team,
      lobbyId: data[0].lobby_id ?? 0,
      minGamesCount: data[0].min_games_count,
      rulesetConfig: ruleset.rules,
      rulesetTitle: ruleset.title,
      seriesLength: data[0].series_length,
      sortByGames: !!data[0].sort_by_games,
      syncEnd: !!data[0].sync_end,
      syncStart: !!data[0].sync_start,
      timezone: data[0].timezone,
      usePenalty: !!data[0].use_penalty,
      useTimer: !!data[0].use_timer,
    };
  },
  GetRatingTable: async function (
    eventsGetRatingTablePayload: EventsGetRatingTablePayload,
    context: Context
  ): Promise<EventsGetRatingTableResponse> {
    const isAdmin: boolean =
      eventsGetRatingTablePayload.eventIdList.length === 1 &&
      isEventAdmin(eventsGetRatingTablePayload.eventIdList[0]);
  },
  GetLastGames: function (
    eventsGetLastGamesPayload: EventsGetLastGamesPayload,
    context: Context
  ): Promise<EventsGetLastGamesResponse> | EventsGetLastGamesResponse {
    throw new Error('Function not implemented.');
  },
  GetGame: function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<EventsGetGameResponse> | EventsGetGameResponse {
    throw new Error('Function not implemented.');
  },
  GetGamesSeries: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<EventsGetGamesSeriesResponse> | EventsGetGamesSeriesResponse {
    throw new Error('Function not implemented.');
  },
  GetCurrentSessions: function (
    playersGetCurrentSessionsPayload: PlayersGetCurrentSessionsPayload,
    context: Context
  ): Promise<PlayersGetCurrentSessionsResponse> | PlayersGetCurrentSessionsResponse {
    throw new Error('Function not implemented.');
  },
  GetAllRegisteredPlayers: function (
    eventsGetAllRegisteredPlayersPayload: EventsGetAllRegisteredPlayersPayload,
    context: Context
  ): Promise<EventsGetAllRegisteredPlayersResponse> | EventsGetAllRegisteredPlayersResponse {
    throw new Error('Function not implemented.');
  },
  GetTimerState: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<EventsGetTimerStateResponse> | EventsGetTimerStateResponse {
    throw new Error('Function not implemented.');
  },
  GetSessionOverview: function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<GamesGetSessionOverviewResponse> | GamesGetSessionOverviewResponse {
    throw new Error('Function not implemented.');
  },
  GetPlayerStats: function (
    playersGetPlayerStatsPayload: PlayersGetPlayerStatsPayload,
    context: Context
  ): Promise<PlayersGetPlayerStatsResponse> | PlayersGetPlayerStatsResponse {
    throw new Error('Function not implemented.');
  },
  AddRound: function (
    gamesAddRoundPayload: GamesAddRoundPayload,
    context: Context
  ): Promise<GamesAddRoundResponse> | GamesAddRoundResponse {
    throw new Error('Function not implemented.');
  },
  PreviewRound: function (
    gamesPreviewRoundPayload: GamesPreviewRoundPayload,
    context: Context
  ): Promise<GamesPreviewRoundResponse> | GamesPreviewRoundResponse {
    throw new Error('Function not implemented.');
  },
  AddOnlineReplay: function (
    gamesAddOnlineReplayPayload: GamesAddOnlineReplayPayload,
    context: Context
  ): Promise<GamesAddOnlineReplayResponse> | GamesAddOnlineReplayResponse {
    throw new Error('Function not implemented.');
  },
  GetLastResults: function (
    playersGetLastResultsPayload: PlayersGetLastResultsPayload,
    context: Context
  ): Promise<PlayersGetLastResultsResponse> | PlayersGetLastResultsResponse {
    throw new Error('Function not implemented.');
  },
  GetLastRound: function (
    playersGetLastRoundPayload: PlayersGetLastRoundPayload,
    context: Context
  ): Promise<PlayersGetLastRoundResponse> | PlayersGetLastRoundResponse {
    throw new Error('Function not implemented.');
  },
  GetAllRounds: function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<PlayersGetAllRoundsResponse> | PlayersGetAllRoundsResponse {
    throw new Error('Function not implemented.');
  },
  GetLastRoundByHash: function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<PlayersGetLastRoundByHashResponse> | PlayersGetLastRoundByHashResponse {
    throw new Error('Function not implemented.');
  },
  GetEventForEdit: function (
    eventsGetEventForEditPayload: EventsGetEventForEditPayload,
    context: Context
  ): Promise<EventsGetEventForEditResponse> | EventsGetEventForEditResponse {
    throw new Error('Function not implemented.');
  },
  RebuildScoring: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  CreateEvent: function (
    eventData: EventData,
    context: Context
  ): Promise<GenericEventPayload> | GenericEventPayload {
    throw new Error('Function not implemented.');
  },
  UpdateEvent: function (
    eventsUpdateEventPayload: EventsUpdateEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  FinishEvent: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  ToggleListed: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  GetTablesState: function (
    eventsGetTablesStatePayload: EventsGetTablesStatePayload,
    context: Context
  ): Promise<EventsGetTablesStateResponse> | EventsGetTablesStateResponse {
    throw new Error('Function not implemented.');
  },
  StartTimer: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  RegisterPlayer: function (
    eventsRegisterPlayerPayload: EventsRegisterPlayerPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  UnregisterPlayer: function (
    eventsUnregisterPlayerPayload: EventsUnregisterPlayerPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  UpdatePlayerSeatingFlag: function (
    eventsUpdatePlayerSeatingFlagPayload: EventsUpdatePlayerSeatingFlagPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  GetAchievements: function (
    eventsGetAchievementsPayload: EventsGetAchievementsPayload,
    context: Context
  ): Promise<EventsGetAchievementsResponse> | EventsGetAchievementsResponse {
    throw new Error('Function not implemented.');
  },
  ToggleHideResults: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  ToggleHideAchievements: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  UpdatePlayersLocalIds: function (
    eventsUpdatePlayersLocalIdsPayload: EventsUpdatePlayersLocalIdsPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  UpdatePlayerReplacement: function (
    eventsUpdatePlayerReplacementPayload: EventsUpdatePlayerReplacementPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  UpdatePlayersTeams: function (
    eventsUpdatePlayersTeamsPayload: EventsUpdatePlayersTeamsPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  StartGame: function (
    gamesStartGamePayload: GamesStartGamePayload,
    context: Context
  ): Promise<GenericSessionPayload> | GenericSessionPayload {
    throw new Error('Function not implemented.');
  },
  EndGame: function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  CancelGame: function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  FinalizeSession: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  DropLastRound: function (
    gamesDropLastRoundPayload: GamesDropLastRoundPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  DefinalizeGame: function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  AddPenalty: function (
    gamesAddPenaltyPayload: GamesAddPenaltyPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  AddPenaltyGame: function (
    gamesAddPenaltyGamePayload: GamesAddPenaltyGamePayload,
    context: Context
  ): Promise<GenericSessionPayload> | GenericSessionPayload {
    throw new Error('Function not implemented.');
  },
  GetPlayer: function (
    playersGetPlayerPayload: PlayersGetPlayerPayload,
    context: Context
  ): Promise<PlayersGetPlayerResponse> | PlayersGetPlayerResponse {
    throw new Error('Function not implemented.');
  },
  GetCurrentSeating: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<EventsGetCurrentSeatingResponse> | EventsGetCurrentSeatingResponse {
    throw new Error('Function not implemented.');
  },
  MakeShuffledSeating: function (
    seatingMakeShuffledSeatingPayload: SeatingMakeShuffledSeatingPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  MakeSwissSeating: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  ResetSeating: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  GenerateSwissSeating: function (
    seatingGenerateSwissSeatingPayload: SeatingGenerateSwissSeatingPayload,
    context: Context
  ): Promise<SeatingGenerateSwissSeatingResponse> | SeatingGenerateSwissSeatingResponse {
    throw new Error('Function not implemented.');
  },
  MakeIntervalSeating: function (
    seatingMakeIntervalSeatingPayload: SeatingMakeIntervalSeatingPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  MakePrescriptedSeating: function (
    seatingMakePrescriptedSeatingPayload: SeatingMakePrescriptedSeatingPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  GetNextPrescriptedSeating: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<SeatingGetNextPrescriptedSeatingResponse> | SeatingGetNextPrescriptedSeatingResponse {
    throw new Error('Function not implemented.');
  },
  GetPrescriptedEventConfig: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<EventsGetPrescriptedEventConfigResponse> | EventsGetPrescriptedEventConfigResponse {
    throw new Error('Function not implemented.');
  },
  UpdatePrescriptedEventConfig: function (
    eventsUpdatePrescriptedEventConfigPayload: EventsUpdatePrescriptedEventConfigPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  InitStartingTimer: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  GetStartingTimer: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<EventsGetStartingTimerResponse> | EventsGetStartingTimerResponse {
    throw new Error('Function not implemented.');
  },
  ClearStatCache: function (
    clearStatCachePayload: ClearStatCachePayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  ForceFinishGame: function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  AddTypedOnlineReplay: function (
    typedGamesAddOnlineReplayPayload: TypedGamesAddOnlineReplayPayload,
    context: Context
  ): Promise<GamesAddOnlineReplayResponse> | GamesAddOnlineReplayResponse {
    throw new Error('Function not implemented.');
  },
  NotifyPlayersSessionStartsSoon: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  CallReferee: function (
    callRefereePayload: CallRefereePayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  RecalcAchievements: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  RecalcPlayerStats: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  ListPenalties: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<PenaltiesResponse> | PenaltiesResponse {
    throw new Error('Function not implemented.');
  },
  CancelPenalty: function (
    cancelPenaltyPayload: CancelPenaltyPayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  AddExtraTime: function (
    addExtraTimePayload: AddExtraTimePayload,
    context: Context
  ): Promise<GenericSuccessResponse> | GenericSuccessResponse {
    throw new Error('Function not implemented.');
  },
  ListMyPenalties: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<PenaltiesResponse> | PenaltiesResponse {
    throw new Error('Function not implemented.');
  },
  ListChombo: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<ChomboResponse> | ChomboResponse {
    throw new Error('Function not implemented.');
  },
  GetCurrentStateForPlayer: function (
    getCurrentStatePayload: GetCurrentStatePayload,
    context: Context
  ): Promise<GetCurrentStateResponse> | GetCurrentStateResponse {
    throw new Error('Function not implemented.');
  },
};
