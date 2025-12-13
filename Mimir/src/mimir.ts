import {
  GenericEventPayload,
  GameConfig,
  GenericSessionPayload,
  GenericSuccessResponse,
  EventData,
  SessionStatus,
} from 'tsclients/proto/atoms.pb.js';
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
} from 'tsclients/proto/mimir.pb.js';
import { RulesetEntity } from './entities/Ruleset.entity.js';
import { Context } from './context.js';
import { EventModel } from './models/EventModel.js';
import { Model } from './models/Model.js';
import { SessionModel } from './models/SessionModel.js';
import { PlayerModel } from './models/PlayerModel.js';
import { EventGameSeriesModel } from './models/EventGameSeriesModel.js';

export const mimirServer: Mimir<Context> = {
  GetRulesets: function (): EventsGetRulesetsResponse {
    return [
      RulesetEntity.createRuleset('ema'),
      RulesetEntity.createRuleset('jpmlA'),
      RulesetEntity.createRuleset('wrc'),
      RulesetEntity.createRuleset('tenhounet'),
      RulesetEntity.createRuleset('rrc'),
    ].reduce(
      (acc, r) => {
        acc.rulesets.push(r.rules);
        acc.rulesetTitles.push(r.title);
        acc.rulesetIds.push(r.baseRuleset);
        return acc;
      },
      { rulesets: [], rulesetIds: [], rulesetTitles: [] } as EventsGetRulesetsResponse
    );
  },

  GetEvents: async function (
    eventsGetEventsPayload: EventsGetEventsPayload,
    context: Context
  ): Promise<EventsGetEventsResponse> {
    const model = Model.getModel(context.repository, EventModel);
    return model.getEvents(eventsGetEventsPayload);
  },

  GetEventsById: async function (
    eventsGetEventsByIdPayload: EventsGetEventsByIdPayload,
    context: Context
  ): Promise<EventsGetEventsByIdResponse> {
    const model = Model.getModel(context.repository, EventModel);
    return model.getEventsById(eventsGetEventsByIdPayload);
  },

  GetMyEvents: async function (
    _playersGetMyEventsPayload: PlayersGetMyEventsPayload,
    context: Context
  ): Promise<PlayersGetMyEventsResponse> {
    if (!context.repository.meta.personId) {
      throw new Error('Not logged in');
    }
    const model = Model.getModel(context.repository, EventModel);
    return model.getMyEvents(context.repository.meta.personId);
  },

  GetGameConfig: async function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<GameConfig> {
    const model = Model.getModel(context.repository, EventModel);
    return model.getGameConfig(genericEventPayload);
  },

  GetRatingTable: async function (
    eventsGetRatingTablePayload: EventsGetRatingTablePayload,
    context: Context
  ): Promise<EventsGetRatingTableResponse> {
    const playerModel = Model.getModel(context.repository, PlayerModel);
    const isAdmin: boolean =
      eventsGetRatingTablePayload.eventIdList.length === 1 &&
      (await playerModel.isEventAdmin(eventsGetRatingTablePayload.eventIdList[0]));
    const model = Model.getModel(context.repository, EventModel);
    return model.getRatingTable(
      eventsGetRatingTablePayload.eventIdList,
      eventsGetRatingTablePayload.orderBy,
      eventsGetRatingTablePayload.order === 'asc' ? 'asc' : 'desc',
      isAdmin,
      !!eventsGetRatingTablePayload.onlyMinGames,
      eventsGetRatingTablePayload.dateFrom ?? null,
      eventsGetRatingTablePayload.dateTo ?? null
    );
  },
  GetLastGames: async function (
    eventsGetLastGamesPayload: EventsGetLastGamesPayload,
    context: Context
  ): Promise<EventsGetLastGamesResponse> {
    if (eventsGetLastGamesPayload.eventIdList.length === 0) {
      throw new Error('Event id list is empty');
    }

    const model = Model.getModel(context.repository, EventModel);
    const events = await model.findById(eventsGetLastGamesPayload.eventIdList);

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

    return model.getLastFinishedGames(
      events,
      eventsGetLastGamesPayload.limit,
      eventsGetLastGamesPayload.offset,
      eventsGetLastGamesPayload.orderBy as 'id' | 'endDate',
      eventsGetLastGamesPayload.order as 'asc' | 'desc'
    );
  },
  GetGame: async function (
    genericSessionPayload: GenericSessionPayload,
    context: Context
  ): Promise<EventsGetGameResponse> {
    const sessionModel = Model.getModel(context.repository, SessionModel);
    return sessionModel.getFinishedGame(genericSessionPayload.sessionHash);
  },
  GetGamesSeries: async function (
    genericEventPayload: GenericEventPayload,
    context: Context
  ): Promise<EventsGetGamesSeriesResponse> {
    const seriesModel = Model.getModel(context.repository, EventGameSeriesModel);
    const eventModel = Model.getModel(context.repository, EventModel);
    const event = await eventModel.findById([genericEventPayload.eventId]);
    return { results: await seriesModel.getGamesSeries(event[0]) };
  },
  GetCurrentSessions: async function (
    playersGetCurrentSessionsPayload: PlayersGetCurrentSessionsPayload,
    context: Context
  ): Promise<PlayersGetCurrentSessionsResponse> {
    const eventModel = Model.getModel(context.repository, EventModel);
    const event = await eventModel.findById([playersGetCurrentSessionsPayload.eventId]);

    if (event.length === 0) {
      throw new Error('Event not found');
    }

    const sessionModel = Model.getModel(context.repository, SessionModel);
    const sessions = await sessionModel.findByPlayerAndEvent(
      playersGetCurrentSessionsPayload.playerId,
      playersGetCurrentSessionsPayload.eventId,
      SessionStatus.SESSION_STATUS_INPROGRESS
    );

    const timerState = await eventModel.getTimerState(
      playersGetCurrentSessionsPayload.eventId,
      sessions
    );

    const { players, replaceMap } = await sessionModel.getPlayersOfGames(sessions, true);
    const playerModel = Model.getModel(context.repository, PlayerModel);

    return {
      sessions: sessions.map((s) => ({
        ...s,
        status: s.status!,
        sessionHash: s.representationalHash!,
        timerState: timerState[s.representationalHash!],
        players: playerModel.substituteReplacements(players.get(s.id)!, replaceMap),
      })),
    };
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
