import {
  EventData,
  GameConfig,
  GenericEventPayload,
  GenericSessionPayload,
  GenericSuccessResponse,
  IntermediateResultOfSession,
} from 'tsclients/proto/atoms.pb';
import {
  AddPenalty,
  AddRound,
  CancelGame,
  CancelPenalty,
  CreateEvent,
  DropLastRound,
  EventsGetAllRegisteredPlayersResponse,
  EventsGetEventForEditResponse,
  EventsGetEventsByIdResponse,
  EventsGetEventsPayload,
  EventsGetEventsResponse,
  EventsGetGameResponse,
  EventsGetGamesSeriesResponse,
  EventsGetLastGamesResponse,
  EventsGetRatingTablePayload,
  EventsGetRatingTableResponse,
  EventsGetRulesetsResponse,
  EventsGetTimerStateResponse,
  FinishEvent,
  ForceFinishGame,
  GamesAddPenaltyPayload,
  GamesAddRoundPayload,
  GamesAddRoundResponse,
  GamesGetSessionOverviewResponse,
  GamesPreviewRoundPayload,
  GamesPreviewRoundResponse,
  GetAllRegisteredPlayers,
  GetAllRounds,
  GetCurrentSessions,
  GetCurrentStateForPlayer,
  GetCurrentStateResponse,
  GetEventForEdit,
  GetEvents,
  GetEventsById,
  GetGame,
  GetGameConfig,
  GetGamesSeries,
  GetLastGames,
  GetLastResults,
  GetLastRound,
  GetLastRoundByHash,
  GetMyEvents,
  GetPlayer,
  GetRatingTable,
  GetRulesets,
  GetSessionOverview,
  GetTimerState,
  ListPenalties,
  PenaltiesResponse,
  PlayersGetAllRoundsResponse,
  PlayersGetCurrentSessionsResponse,
  PlayersGetLastResultsResponse,
  PlayersGetLastRoundByHashResponse,
  PlayersGetLastRoundResponse,
  PlayersGetMyEventsResponse,
  PlayersGetPlayerResponse,
  PreviewRound,
  RegisterPlayer,
  StartGame,
  ToggleHideAchievements,
  ToggleHideResults,
  ToggleListed,
  UnregisterPlayer,
  UpdateEvent,
  UpdatePlayerReplacement,
  UpdatePlayerSeatingFlag,
} from 'tsclients/proto/mimir.pb.js';
import { ClientConfiguration } from 'twirpscript';

export class MimirTest {
  protected _config: ClientConfiguration;

  protected _eventId = 1;
  protected _personId = 1;
  protected _authToken = '';

  setEventId(eventId: number) {
    this._eventId = eventId;
  }

  setPersonId(personId: number) {
    this._personId = personId;
  }

  setAuthToken(authToken: string) {
    this._authToken = authToken;
  }

  constructor() {
    this._config = {
      prefix: '/v2',
      baseURL: 'http://localhost:4301',
    };

    this._config.rpcTransport = async (url, opts) => {
      const headers = new Headers();
      headers.append('X-Auth-Token', this._authToken);
      headers.append('X-Current-Person-Id', this._personId?.toString() ?? '');
      Object.keys(opts.headers ?? {}).forEach((key) => headers.set(key, opts.headers[key]));
      headers.set('X-Current-Event-Id', this._eventId?.toString() ?? '');
      // @ts-expect-error Note: IDE might warn about inconsistent types of opts.body; this is not the case here.
      const resp = await fetch(url, {
        ...opts,
        headers,
      });

      if (!resp.ok) {
        const err = await resp.json();
        // Twirp server error handling
        if (err.code && err.meta && err.meta.cause) {
          throw new Error(err.meta.cause);
        }
      }
      return resp;
    };
  }

  async GetRulesets(): Promise<EventsGetRulesetsResponse> {
    return GetRulesets({}, this._config);
  }

  async GetEvents(payload: EventsGetEventsPayload): Promise<EventsGetEventsResponse> {
    return GetEvents(payload, this._config);
  }

  async GetEventsById(eventIds: number[]): Promise<EventsGetEventsByIdResponse> {
    return GetEventsById({ ids: eventIds }, this._config);
  }

  async GetMyEvents(): Promise<PlayersGetMyEventsResponse> {
    return GetMyEvents({}, this._config);
  }

  async GetGameConfig(eventId: number): Promise<GameConfig> {
    return GetGameConfig({ eventId }, this._config);
  }

  async GetRatingTable(
    payload: EventsGetRatingTablePayload
  ): Promise<EventsGetRatingTableResponse> {
    return GetRatingTable(payload, this._config);
  }

  async GetLastGames(
    eventIdList: number[],
    limit: number,
    offset: number
  ): Promise<EventsGetLastGamesResponse> {
    return GetLastGames({ eventIdList, limit, offset }, this._config);
  }

  async GetGame(sessionHash: string): Promise<EventsGetGameResponse> {
    return GetGame({ sessionHash }, this._config);
  }

  async GetGamesSeries(eventId: number): Promise<EventsGetGamesSeriesResponse> {
    return GetGamesSeries({ eventId }, this._config);
  }

  async GetCurrentSessions(
    playerId: number,
    eventId: number
  ): Promise<PlayersGetCurrentSessionsResponse> {
    return GetCurrentSessions({ playerId, eventId }, this._config);
  }

  async GetAllRegisteredPlayers(
    eventIds: number[]
  ): Promise<EventsGetAllRegisteredPlayersResponse> {
    return GetAllRegisteredPlayers({ eventIds }, this._config);
  }

  async GetTimerState(eventId: number): Promise<EventsGetTimerStateResponse> {
    return GetTimerState({ eventId }, this._config);
  }

  async GetSessionOverview(sessionHash: string): Promise<GamesGetSessionOverviewResponse> {
    return GetSessionOverview({ sessionHash }, this._config);
  }

  async AddRound(payload: GamesAddRoundPayload): Promise<GamesAddRoundResponse> {
    return AddRound(payload, this._config);
  }

  async PreviewRound(payload: GamesPreviewRoundPayload): Promise<GamesPreviewRoundResponse> {
    return PreviewRound(payload, this._config);
  }

  async StartGame(eventId: number, players: number[]): Promise<GenericSessionPayload> {
    return StartGame({ eventId, players }, this._config);
  }

  async CancelGame(sessionHash: string): Promise<GenericSuccessResponse> {
    return CancelGame({ sessionHash }, this._config);
  }

  async DropLastRound(
    sessionHash: string,
    intermediateResults: IntermediateResultOfSession[]
  ): Promise<GenericSuccessResponse> {
    return DropLastRound({ sessionHash, intermediateResults }, this._config);
  }

  async ForceFinishGame(sessionHash: string): Promise<GenericSuccessResponse> {
    return ForceFinishGame({ sessionHash }, this._config);
  }

  async GetLastResults(playerId: number, eventId: number): Promise<PlayersGetLastResultsResponse> {
    return GetLastResults({ playerId, eventId }, this._config);
  }

  async GetLastRound(playerId: number, eventId: number): Promise<PlayersGetLastRoundResponse> {
    return GetLastRound({ playerId, eventId }, this._config);
  }

  async GetAllRounds(sessionHash: string): Promise<PlayersGetAllRoundsResponse> {
    return GetAllRounds({ sessionHash }, this._config);
  }

  async GetLastRoundByHash(sessionHash: string): Promise<PlayersGetLastRoundByHashResponse> {
    return GetLastRoundByHash({ sessionHash }, this._config);
  }

  async CreateEvent(eventData: EventData): Promise<GenericEventPayload> {
    return CreateEvent(eventData, this._config);
  }

  async GetEventForEdit(eventId: number): Promise<EventsGetEventForEditResponse> {
    return GetEventForEdit({ id: eventId }, this._config);
  }

  async UpdateEvent(eventId: number, eventData: EventData): Promise<GenericSuccessResponse> {
    return UpdateEvent({ id: eventId, event: eventData }, this._config);
  }

  async FinishEvent(eventId: number): Promise<GenericSuccessResponse> {
    return FinishEvent({ eventId }, this._config);
  }

  async RegisterPlayer(eventId: number, playerId: number): Promise<GenericSuccessResponse> {
    return RegisterPlayer({ eventId, playerId }, this._config);
  }

  async UnregisterPlayer(eventId: number, playerId: number): Promise<GenericSuccessResponse> {
    return UnregisterPlayer({ eventId, playerId }, this._config);
  }

  async UpdatePlayerSeatingFlag(
    eventId: number,
    playerId: number,
    ignoreSeating: boolean
  ): Promise<GenericSuccessResponse> {
    return UpdatePlayerSeatingFlag({ eventId, playerId, ignoreSeating }, this._config);
  }

  async ToggleListed(eventId: number): Promise<GenericSuccessResponse> {
    return ToggleListed({ eventId }, this._config);
  }

  async ToggleHideResults(eventId: number): Promise<GenericSuccessResponse> {
    return ToggleHideResults({ eventId }, this._config);
  }

  async ToggleHideAchievements(eventId: number): Promise<GenericSuccessResponse> {
    return ToggleHideAchievements({ eventId }, this._config);
  }

  async UpdatePlayerReplacement(
    eventId: number,
    playerId: number,
    replacementId: number
  ): Promise<GenericSuccessResponse> {
    return UpdatePlayerReplacement({ eventId, playerId, replacementId }, this._config);
  }

  async GetPlayer(playerId: number): Promise<PlayersGetPlayerResponse> {
    return GetPlayer({ id: playerId }, this._config);
  }

  async GetCurrentStateForPlayer(
    eventId: number,
    playerId: number
  ): Promise<GetCurrentStateResponse> {
    return GetCurrentStateForPlayer({ eventId, playerId }, this._config);
  }

  async AddPenalty(payload: GamesAddPenaltyPayload): Promise<GenericSuccessResponse> {
    return AddPenalty(payload, this._config);
  }

  async ListPenalties(eventId: number): Promise<PenaltiesResponse> {
    return ListPenalties({ eventId }, this._config);
  }

  async CancelPenalty(penaltyId: number, reason?: string): Promise<GenericSuccessResponse> {
    return CancelPenalty({ penaltyId, reason }, this._config);
  }
}
