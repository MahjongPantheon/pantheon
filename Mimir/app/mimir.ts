import {
  GenericEventPayload,
  GameConfig,
  GenericSessionPayload,
  GenericSuccessResponse,
  EventData,
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
  EventsGetRulesetsPayload,
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

export const mimirClient: Mimir<Context> = {
  GetRulesets: function (
    eventsGetRulesetsPayload: EventsGetRulesetsPayload,
    context: Context
  ): Promise<EventsGetRulesetsResponse> | EventsGetRulesetsResponse {
    throw new Error('Function not implemented.');
  },
  GetEvents: function (
    eventsGetEventsPayload: EventsGetEventsPayload,
    context: Context
  ): Promise<EventsGetEventsResponse> | EventsGetEventsResponse {
    throw new Error('Function not implemented.');
  },
  GetEventsById: function (
    eventsGetEventsByIdPayload: EventsGetEventsByIdPayload,
    context: Context
  ): Promise<EventsGetEventsByIdResponse> | EventsGetEventsByIdResponse {
    throw new Error('Function not implemented.');
  },
  GetMyEvents: function (
    playersGetMyEventsPayload: PlayersGetMyEventsPayload,
    context: Context
  ): Promise<PlayersGetMyEventsResponse> | PlayersGetMyEventsResponse {
    throw new Error('Function not implemented.');
  },
  GetGameConfig: function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GameConfig> | GameConfig {
    throw new Error('Function not implemented.');
  },
  GetRatingTable: function (
    eventsGetRatingTablePayload: EventsGetRatingTablePayload,
    context: Context
  ): Promise<EventsGetRatingTableResponse> | EventsGetRatingTableResponse {
    throw new Error('Function not implemented.');
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
