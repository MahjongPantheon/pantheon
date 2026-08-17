import * as protoscript from "protoscript";
import { JSONrequest, PBrequest } from "twirpscript";
export { MIN_SUPPORTED_VERSION_0_0_56 } from "twirpscript";
import * as protoAtoms from "./atoms.pb";
export async function GetRulesets(eventsGetRulesetsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetRulesets",
    EventsGetRulesetsPayload.encode(eventsGetRulesetsPayload),
    config
  );
  return EventsGetRulesetsResponse.decode(response);
}
export async function GetEvents(eventsGetEventsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetEvents",
    EventsGetEventsPayload.encode(eventsGetEventsPayload),
    config
  );
  return EventsGetEventsResponse.decode(response);
}
export async function GetEventsById(eventsGetEventsByIdPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetEventsById",
    EventsGetEventsByIdPayload.encode(eventsGetEventsByIdPayload),
    config
  );
  return EventsGetEventsByIdResponse.decode(response);
}
export async function GetMyEvents(playersGetMyEventsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetMyEvents",
    PlayersGetMyEventsPayload.encode(playersGetMyEventsPayload),
    config
  );
  return PlayersGetMyEventsResponse.decode(response);
}
export async function GetGameConfig(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetGameConfig",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GameConfig.decode(response);
}
export async function GetRatingTable(eventsGetRatingTablePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetRatingTable",
    EventsGetRatingTablePayload.encode(eventsGetRatingTablePayload),
    config
  );
  return EventsGetRatingTableResponse.decode(response);
}
export async function GetLastGames(eventsGetLastGamesPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetLastGames",
    EventsGetLastGamesPayload.encode(eventsGetLastGamesPayload),
    config
  );
  return EventsGetLastGamesResponse.decode(response);
}
export async function GetGame(genericSessionPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetGame",
    protoAtoms.GenericSessionPayload.encode(genericSessionPayload),
    config
  );
  return EventsGetGameResponse.decode(response);
}
export async function GetGamesSeries(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetGamesSeries",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return EventsGetGamesSeriesResponse.decode(response);
}
export async function GetCurrentSessions(playersGetCurrentSessionsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetCurrentSessions",
    PlayersGetCurrentSessionsPayload.encode(playersGetCurrentSessionsPayload),
    config
  );
  return PlayersGetCurrentSessionsResponse.decode(response);
}
export async function GetAllRegisteredPlayers(eventsGetAllRegisteredPlayersPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetAllRegisteredPlayers",
    EventsGetAllRegisteredPlayersPayload.encode(
      eventsGetAllRegisteredPlayersPayload
    ),
    config
  );
  return EventsGetAllRegisteredPlayersResponse.decode(response);
}
export async function GetTimerState(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetTimerState",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return EventsGetTimerStateResponse.decode(response);
}
export async function GetSessionOverview(genericSessionPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetSessionOverview",
    protoAtoms.GenericSessionPayload.encode(genericSessionPayload),
    config
  );
  return GamesGetSessionOverviewResponse.decode(response);
}
export async function GetPlayerStats(playersGetPlayerStatsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetPlayerStats",
    PlayersGetPlayerStatsPayload.encode(playersGetPlayerStatsPayload),
    config
  );
  return PlayersGetPlayerStatsResponse.decode(response);
}
export async function AddRound(gamesAddRoundPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/AddRound",
    GamesAddRoundPayload.encode(gamesAddRoundPayload),
    config
  );
  return GamesAddRoundResponse.decode(response);
}
export async function PreviewRound(gamesPreviewRoundPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/PreviewRound",
    GamesPreviewRoundPayload.encode(gamesPreviewRoundPayload),
    config
  );
  return GamesPreviewRoundResponse.decode(response);
}
export async function AddOnlineReplay(gamesAddOnlineReplayPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/AddOnlineReplay",
    GamesAddOnlineReplayPayload.encode(gamesAddOnlineReplayPayload),
    config
  );
  return GamesAddOnlineReplayResponse.decode(response);
}
export async function GetLastResults(playersGetLastResultsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetLastResults",
    PlayersGetLastResultsPayload.encode(playersGetLastResultsPayload),
    config
  );
  return PlayersGetLastResultsResponse.decode(response);
}
export async function GetLastRound(playersGetLastRoundPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetLastRound",
    PlayersGetLastRoundPayload.encode(playersGetLastRoundPayload),
    config
  );
  return PlayersGetLastRoundResponse.decode(response);
}
export async function GetAllRounds(genericSessionPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetAllRounds",
    protoAtoms.GenericSessionPayload.encode(genericSessionPayload),
    config
  );
  return PlayersGetAllRoundsResponse.decode(response);
}
export async function GetLastRoundByHash(genericSessionPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetLastRoundByHash",
    protoAtoms.GenericSessionPayload.encode(genericSessionPayload),
    config
  );
  return PlayersGetLastRoundByHashResponse.decode(response);
}
export async function GetEventForEdit(eventsGetEventForEditPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetEventForEdit",
    EventsGetEventForEditPayload.encode(eventsGetEventForEditPayload),
    config
  );
  return EventsGetEventForEditResponse.decode(response);
}
export async function RebuildScoring(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/RebuildScoring",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function CreateEvent(eventData, config) {
  const response = await PBrequest(
    "/common.Mimir/CreateEvent",
    protoAtoms.EventData.encode(eventData),
    config
  );
  return protoAtoms.GenericEventPayload.decode(response);
}
export async function UpdateEvent(eventsUpdateEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/UpdateEvent",
    EventsUpdateEventPayload.encode(eventsUpdateEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function FinishEvent(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/FinishEvent",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function ToggleListed(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ToggleListed",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function GetTablesState(eventsGetTablesStatePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetTablesState",
    EventsGetTablesStatePayload.encode(eventsGetTablesStatePayload),
    config
  );
  return EventsGetTablesStateResponse.decode(response);
}
export async function StartTimer(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/StartTimer",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function RegisterPlayer(eventsRegisterPlayerPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/RegisterPlayer",
    EventsRegisterPlayerPayload.encode(eventsRegisterPlayerPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function UnregisterPlayer(eventsUnregisterPlayerPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/UnregisterPlayer",
    EventsUnregisterPlayerPayload.encode(eventsUnregisterPlayerPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function UpdatePlayerSeatingFlag(eventsUpdatePlayerSeatingFlagPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/UpdatePlayerSeatingFlag",
    EventsUpdatePlayerSeatingFlagPayload.encode(
      eventsUpdatePlayerSeatingFlagPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function GetAchievements(eventsGetAchievementsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetAchievements",
    EventsGetAchievementsPayload.encode(eventsGetAchievementsPayload),
    config
  );
  return EventsGetAchievementsResponse.decode(response);
}
export async function ToggleHideResults(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ToggleHideResults",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function ToggleHideAchievements(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ToggleHideAchievements",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function UpdatePlayersLocalIds(eventsUpdatePlayersLocalIdsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/UpdatePlayersLocalIds",
    EventsUpdatePlayersLocalIdsPayload.encode(
      eventsUpdatePlayersLocalIdsPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function UpdatePlayerReplacement(eventsUpdatePlayerReplacementPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/UpdatePlayerReplacement",
    EventsUpdatePlayerReplacementPayload.encode(
      eventsUpdatePlayerReplacementPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function UpdatePlayersTeams(eventsUpdatePlayersTeamsPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/UpdatePlayersTeams",
    EventsUpdatePlayersTeamsPayload.encode(eventsUpdatePlayersTeamsPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function StartGame(gamesStartGamePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/StartGame",
    GamesStartGamePayload.encode(gamesStartGamePayload),
    config
  );
  return protoAtoms.GenericSessionPayload.decode(response);
}
export async function CancelGame(genericSessionPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/CancelGame",
    protoAtoms.GenericSessionPayload.encode(genericSessionPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function FinalizeSession(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/FinalizeSession",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function DropLastRound(gamesDropLastRoundPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/DropLastRound",
    GamesDropLastRoundPayload.encode(gamesDropLastRoundPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function DefinalizeGame(genericSessionPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/DefinalizeGame",
    protoAtoms.GenericSessionPayload.encode(genericSessionPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function AddPenalty(gamesAddPenaltyPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/AddPenalty",
    GamesAddPenaltyPayload.encode(gamesAddPenaltyPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function AddPenaltyGame(gamesAddPenaltyGamePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/AddPenaltyGame",
    GamesAddPenaltyGamePayload.encode(gamesAddPenaltyGamePayload),
    config
  );
  return protoAtoms.GenericSessionPayload.decode(response);
}
export async function GetPlayer(playersGetPlayerPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetPlayer",
    PlayersGetPlayerPayload.encode(playersGetPlayerPayload),
    config
  );
  return PlayersGetPlayerResponse.decode(response);
}
export async function GetCurrentSeating(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetCurrentSeating",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return EventsGetCurrentSeatingResponse.decode(response);
}
export async function MakeShuffledSeating(seatingMakeShuffledSeatingPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/MakeShuffledSeating",
    SeatingMakeShuffledSeatingPayload.encode(seatingMakeShuffledSeatingPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function MakeSwissSeating(seatingMakeSwissSeatingPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/MakeSwissSeating",
    SeatingMakeSwissSeatingPayload.encode(seatingMakeSwissSeatingPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function ResetSeating(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ResetSeating",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function GenerateSwissSeating(seatingGenerateSwissSeatingPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GenerateSwissSeating",
    SeatingGenerateSwissSeatingPayload.encode(
      seatingGenerateSwissSeatingPayload
    ),
    config
  );
  return SeatingGenerateSwissSeatingResponse.decode(response);
}
export async function MakeIntervalSeating(seatingMakeIntervalSeatingPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/MakeIntervalSeating",
    SeatingMakeIntervalSeatingPayload.encode(seatingMakeIntervalSeatingPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function MakePrescriptedSeating(seatingMakePrescriptedSeatingPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/MakePrescriptedSeating",
    SeatingMakePrescriptedSeatingPayload.encode(
      seatingMakePrescriptedSeatingPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function GetPrescriptedEventConfig(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetPrescriptedEventConfig",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return EventsGetPrescriptedEventConfigResponse.decode(response);
}
export async function UpdatePrescriptedEventConfig(eventsUpdatePrescriptedEventConfigPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/UpdatePrescriptedEventConfig",
    EventsUpdatePrescriptedEventConfigPayload.encode(
      eventsUpdatePrescriptedEventConfigPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function ClearStatCache(clearStatCachePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ClearStatCache",
    ClearStatCachePayload.encode(clearStatCachePayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function ForceFinishGame(genericSessionPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ForceFinishGame",
    protoAtoms.GenericSessionPayload.encode(genericSessionPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function AddTypedOnlineReplay(typedGamesAddOnlineReplayPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/AddTypedOnlineReplay",
    TypedGamesAddOnlineReplayPayload.encode(typedGamesAddOnlineReplayPayload),
    config
  );
  return GamesAddOnlineReplayResponse.decode(response);
}
export async function NotifyPlayersSessionStartsSoon(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/NotifyPlayersSessionStartsSoon",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function CallReferee(callRefereePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/CallReferee",
    CallRefereePayload.encode(callRefereePayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function RecalcAchievements(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/RecalcAchievements",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function RecalcPlayerStats(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/RecalcPlayerStats",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function ListPenalties(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ListPenalties",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return PenaltiesResponse.decode(response);
}
export async function CancelPenalty(cancelPenaltyPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/CancelPenalty",
    CancelPenaltyPayload.encode(cancelPenaltyPayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function AddExtraTime(addExtraTimePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/AddExtraTime",
    AddExtraTimePayload.encode(addExtraTimePayload),
    config
  );
  return protoAtoms.GenericSuccessResponse.decode(response);
}
export async function ListMyPenalties(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ListMyPenalties",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return PenaltiesResponse.decode(response);
}
export async function ListChombo(genericEventPayload, config) {
  const response = await PBrequest(
    "/common.Mimir/ListChombo",
    protoAtoms.GenericEventPayload.encode(genericEventPayload),
    config
  );
  return ChomboResponse.decode(response);
}
export async function GetCurrentStateForPlayer(getCurrentStatePayload, config) {
  const response = await PBrequest(
    "/common.Mimir/GetCurrentStateForPlayer",
    GetCurrentStatePayload.encode(getCurrentStatePayload),
    config
  );
  return GetCurrentStateResponse.decode(response);
}
export async function GetRulesetsJSON(eventsGetRulesetsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetRulesets",
    EventsGetRulesetsPayloadJSON.encode(eventsGetRulesetsPayload),
    config
  );
  return EventsGetRulesetsResponseJSON.decode(response);
}
export async function GetEventsJSON(eventsGetEventsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetEvents",
    EventsGetEventsPayloadJSON.encode(eventsGetEventsPayload),
    config
  );
  return EventsGetEventsResponseJSON.decode(response);
}
export async function GetEventsByIdJSON(eventsGetEventsByIdPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetEventsById",
    EventsGetEventsByIdPayloadJSON.encode(eventsGetEventsByIdPayload),
    config
  );
  return EventsGetEventsByIdResponseJSON.decode(response);
}
export async function GetMyEventsJSON(playersGetMyEventsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetMyEvents",
    PlayersGetMyEventsPayloadJSON.encode(playersGetMyEventsPayload),
    config
  );
  return PlayersGetMyEventsResponseJSON.decode(response);
}
export async function GetGameConfigJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetGameConfig",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GameConfigJSON.decode(response);
}
export async function GetRatingTableJSON(eventsGetRatingTablePayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetRatingTable",
    EventsGetRatingTablePayloadJSON.encode(eventsGetRatingTablePayload),
    config
  );
  return EventsGetRatingTableResponseJSON.decode(response);
}
export async function GetLastGamesJSON(eventsGetLastGamesPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetLastGames",
    EventsGetLastGamesPayloadJSON.encode(eventsGetLastGamesPayload),
    config
  );
  return EventsGetLastGamesResponseJSON.decode(response);
}
export async function GetGameJSON(genericSessionPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetGame",
    protoAtoms.GenericSessionPayloadJSON.encode(genericSessionPayload),
    config
  );
  return EventsGetGameResponseJSON.decode(response);
}
export async function GetGamesSeriesJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetGamesSeries",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return EventsGetGamesSeriesResponseJSON.decode(response);
}
export async function GetCurrentSessionsJSON(playersGetCurrentSessionsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetCurrentSessions",
    PlayersGetCurrentSessionsPayloadJSON.encode(
      playersGetCurrentSessionsPayload
    ),
    config
  );
  return PlayersGetCurrentSessionsResponseJSON.decode(response);
}
export async function GetAllRegisteredPlayersJSON(eventsGetAllRegisteredPlayersPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetAllRegisteredPlayers",
    EventsGetAllRegisteredPlayersPayloadJSON.encode(
      eventsGetAllRegisteredPlayersPayload
    ),
    config
  );
  return EventsGetAllRegisteredPlayersResponseJSON.decode(response);
}
export async function GetTimerStateJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetTimerState",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return EventsGetTimerStateResponseJSON.decode(response);
}
export async function GetSessionOverviewJSON(genericSessionPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetSessionOverview",
    protoAtoms.GenericSessionPayloadJSON.encode(genericSessionPayload),
    config
  );
  return GamesGetSessionOverviewResponseJSON.decode(response);
}
export async function GetPlayerStatsJSON(playersGetPlayerStatsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetPlayerStats",
    PlayersGetPlayerStatsPayloadJSON.encode(playersGetPlayerStatsPayload),
    config
  );
  return PlayersGetPlayerStatsResponseJSON.decode(response);
}
export async function AddRoundJSON(gamesAddRoundPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/AddRound",
    GamesAddRoundPayloadJSON.encode(gamesAddRoundPayload),
    config
  );
  return GamesAddRoundResponseJSON.decode(response);
}
export async function PreviewRoundJSON(gamesPreviewRoundPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/PreviewRound",
    GamesPreviewRoundPayloadJSON.encode(gamesPreviewRoundPayload),
    config
  );
  return GamesPreviewRoundResponseJSON.decode(response);
}
export async function AddOnlineReplayJSON(gamesAddOnlineReplayPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/AddOnlineReplay",
    GamesAddOnlineReplayPayloadJSON.encode(gamesAddOnlineReplayPayload),
    config
  );
  return GamesAddOnlineReplayResponseJSON.decode(response);
}
export async function GetLastResultsJSON(playersGetLastResultsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetLastResults",
    PlayersGetLastResultsPayloadJSON.encode(playersGetLastResultsPayload),
    config
  );
  return PlayersGetLastResultsResponseJSON.decode(response);
}
export async function GetLastRoundJSON(playersGetLastRoundPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetLastRound",
    PlayersGetLastRoundPayloadJSON.encode(playersGetLastRoundPayload),
    config
  );
  return PlayersGetLastRoundResponseJSON.decode(response);
}
export async function GetAllRoundsJSON(genericSessionPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetAllRounds",
    protoAtoms.GenericSessionPayloadJSON.encode(genericSessionPayload),
    config
  );
  return PlayersGetAllRoundsResponseJSON.decode(response);
}
export async function GetLastRoundByHashJSON(genericSessionPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetLastRoundByHash",
    protoAtoms.GenericSessionPayloadJSON.encode(genericSessionPayload),
    config
  );
  return PlayersGetLastRoundByHashResponseJSON.decode(response);
}
export async function GetEventForEditJSON(eventsGetEventForEditPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetEventForEdit",
    EventsGetEventForEditPayloadJSON.encode(eventsGetEventForEditPayload),
    config
  );
  return EventsGetEventForEditResponseJSON.decode(response);
}
export async function RebuildScoringJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/RebuildScoring",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function CreateEventJSON(eventData, config) {
  const response = await JSONrequest(
    "/common.Mimir/CreateEvent",
    protoAtoms.EventDataJSON.encode(eventData),
    config
  );
  return protoAtoms.GenericEventPayloadJSON.decode(response);
}
export async function UpdateEventJSON(eventsUpdateEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/UpdateEvent",
    EventsUpdateEventPayloadJSON.encode(eventsUpdateEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function FinishEventJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/FinishEvent",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function ToggleListedJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ToggleListed",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function GetTablesStateJSON(eventsGetTablesStatePayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetTablesState",
    EventsGetTablesStatePayloadJSON.encode(eventsGetTablesStatePayload),
    config
  );
  return EventsGetTablesStateResponseJSON.decode(response);
}
export async function StartTimerJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/StartTimer",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function RegisterPlayerJSON(eventsRegisterPlayerPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/RegisterPlayer",
    EventsRegisterPlayerPayloadJSON.encode(eventsRegisterPlayerPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function UnregisterPlayerJSON(eventsUnregisterPlayerPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/UnregisterPlayer",
    EventsUnregisterPlayerPayloadJSON.encode(eventsUnregisterPlayerPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function UpdatePlayerSeatingFlagJSON(eventsUpdatePlayerSeatingFlagPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/UpdatePlayerSeatingFlag",
    EventsUpdatePlayerSeatingFlagPayloadJSON.encode(
      eventsUpdatePlayerSeatingFlagPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function GetAchievementsJSON(eventsGetAchievementsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetAchievements",
    EventsGetAchievementsPayloadJSON.encode(eventsGetAchievementsPayload),
    config
  );
  return EventsGetAchievementsResponseJSON.decode(response);
}
export async function ToggleHideResultsJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ToggleHideResults",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function ToggleHideAchievementsJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ToggleHideAchievements",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function UpdatePlayersLocalIdsJSON(eventsUpdatePlayersLocalIdsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/UpdatePlayersLocalIds",
    EventsUpdatePlayersLocalIdsPayloadJSON.encode(
      eventsUpdatePlayersLocalIdsPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function UpdatePlayerReplacementJSON(eventsUpdatePlayerReplacementPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/UpdatePlayerReplacement",
    EventsUpdatePlayerReplacementPayloadJSON.encode(
      eventsUpdatePlayerReplacementPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function UpdatePlayersTeamsJSON(eventsUpdatePlayersTeamsPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/UpdatePlayersTeams",
    EventsUpdatePlayersTeamsPayloadJSON.encode(eventsUpdatePlayersTeamsPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function StartGameJSON(gamesStartGamePayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/StartGame",
    GamesStartGamePayloadJSON.encode(gamesStartGamePayload),
    config
  );
  return protoAtoms.GenericSessionPayloadJSON.decode(response);
}
export async function CancelGameJSON(genericSessionPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/CancelGame",
    protoAtoms.GenericSessionPayloadJSON.encode(genericSessionPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function FinalizeSessionJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/FinalizeSession",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function DropLastRoundJSON(gamesDropLastRoundPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/DropLastRound",
    GamesDropLastRoundPayloadJSON.encode(gamesDropLastRoundPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function DefinalizeGameJSON(genericSessionPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/DefinalizeGame",
    protoAtoms.GenericSessionPayloadJSON.encode(genericSessionPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function AddPenaltyJSON(gamesAddPenaltyPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/AddPenalty",
    GamesAddPenaltyPayloadJSON.encode(gamesAddPenaltyPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function AddPenaltyGameJSON(gamesAddPenaltyGamePayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/AddPenaltyGame",
    GamesAddPenaltyGamePayloadJSON.encode(gamesAddPenaltyGamePayload),
    config
  );
  return protoAtoms.GenericSessionPayloadJSON.decode(response);
}
export async function GetPlayerJSON(playersGetPlayerPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetPlayer",
    PlayersGetPlayerPayloadJSON.encode(playersGetPlayerPayload),
    config
  );
  return PlayersGetPlayerResponseJSON.decode(response);
}
export async function GetCurrentSeatingJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetCurrentSeating",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return EventsGetCurrentSeatingResponseJSON.decode(response);
}
export async function MakeShuffledSeatingJSON(seatingMakeShuffledSeatingPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/MakeShuffledSeating",
    SeatingMakeShuffledSeatingPayloadJSON.encode(
      seatingMakeShuffledSeatingPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function MakeSwissSeatingJSON(seatingMakeSwissSeatingPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/MakeSwissSeating",
    SeatingMakeSwissSeatingPayloadJSON.encode(seatingMakeSwissSeatingPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function ResetSeatingJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ResetSeating",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function GenerateSwissSeatingJSON(seatingGenerateSwissSeatingPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GenerateSwissSeating",
    SeatingGenerateSwissSeatingPayloadJSON.encode(
      seatingGenerateSwissSeatingPayload
    ),
    config
  );
  return SeatingGenerateSwissSeatingResponseJSON.decode(response);
}
export async function MakeIntervalSeatingJSON(seatingMakeIntervalSeatingPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/MakeIntervalSeating",
    SeatingMakeIntervalSeatingPayloadJSON.encode(
      seatingMakeIntervalSeatingPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function MakePrescriptedSeatingJSON(seatingMakePrescriptedSeatingPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/MakePrescriptedSeating",
    SeatingMakePrescriptedSeatingPayloadJSON.encode(
      seatingMakePrescriptedSeatingPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function GetPrescriptedEventConfigJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetPrescriptedEventConfig",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return EventsGetPrescriptedEventConfigResponseJSON.decode(response);
}
export async function UpdatePrescriptedEventConfigJSON(eventsUpdatePrescriptedEventConfigPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/UpdatePrescriptedEventConfig",
    EventsUpdatePrescriptedEventConfigPayloadJSON.encode(
      eventsUpdatePrescriptedEventConfigPayload
    ),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function ClearStatCacheJSON(clearStatCachePayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ClearStatCache",
    ClearStatCachePayloadJSON.encode(clearStatCachePayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function ForceFinishGameJSON(genericSessionPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ForceFinishGame",
    protoAtoms.GenericSessionPayloadJSON.encode(genericSessionPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function AddTypedOnlineReplayJSON(typedGamesAddOnlineReplayPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/AddTypedOnlineReplay",
    TypedGamesAddOnlineReplayPayloadJSON.encode(
      typedGamesAddOnlineReplayPayload
    ),
    config
  );
  return GamesAddOnlineReplayResponseJSON.decode(response);
}
export async function NotifyPlayersSessionStartsSoonJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/NotifyPlayersSessionStartsSoon",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function CallRefereeJSON(callRefereePayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/CallReferee",
    CallRefereePayloadJSON.encode(callRefereePayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function RecalcAchievementsJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/RecalcAchievements",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function RecalcPlayerStatsJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/RecalcPlayerStats",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function ListPenaltiesJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ListPenalties",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return PenaltiesResponseJSON.decode(response);
}
export async function CancelPenaltyJSON(cancelPenaltyPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/CancelPenalty",
    CancelPenaltyPayloadJSON.encode(cancelPenaltyPayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function AddExtraTimeJSON(addExtraTimePayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/AddExtraTime",
    AddExtraTimePayloadJSON.encode(addExtraTimePayload),
    config
  );
  return protoAtoms.GenericSuccessResponseJSON.decode(response);
}
export async function ListMyPenaltiesJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ListMyPenalties",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return PenaltiesResponseJSON.decode(response);
}
export async function ListChomboJSON(genericEventPayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/ListChombo",
    protoAtoms.GenericEventPayloadJSON.encode(genericEventPayload),
    config
  );
  return ChomboResponseJSON.decode(response);
}
export async function GetCurrentStateForPlayerJSON(getCurrentStatePayload, config) {
  const response = await JSONrequest(
    "/common.Mimir/GetCurrentStateForPlayer",
    GetCurrentStatePayloadJSON.encode(getCurrentStatePayload),
    config
  );
  return GetCurrentStateResponseJSON.decode(response);
}
export function createMimir(service) {
  return {
    name: "common.Mimir",
    methods: {
      GetRulesets: {
        name: "GetRulesets",
        handler: service.GetRulesets,
        input: {
          protobuf: EventsGetRulesetsPayload,
          json: EventsGetRulesetsPayloadJSON
        },
        output: {
          protobuf: EventsGetRulesetsResponse,
          json: EventsGetRulesetsResponseJSON
        }
      },
      GetEvents: {
        name: "GetEvents",
        handler: service.GetEvents,
        input: {
          protobuf: EventsGetEventsPayload,
          json: EventsGetEventsPayloadJSON
        },
        output: {
          protobuf: EventsGetEventsResponse,
          json: EventsGetEventsResponseJSON
        }
      },
      GetEventsById: {
        name: "GetEventsById",
        handler: service.GetEventsById,
        input: {
          protobuf: EventsGetEventsByIdPayload,
          json: EventsGetEventsByIdPayloadJSON
        },
        output: {
          protobuf: EventsGetEventsByIdResponse,
          json: EventsGetEventsByIdResponseJSON
        }
      },
      GetMyEvents: {
        name: "GetMyEvents",
        handler: service.GetMyEvents,
        input: {
          protobuf: PlayersGetMyEventsPayload,
          json: PlayersGetMyEventsPayloadJSON
        },
        output: {
          protobuf: PlayersGetMyEventsResponse,
          json: PlayersGetMyEventsResponseJSON
        }
      },
      GetGameConfig: {
        name: "GetGameConfig",
        handler: service.GetGameConfig,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GameConfig,
          json: protoAtoms.GameConfigJSON
        }
      },
      GetRatingTable: {
        name: "GetRatingTable",
        handler: service.GetRatingTable,
        input: {
          protobuf: EventsGetRatingTablePayload,
          json: EventsGetRatingTablePayloadJSON
        },
        output: {
          protobuf: EventsGetRatingTableResponse,
          json: EventsGetRatingTableResponseJSON
        }
      },
      GetLastGames: {
        name: "GetLastGames",
        handler: service.GetLastGames,
        input: {
          protobuf: EventsGetLastGamesPayload,
          json: EventsGetLastGamesPayloadJSON
        },
        output: {
          protobuf: EventsGetLastGamesResponse,
          json: EventsGetLastGamesResponseJSON
        }
      },
      GetGame: {
        name: "GetGame",
        handler: service.GetGame,
        input: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        },
        output: {
          protobuf: EventsGetGameResponse,
          json: EventsGetGameResponseJSON
        }
      },
      GetGamesSeries: {
        name: "GetGamesSeries",
        handler: service.GetGamesSeries,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: EventsGetGamesSeriesResponse,
          json: EventsGetGamesSeriesResponseJSON
        }
      },
      GetCurrentSessions: {
        name: "GetCurrentSessions",
        handler: service.GetCurrentSessions,
        input: {
          protobuf: PlayersGetCurrentSessionsPayload,
          json: PlayersGetCurrentSessionsPayloadJSON
        },
        output: {
          protobuf: PlayersGetCurrentSessionsResponse,
          json: PlayersGetCurrentSessionsResponseJSON
        }
      },
      GetAllRegisteredPlayers: {
        name: "GetAllRegisteredPlayers",
        handler: service.GetAllRegisteredPlayers,
        input: {
          protobuf: EventsGetAllRegisteredPlayersPayload,
          json: EventsGetAllRegisteredPlayersPayloadJSON
        },
        output: {
          protobuf: EventsGetAllRegisteredPlayersResponse,
          json: EventsGetAllRegisteredPlayersResponseJSON
        }
      },
      GetTimerState: {
        name: "GetTimerState",
        handler: service.GetTimerState,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: EventsGetTimerStateResponse,
          json: EventsGetTimerStateResponseJSON
        }
      },
      GetSessionOverview: {
        name: "GetSessionOverview",
        handler: service.GetSessionOverview,
        input: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        },
        output: {
          protobuf: GamesGetSessionOverviewResponse,
          json: GamesGetSessionOverviewResponseJSON
        }
      },
      GetPlayerStats: {
        name: "GetPlayerStats",
        handler: service.GetPlayerStats,
        input: {
          protobuf: PlayersGetPlayerStatsPayload,
          json: PlayersGetPlayerStatsPayloadJSON
        },
        output: {
          protobuf: PlayersGetPlayerStatsResponse,
          json: PlayersGetPlayerStatsResponseJSON
        }
      },
      AddRound: {
        name: "AddRound",
        handler: service.AddRound,
        input: {
          protobuf: GamesAddRoundPayload,
          json: GamesAddRoundPayloadJSON
        },
        output: {
          protobuf: GamesAddRoundResponse,
          json: GamesAddRoundResponseJSON
        }
      },
      PreviewRound: {
        name: "PreviewRound",
        handler: service.PreviewRound,
        input: {
          protobuf: GamesPreviewRoundPayload,
          json: GamesPreviewRoundPayloadJSON
        },
        output: {
          protobuf: GamesPreviewRoundResponse,
          json: GamesPreviewRoundResponseJSON
        }
      },
      AddOnlineReplay: {
        name: "AddOnlineReplay",
        handler: service.AddOnlineReplay,
        input: {
          protobuf: GamesAddOnlineReplayPayload,
          json: GamesAddOnlineReplayPayloadJSON
        },
        output: {
          protobuf: GamesAddOnlineReplayResponse,
          json: GamesAddOnlineReplayResponseJSON
        }
      },
      GetLastResults: {
        name: "GetLastResults",
        handler: service.GetLastResults,
        input: {
          protobuf: PlayersGetLastResultsPayload,
          json: PlayersGetLastResultsPayloadJSON
        },
        output: {
          protobuf: PlayersGetLastResultsResponse,
          json: PlayersGetLastResultsResponseJSON
        }
      },
      GetLastRound: {
        name: "GetLastRound",
        handler: service.GetLastRound,
        input: {
          protobuf: PlayersGetLastRoundPayload,
          json: PlayersGetLastRoundPayloadJSON
        },
        output: {
          protobuf: PlayersGetLastRoundResponse,
          json: PlayersGetLastRoundResponseJSON
        }
      },
      GetAllRounds: {
        name: "GetAllRounds",
        handler: service.GetAllRounds,
        input: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        },
        output: {
          protobuf: PlayersGetAllRoundsResponse,
          json: PlayersGetAllRoundsResponseJSON
        }
      },
      GetLastRoundByHash: {
        name: "GetLastRoundByHash",
        handler: service.GetLastRoundByHash,
        input: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        },
        output: {
          protobuf: PlayersGetLastRoundByHashResponse,
          json: PlayersGetLastRoundByHashResponseJSON
        }
      },
      GetEventForEdit: {
        name: "GetEventForEdit",
        handler: service.GetEventForEdit,
        input: {
          protobuf: EventsGetEventForEditPayload,
          json: EventsGetEventForEditPayloadJSON
        },
        output: {
          protobuf: EventsGetEventForEditResponse,
          json: EventsGetEventForEditResponseJSON
        }
      },
      RebuildScoring: {
        name: "RebuildScoring",
        handler: service.RebuildScoring,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      CreateEvent: {
        name: "CreateEvent",
        handler: service.CreateEvent,
        input: {
          protobuf: protoAtoms.EventData,
          json: protoAtoms.EventDataJSON
        },
        output: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        }
      },
      UpdateEvent: {
        name: "UpdateEvent",
        handler: service.UpdateEvent,
        input: {
          protobuf: EventsUpdateEventPayload,
          json: EventsUpdateEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      FinishEvent: {
        name: "FinishEvent",
        handler: service.FinishEvent,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      ToggleListed: {
        name: "ToggleListed",
        handler: service.ToggleListed,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      GetTablesState: {
        name: "GetTablesState",
        handler: service.GetTablesState,
        input: {
          protobuf: EventsGetTablesStatePayload,
          json: EventsGetTablesStatePayloadJSON
        },
        output: {
          protobuf: EventsGetTablesStateResponse,
          json: EventsGetTablesStateResponseJSON
        }
      },
      StartTimer: {
        name: "StartTimer",
        handler: service.StartTimer,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      RegisterPlayer: {
        name: "RegisterPlayer",
        handler: service.RegisterPlayer,
        input: {
          protobuf: EventsRegisterPlayerPayload,
          json: EventsRegisterPlayerPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      UnregisterPlayer: {
        name: "UnregisterPlayer",
        handler: service.UnregisterPlayer,
        input: {
          protobuf: EventsUnregisterPlayerPayload,
          json: EventsUnregisterPlayerPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      UpdatePlayerSeatingFlag: {
        name: "UpdatePlayerSeatingFlag",
        handler: service.UpdatePlayerSeatingFlag,
        input: {
          protobuf: EventsUpdatePlayerSeatingFlagPayload,
          json: EventsUpdatePlayerSeatingFlagPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      GetAchievements: {
        name: "GetAchievements",
        handler: service.GetAchievements,
        input: {
          protobuf: EventsGetAchievementsPayload,
          json: EventsGetAchievementsPayloadJSON
        },
        output: {
          protobuf: EventsGetAchievementsResponse,
          json: EventsGetAchievementsResponseJSON
        }
      },
      ToggleHideResults: {
        name: "ToggleHideResults",
        handler: service.ToggleHideResults,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      ToggleHideAchievements: {
        name: "ToggleHideAchievements",
        handler: service.ToggleHideAchievements,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      UpdatePlayersLocalIds: {
        name: "UpdatePlayersLocalIds",
        handler: service.UpdatePlayersLocalIds,
        input: {
          protobuf: EventsUpdatePlayersLocalIdsPayload,
          json: EventsUpdatePlayersLocalIdsPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      UpdatePlayerReplacement: {
        name: "UpdatePlayerReplacement",
        handler: service.UpdatePlayerReplacement,
        input: {
          protobuf: EventsUpdatePlayerReplacementPayload,
          json: EventsUpdatePlayerReplacementPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      UpdatePlayersTeams: {
        name: "UpdatePlayersTeams",
        handler: service.UpdatePlayersTeams,
        input: {
          protobuf: EventsUpdatePlayersTeamsPayload,
          json: EventsUpdatePlayersTeamsPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      StartGame: {
        name: "StartGame",
        handler: service.StartGame,
        input: {
          protobuf: GamesStartGamePayload,
          json: GamesStartGamePayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        }
      },
      CancelGame: {
        name: "CancelGame",
        handler: service.CancelGame,
        input: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      FinalizeSession: {
        name: "FinalizeSession",
        handler: service.FinalizeSession,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      DropLastRound: {
        name: "DropLastRound",
        handler: service.DropLastRound,
        input: {
          protobuf: GamesDropLastRoundPayload,
          json: GamesDropLastRoundPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      DefinalizeGame: {
        name: "DefinalizeGame",
        handler: service.DefinalizeGame,
        input: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      AddPenalty: {
        name: "AddPenalty",
        handler: service.AddPenalty,
        input: {
          protobuf: GamesAddPenaltyPayload,
          json: GamesAddPenaltyPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      AddPenaltyGame: {
        name: "AddPenaltyGame",
        handler: service.AddPenaltyGame,
        input: {
          protobuf: GamesAddPenaltyGamePayload,
          json: GamesAddPenaltyGamePayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        }
      },
      GetPlayer: {
        name: "GetPlayer",
        handler: service.GetPlayer,
        input: {
          protobuf: PlayersGetPlayerPayload,
          json: PlayersGetPlayerPayloadJSON
        },
        output: {
          protobuf: PlayersGetPlayerResponse,
          json: PlayersGetPlayerResponseJSON
        }
      },
      GetCurrentSeating: {
        name: "GetCurrentSeating",
        handler: service.GetCurrentSeating,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: EventsGetCurrentSeatingResponse,
          json: EventsGetCurrentSeatingResponseJSON
        }
      },
      MakeShuffledSeating: {
        name: "MakeShuffledSeating",
        handler: service.MakeShuffledSeating,
        input: {
          protobuf: SeatingMakeShuffledSeatingPayload,
          json: SeatingMakeShuffledSeatingPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      MakeSwissSeating: {
        name: "MakeSwissSeating",
        handler: service.MakeSwissSeating,
        input: {
          protobuf: SeatingMakeSwissSeatingPayload,
          json: SeatingMakeSwissSeatingPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      ResetSeating: {
        name: "ResetSeating",
        handler: service.ResetSeating,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      GenerateSwissSeating: {
        name: "GenerateSwissSeating",
        handler: service.GenerateSwissSeating,
        input: {
          protobuf: SeatingGenerateSwissSeatingPayload,
          json: SeatingGenerateSwissSeatingPayloadJSON
        },
        output: {
          protobuf: SeatingGenerateSwissSeatingResponse,
          json: SeatingGenerateSwissSeatingResponseJSON
        }
      },
      MakeIntervalSeating: {
        name: "MakeIntervalSeating",
        handler: service.MakeIntervalSeating,
        input: {
          protobuf: SeatingMakeIntervalSeatingPayload,
          json: SeatingMakeIntervalSeatingPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      MakePrescriptedSeating: {
        name: "MakePrescriptedSeating",
        handler: service.MakePrescriptedSeating,
        input: {
          protobuf: SeatingMakePrescriptedSeatingPayload,
          json: SeatingMakePrescriptedSeatingPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      GetPrescriptedEventConfig: {
        name: "GetPrescriptedEventConfig",
        handler: service.GetPrescriptedEventConfig,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: EventsGetPrescriptedEventConfigResponse,
          json: EventsGetPrescriptedEventConfigResponseJSON
        }
      },
      UpdatePrescriptedEventConfig: {
        name: "UpdatePrescriptedEventConfig",
        handler: service.UpdatePrescriptedEventConfig,
        input: {
          protobuf: EventsUpdatePrescriptedEventConfigPayload,
          json: EventsUpdatePrescriptedEventConfigPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      ClearStatCache: {
        name: "ClearStatCache",
        handler: service.ClearStatCache,
        input: {
          protobuf: ClearStatCachePayload,
          json: ClearStatCachePayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      ForceFinishGame: {
        name: "ForceFinishGame",
        handler: service.ForceFinishGame,
        input: {
          protobuf: protoAtoms.GenericSessionPayload,
          json: protoAtoms.GenericSessionPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      AddTypedOnlineReplay: {
        name: "AddTypedOnlineReplay",
        handler: service.AddTypedOnlineReplay,
        input: {
          protobuf: TypedGamesAddOnlineReplayPayload,
          json: TypedGamesAddOnlineReplayPayloadJSON
        },
        output: {
          protobuf: GamesAddOnlineReplayResponse,
          json: GamesAddOnlineReplayResponseJSON
        }
      },
      NotifyPlayersSessionStartsSoon: {
        name: "NotifyPlayersSessionStartsSoon",
        handler: service.NotifyPlayersSessionStartsSoon,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      CallReferee: {
        name: "CallReferee",
        handler: service.CallReferee,
        input: { protobuf: CallRefereePayload, json: CallRefereePayloadJSON },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      RecalcAchievements: {
        name: "RecalcAchievements",
        handler: service.RecalcAchievements,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      RecalcPlayerStats: {
        name: "RecalcPlayerStats",
        handler: service.RecalcPlayerStats,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      ListPenalties: {
        name: "ListPenalties",
        handler: service.ListPenalties,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: { protobuf: PenaltiesResponse, json: PenaltiesResponseJSON }
      },
      CancelPenalty: {
        name: "CancelPenalty",
        handler: service.CancelPenalty,
        input: {
          protobuf: CancelPenaltyPayload,
          json: CancelPenaltyPayloadJSON
        },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      AddExtraTime: {
        name: "AddExtraTime",
        handler: service.AddExtraTime,
        input: { protobuf: AddExtraTimePayload, json: AddExtraTimePayloadJSON },
        output: {
          protobuf: protoAtoms.GenericSuccessResponse,
          json: protoAtoms.GenericSuccessResponseJSON
        }
      },
      ListMyPenalties: {
        name: "ListMyPenalties",
        handler: service.ListMyPenalties,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: { protobuf: PenaltiesResponse, json: PenaltiesResponseJSON }
      },
      ListChombo: {
        name: "ListChombo",
        handler: service.ListChombo,
        input: {
          protobuf: protoAtoms.GenericEventPayload,
          json: protoAtoms.GenericEventPayloadJSON
        },
        output: { protobuf: ChomboResponse, json: ChomboResponseJSON }
      },
      GetCurrentStateForPlayer: {
        name: "GetCurrentStateForPlayer",
        handler: service.GetCurrentStateForPlayer,
        input: {
          protobuf: GetCurrentStatePayload,
          json: GetCurrentStatePayloadJSON
        },
        output: {
          protobuf: GetCurrentStateResponse,
          json: GetCurrentStateResponseJSON
        }
      }
    }
  };
}
export const EventsGetRulesetsPayload = {
  /**
   * Serializes EventsGetRulesetsPayload to protobuf.
   */
  encode: function(_msg) {
    return new Uint8Array();
  },
  /**
   * Deserializes EventsGetRulesetsPayload from protobuf.
   */
  decode: function(_bytes) {
    return {};
  },
  /**
   * Initializes EventsGetRulesetsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(_msg, writer) {
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(_msg, _reader) {
    return _msg;
  }
};
export const EventsGetRulesetsResponse = {
  /**
   * Serializes EventsGetRulesetsResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetRulesetsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetRulesetsResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetRulesetsResponse._readMessage(
      EventsGetRulesetsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetRulesetsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      rulesets: [],
      rulesetIds: [],
      rulesetTitles: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.rulesets?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.rulesets,
        protoAtoms.RulesetConfig._writeMessage
      );
    }
    if (msg.rulesetIds?.length) {
      writer.writeRepeatedString(2, msg.rulesetIds);
    }
    if (msg.rulesetTitles?.length) {
      writer.writeRepeatedString(3, msg.rulesetTitles);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.RulesetConfig.initialize();
          reader.readMessage(m, protoAtoms.RulesetConfig._readMessage);
          msg.rulesets.push(m);
          break;
        }
        case 2: {
          msg.rulesetIds.push(reader.readString());
          break;
        }
        case 3: {
          msg.rulesetTitles.push(reader.readString());
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetEventsPayload = {
  /**
   * Serializes EventsGetEventsPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventsPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventsPayload._readMessage(
      EventsGetEventsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      limit: 0,
      offset: 0,
      filterUnlisted: false,
      filter: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.limit) {
      writer.writeInt32(1, msg.limit);
    }
    if (msg.offset) {
      writer.writeInt32(2, msg.offset);
    }
    if (msg.filterUnlisted) {
      writer.writeBool(3, msg.filterUnlisted);
    }
    if (msg.filter) {
      writer.writeString(4, msg.filter);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.limit = reader.readInt32();
          break;
        }
        case 2: {
          msg.offset = reader.readInt32();
          break;
        }
        case 3: {
          msg.filterUnlisted = reader.readBool();
          break;
        }
        case 4: {
          msg.filter = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetEventsResponse = {
  /**
   * Serializes EventsGetEventsResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventsResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventsResponse._readMessage(
      EventsGetEventsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      total: 0,
      events: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.total) {
      writer.writeInt32(1, msg.total);
    }
    if (msg.events?.length) {
      writer.writeRepeatedMessage(
        2,
        msg.events,
        protoAtoms.Event._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.total = reader.readInt32();
          break;
        }
        case 2: {
          const m = protoAtoms.Event.initialize();
          reader.readMessage(m, protoAtoms.Event._readMessage);
          msg.events.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetEventsByIdPayload = {
  /**
   * Serializes EventsGetEventsByIdPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventsByIdPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventsByIdPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventsByIdPayload._readMessage(
      EventsGetEventsByIdPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventsByIdPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ids?.length) {
      writer.writePackedInt32(1, msg.ids);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.ids.push(...reader.readPackedInt32());
          } else {
            msg.ids.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetEventsByIdResponse = {
  /**
   * Serializes EventsGetEventsByIdResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventsByIdResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventsByIdResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventsByIdResponse._readMessage(
      EventsGetEventsByIdResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventsByIdResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      events: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.events?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.events,
        protoAtoms.Event._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.Event.initialize();
          reader.readMessage(m, protoAtoms.Event._readMessage);
          msg.events.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetMyEventsPayload = {
  /**
   * Serializes PlayersGetMyEventsPayload to protobuf.
   */
  encode: function(_msg) {
    return new Uint8Array();
  },
  /**
   * Deserializes PlayersGetMyEventsPayload from protobuf.
   */
  decode: function(_bytes) {
    return {};
  },
  /**
   * Initializes PlayersGetMyEventsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(_msg, writer) {
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(_msg, _reader) {
    return _msg;
  }
};
export const PlayersGetMyEventsResponse = {
  /**
   * Serializes PlayersGetMyEventsResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetMyEventsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetMyEventsResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetMyEventsResponse._readMessage(
      PlayersGetMyEventsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetMyEventsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      events: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.events?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.events,
        protoAtoms.MyEvent._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.MyEvent.initialize();
          reader.readMessage(m, protoAtoms.MyEvent._readMessage);
          msg.events.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetRatingTablePayload = {
  /**
   * Serializes EventsGetRatingTablePayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetRatingTablePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetRatingTablePayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetRatingTablePayload._readMessage(
      EventsGetRatingTablePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetRatingTablePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventIdList: [],
      orderBy: "",
      order: "",
      onlyMinGames: void 0,
      dateFrom: void 0,
      dateTo: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventIdList?.length) {
      writer.writePackedInt32(1, msg.eventIdList);
    }
    if (msg.orderBy) {
      writer.writeString(2, msg.orderBy);
    }
    if (msg.order) {
      writer.writeString(3, msg.order);
    }
    if (msg.onlyMinGames != void 0) {
      writer.writeBool(5, msg.onlyMinGames);
    }
    if (msg.dateFrom != void 0) {
      writer.writeString(6, msg.dateFrom);
    }
    if (msg.dateTo != void 0) {
      writer.writeString(7, msg.dateTo);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.eventIdList.push(...reader.readPackedInt32());
          } else {
            msg.eventIdList.push(reader.readInt32());
          }
          break;
        }
        case 2: {
          msg.orderBy = reader.readString();
          break;
        }
        case 3: {
          msg.order = reader.readString();
          break;
        }
        case 5: {
          msg.onlyMinGames = reader.readBool();
          break;
        }
        case 6: {
          msg.dateFrom = reader.readString();
          break;
        }
        case 7: {
          msg.dateTo = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetRatingTableResponse = {
  /**
   * Serializes EventsGetRatingTableResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetRatingTableResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetRatingTableResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetRatingTableResponse._readMessage(
      EventsGetRatingTableResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetRatingTableResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      list: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.list?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.list,
        protoAtoms.PlayerInRating._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.PlayerInRating.initialize();
          reader.readMessage(m, protoAtoms.PlayerInRating._readMessage);
          msg.list.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetLastGamesPayload = {
  /**
   * Serializes EventsGetLastGamesPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetLastGamesPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetLastGamesPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetLastGamesPayload._readMessage(
      EventsGetLastGamesPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetLastGamesPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventIdList: [],
      limit: 0,
      offset: 0,
      orderBy: void 0,
      order: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventIdList?.length) {
      writer.writePackedInt32(1, msg.eventIdList);
    }
    if (msg.limit) {
      writer.writeInt32(2, msg.limit);
    }
    if (msg.offset) {
      writer.writeInt32(3, msg.offset);
    }
    if (msg.orderBy != void 0) {
      writer.writeString(4, msg.orderBy);
    }
    if (msg.order != void 0) {
      writer.writeString(5, msg.order);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.eventIdList.push(...reader.readPackedInt32());
          } else {
            msg.eventIdList.push(reader.readInt32());
          }
          break;
        }
        case 2: {
          msg.limit = reader.readInt32();
          break;
        }
        case 3: {
          msg.offset = reader.readInt32();
          break;
        }
        case 4: {
          msg.orderBy = reader.readString();
          break;
        }
        case 5: {
          msg.order = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetLastGamesResponse = {
  /**
   * Serializes EventsGetLastGamesResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetLastGamesResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetLastGamesResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetLastGamesResponse._readMessage(
      EventsGetLastGamesResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetLastGamesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      games: [],
      totalGames: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.games?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.games,
        protoAtoms.GameResult._writeMessage
      );
    }
    if (msg.totalGames) {
      writer.writeInt32(3, msg.totalGames);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.GameResult.initialize();
          reader.readMessage(m, protoAtoms.GameResult._readMessage);
          msg.games.push(m);
          break;
        }
        case 3: {
          msg.totalGames = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetGameResponse = {
  /**
   * Serializes EventsGetGameResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetGameResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetGameResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetGameResponse._readMessage(
      EventsGetGameResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetGameResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      game: protoAtoms.GameResult.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.game) {
      writer.writeMessage(1, msg.game, protoAtoms.GameResult._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.game, protoAtoms.GameResult._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetGamesSeriesResponse = {
  /**
   * Serializes EventsGetGamesSeriesResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetGamesSeriesResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetGamesSeriesResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetGamesSeriesResponse._readMessage(
      EventsGetGamesSeriesResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetGamesSeriesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      results: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.results?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.results,
        protoAtoms.SeriesResult._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.SeriesResult.initialize();
          reader.readMessage(m, protoAtoms.SeriesResult._readMessage);
          msg.results.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetCurrentSessionsPayload = {
  /**
   * Serializes PlayersGetCurrentSessionsPayload to protobuf.
   */
  encode: function(msg) {
    return PlayersGetCurrentSessionsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetCurrentSessionsPayload from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetCurrentSessionsPayload._readMessage(
      PlayersGetCurrentSessionsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetCurrentSessionsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const CurrentSession = {
  /**
   * Serializes CurrentSession to protobuf.
   */
  encode: function(msg) {
    return CurrentSession._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes CurrentSession from protobuf.
   */
  decode: function(bytes) {
    return CurrentSession._readMessage(
      CurrentSession.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes CurrentSession with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHash: "",
      status: "",
      tableIndex: void 0,
      players: [],
      timerState: EventsGetTimerStateResponse.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessionHash) {
      writer.writeString(1, msg.sessionHash);
    }
    if (msg.status) {
      writer.writeString(2, msg.status);
    }
    if (msg.tableIndex != void 0) {
      writer.writeInt32(3, msg.tableIndex);
    }
    if (msg.players?.length) {
      writer.writeRepeatedMessage(
        4,
        msg.players,
        protoAtoms.PlayerInSession._writeMessage
      );
    }
    if (msg.timerState) {
      writer.writeMessage(
        5,
        msg.timerState,
        EventsGetTimerStateResponse._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHash = reader.readString();
          break;
        }
        case 2: {
          msg.status = reader.readString();
          break;
        }
        case 3: {
          msg.tableIndex = reader.readInt32();
          break;
        }
        case 4: {
          const m = protoAtoms.PlayerInSession.initialize();
          reader.readMessage(m, protoAtoms.PlayerInSession._readMessage);
          msg.players.push(m);
          break;
        }
        case 5: {
          reader.readMessage(
            msg.timerState,
            EventsGetTimerStateResponse._readMessage
          );
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetCurrentSessionsResponse = {
  /**
   * Serializes PlayersGetCurrentSessionsResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetCurrentSessionsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetCurrentSessionsResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetCurrentSessionsResponse._readMessage(
      PlayersGetCurrentSessionsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetCurrentSessionsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessions: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessions?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.sessions,
        CurrentSession._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = CurrentSession.initialize();
          reader.readMessage(m, CurrentSession._readMessage);
          msg.sessions.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetAllRegisteredPlayersPayload = {
  /**
   * Serializes EventsGetAllRegisteredPlayersPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetAllRegisteredPlayersPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetAllRegisteredPlayersPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetAllRegisteredPlayersPayload._readMessage(
      EventsGetAllRegisteredPlayersPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetAllRegisteredPlayersPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventIds: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventIds?.length) {
      writer.writePackedInt32(1, msg.eventIds);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.eventIds.push(...reader.readPackedInt32());
          } else {
            msg.eventIds.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetAllRegisteredPlayersResponse = {
  /**
   * Serializes EventsGetAllRegisteredPlayersResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetAllRegisteredPlayersResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetAllRegisteredPlayersResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetAllRegisteredPlayersResponse._readMessage(
      EventsGetAllRegisteredPlayersResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetAllRegisteredPlayersResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.players?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.players,
        protoAtoms.RegisteredPlayer._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.RegisteredPlayer.initialize();
          reader.readMessage(m, protoAtoms.RegisteredPlayer._readMessage);
          msg.players.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetTimerStateResponse = {
  /**
   * Serializes EventsGetTimerStateResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetTimerStateResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetTimerStateResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetTimerStateResponse._readMessage(
      EventsGetTimerStateResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetTimerStateResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      started: false,
      finished: false,
      timeRemaining: 0,
      waitingForTimer: false,
      hideSeatingAfter: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.started) {
      writer.writeBool(1, msg.started);
    }
    if (msg.finished) {
      writer.writeBool(2, msg.finished);
    }
    if (msg.timeRemaining) {
      writer.writeInt32(3, msg.timeRemaining);
    }
    if (msg.waitingForTimer) {
      writer.writeBool(4, msg.waitingForTimer);
    }
    if (msg.hideSeatingAfter) {
      writer.writeInt32(8, msg.hideSeatingAfter);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.started = reader.readBool();
          break;
        }
        case 2: {
          msg.finished = reader.readBool();
          break;
        }
        case 3: {
          msg.timeRemaining = reader.readInt32();
          break;
        }
        case 4: {
          msg.waitingForTimer = reader.readBool();
          break;
        }
        case 8: {
          msg.hideSeatingAfter = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesGetSessionOverviewResponse = {
  /**
   * Serializes GamesGetSessionOverviewResponse to protobuf.
   */
  encode: function(msg) {
    return GamesGetSessionOverviewResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesGetSessionOverviewResponse from protobuf.
   */
  decode: function(bytes) {
    return GamesGetSessionOverviewResponse._readMessage(
      GamesGetSessionOverviewResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesGetSessionOverviewResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      eventId: 0,
      tableIndex: void 0,
      players: [],
      state: protoAtoms.SessionState.initialize(),
      timerState: EventsGetTimerStateResponse.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    if (msg.tableIndex != void 0) {
      writer.writeInt32(3, msg.tableIndex);
    }
    if (msg.players?.length) {
      writer.writeRepeatedMessage(
        4,
        msg.players,
        protoAtoms.PlayerInSession._writeMessage
      );
    }
    if (msg.state) {
      writer.writeMessage(5, msg.state, protoAtoms.SessionState._writeMessage);
    }
    if (msg.timerState) {
      writer.writeMessage(
        6,
        msg.timerState,
        EventsGetTimerStateResponse._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 3: {
          msg.tableIndex = reader.readInt32();
          break;
        }
        case 4: {
          const m = protoAtoms.PlayerInSession.initialize();
          reader.readMessage(m, protoAtoms.PlayerInSession._readMessage);
          msg.players.push(m);
          break;
        }
        case 5: {
          reader.readMessage(msg.state, protoAtoms.SessionState._readMessage);
          break;
        }
        case 6: {
          reader.readMessage(
            msg.timerState,
            EventsGetTimerStateResponse._readMessage
          );
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetPlayerStatsPayload = {
  /**
   * Serializes PlayersGetPlayerStatsPayload to protobuf.
   */
  encode: function(msg) {
    return PlayersGetPlayerStatsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetPlayerStatsPayload from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetPlayerStatsPayload._readMessage(
      PlayersGetPlayerStatsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetPlayerStatsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventIdList: [],
      dateFrom: void 0,
      dateTo: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.eventIdList?.length) {
      writer.writePackedInt32(2, msg.eventIdList);
    }
    if (msg.dateFrom != void 0) {
      writer.writeString(3, msg.dateFrom);
    }
    if (msg.dateTo != void 0) {
      writer.writeString(4, msg.dateTo);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          if (reader.isDelimited()) {
            msg.eventIdList.push(...reader.readPackedInt32());
          } else {
            msg.eventIdList.push(reader.readInt32());
          }
          break;
        }
        case 3: {
          msg.dateFrom = reader.readString();
          break;
        }
        case 4: {
          msg.dateTo = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetPlayerStatsResponse = {
  /**
   * Serializes PlayersGetPlayerStatsResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetPlayerStatsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetPlayerStatsResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetPlayerStatsResponse._readMessage(
      PlayersGetPlayerStatsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetPlayerStatsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ratingHistory: [],
      scoreHistory: [],
      playersInfo: [],
      placesSummary: [],
      totalPlayedGames: 0,
      totalPlayedRounds: 0,
      winSummary: protoAtoms.PlayerWinSummary.initialize(),
      handsValueSummary: [],
      yakuSummary: [],
      riichiSummary: protoAtoms.RiichiSummary.initialize(),
      doraStat: protoAtoms.DoraSummary.initialize(),
      lastUpdate: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.ratingHistory?.length) {
      writer.writePackedInt32(1, msg.ratingHistory);
    }
    if (msg.scoreHistory?.length) {
      writer.writeRepeatedMessage(
        2,
        msg.scoreHistory,
        protoAtoms.SessionHistoryResultTable._writeMessage
      );
    }
    if (msg.playersInfo?.length) {
      writer.writeRepeatedMessage(
        3,
        msg.playersInfo,
        protoAtoms.Player._writeMessage
      );
    }
    if (msg.placesSummary?.length) {
      writer.writeRepeatedMessage(
        4,
        msg.placesSummary,
        protoAtoms.PlacesSummaryItem._writeMessage
      );
    }
    if (msg.totalPlayedGames) {
      writer.writeInt32(5, msg.totalPlayedGames);
    }
    if (msg.totalPlayedRounds) {
      writer.writeInt32(6, msg.totalPlayedRounds);
    }
    if (msg.winSummary) {
      writer.writeMessage(
        7,
        msg.winSummary,
        protoAtoms.PlayerWinSummary._writeMessage
      );
    }
    if (msg.handsValueSummary?.length) {
      writer.writeRepeatedMessage(
        8,
        msg.handsValueSummary,
        protoAtoms.HandValueStat._writeMessage
      );
    }
    if (msg.yakuSummary?.length) {
      writer.writeRepeatedMessage(
        9,
        msg.yakuSummary,
        protoAtoms.YakuStat._writeMessage
      );
    }
    if (msg.riichiSummary) {
      writer.writeMessage(
        10,
        msg.riichiSummary,
        protoAtoms.RiichiSummary._writeMessage
      );
    }
    if (msg.doraStat) {
      writer.writeMessage(
        11,
        msg.doraStat,
        protoAtoms.DoraSummary._writeMessage
      );
    }
    if (msg.lastUpdate) {
      writer.writeString(12, msg.lastUpdate);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          if (reader.isDelimited()) {
            msg.ratingHistory.push(...reader.readPackedInt32());
          } else {
            msg.ratingHistory.push(reader.readInt32());
          }
          break;
        }
        case 2: {
          const m = protoAtoms.SessionHistoryResultTable.initialize();
          reader.readMessage(
            m,
            protoAtoms.SessionHistoryResultTable._readMessage
          );
          msg.scoreHistory.push(m);
          break;
        }
        case 3: {
          const m = protoAtoms.Player.initialize();
          reader.readMessage(m, protoAtoms.Player._readMessage);
          msg.playersInfo.push(m);
          break;
        }
        case 4: {
          const m = protoAtoms.PlacesSummaryItem.initialize();
          reader.readMessage(m, protoAtoms.PlacesSummaryItem._readMessage);
          msg.placesSummary.push(m);
          break;
        }
        case 5: {
          msg.totalPlayedGames = reader.readInt32();
          break;
        }
        case 6: {
          msg.totalPlayedRounds = reader.readInt32();
          break;
        }
        case 7: {
          reader.readMessage(
            msg.winSummary,
            protoAtoms.PlayerWinSummary._readMessage
          );
          break;
        }
        case 8: {
          const m = protoAtoms.HandValueStat.initialize();
          reader.readMessage(m, protoAtoms.HandValueStat._readMessage);
          msg.handsValueSummary.push(m);
          break;
        }
        case 9: {
          const m = protoAtoms.YakuStat.initialize();
          reader.readMessage(m, protoAtoms.YakuStat._readMessage);
          msg.yakuSummary.push(m);
          break;
        }
        case 10: {
          reader.readMessage(
            msg.riichiSummary,
            protoAtoms.RiichiSummary._readMessage
          );
          break;
        }
        case 11: {
          reader.readMessage(msg.doraStat, protoAtoms.DoraSummary._readMessage);
          break;
        }
        case 12: {
          msg.lastUpdate = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesAddRoundPayload = {
  /**
   * Serializes GamesAddRoundPayload to protobuf.
   */
  encode: function(msg) {
    return GamesAddRoundPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesAddRoundPayload from protobuf.
   */
  decode: function(bytes) {
    return GamesAddRoundPayload._readMessage(
      GamesAddRoundPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesAddRoundPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHash: "",
      roundData: protoAtoms.Round.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessionHash) {
      writer.writeString(1, msg.sessionHash);
    }
    if (msg.roundData) {
      writer.writeMessage(2, msg.roundData, protoAtoms.Round._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHash = reader.readString();
          break;
        }
        case 2: {
          reader.readMessage(msg.roundData, protoAtoms.Round._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesAddRoundResponse = {
  /**
   * Serializes GamesAddRoundResponse to protobuf.
   */
  encode: function(msg) {
    return GamesAddRoundResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesAddRoundResponse from protobuf.
   */
  decode: function(bytes) {
    return GamesAddRoundResponse._readMessage(
      GamesAddRoundResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesAddRoundResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      scores: [],
      round: 0,
      honba: 0,
      riichiBets: 0,
      prematurelyFinished: false,
      roundJustChanged: false,
      isFinished: false,
      lastHandStarted: false,
      lastOutcome: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.scores?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.scores,
        protoAtoms.IntermediateResultOfSession._writeMessage
      );
    }
    if (msg.round) {
      writer.writeInt32(3, msg.round);
    }
    if (msg.honba) {
      writer.writeInt32(4, msg.honba);
    }
    if (msg.riichiBets) {
      writer.writeInt32(5, msg.riichiBets);
    }
    if (msg.prematurelyFinished) {
      writer.writeBool(6, msg.prematurelyFinished);
    }
    if (msg.roundJustChanged) {
      writer.writeBool(7, msg.roundJustChanged);
    }
    if (msg.isFinished) {
      writer.writeBool(8, msg.isFinished);
    }
    if (msg.lastHandStarted) {
      writer.writeBool(9, msg.lastHandStarted);
    }
    if (msg.lastOutcome != void 0) {
      writer.writeEnum(10, protoAtoms.RoundOutcome._toInt(msg.lastOutcome));
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.IntermediateResultOfSession.initialize();
          reader.readMessage(
            m,
            protoAtoms.IntermediateResultOfSession._readMessage
          );
          msg.scores.push(m);
          break;
        }
        case 3: {
          msg.round = reader.readInt32();
          break;
        }
        case 4: {
          msg.honba = reader.readInt32();
          break;
        }
        case 5: {
          msg.riichiBets = reader.readInt32();
          break;
        }
        case 6: {
          msg.prematurelyFinished = reader.readBool();
          break;
        }
        case 7: {
          msg.roundJustChanged = reader.readBool();
          break;
        }
        case 8: {
          msg.isFinished = reader.readBool();
          break;
        }
        case 9: {
          msg.lastHandStarted = reader.readBool();
          break;
        }
        case 10: {
          msg.lastOutcome = protoAtoms.RoundOutcome._fromInt(reader.readEnum());
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesPreviewRoundPayload = {
  /**
   * Serializes GamesPreviewRoundPayload to protobuf.
   */
  encode: function(msg) {
    return GamesPreviewRoundPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesPreviewRoundPayload from protobuf.
   */
  decode: function(bytes) {
    return GamesPreviewRoundPayload._readMessage(
      GamesPreviewRoundPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesPreviewRoundPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHash: "",
      roundData: protoAtoms.Round.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessionHash) {
      writer.writeString(1, msg.sessionHash);
    }
    if (msg.roundData) {
      writer.writeMessage(2, msg.roundData, protoAtoms.Round._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHash = reader.readString();
          break;
        }
        case 2: {
          reader.readMessage(msg.roundData, protoAtoms.Round._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesPreviewRoundResponse = {
  /**
   * Serializes GamesPreviewRoundResponse to protobuf.
   */
  encode: function(msg) {
    return GamesPreviewRoundResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesPreviewRoundResponse from protobuf.
   */
  decode: function(bytes) {
    return GamesPreviewRoundResponse._readMessage(
      GamesPreviewRoundResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesPreviewRoundResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      state: protoAtoms.RoundState.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.state) {
      writer.writeMessage(1, msg.state, protoAtoms.RoundState._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.state, protoAtoms.RoundState._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesAddOnlineReplayPayload = {
  /**
   * Serializes GamesAddOnlineReplayPayload to protobuf.
   */
  encode: function(msg) {
    return GamesAddOnlineReplayPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesAddOnlineReplayPayload from protobuf.
   */
  decode: function(bytes) {
    return GamesAddOnlineReplayPayload._readMessage(
      GamesAddOnlineReplayPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesAddOnlineReplayPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      link: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.link) {
      writer.writeString(2, msg.link);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.link = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesAddOnlineReplayResponse = {
  /**
   * Serializes GamesAddOnlineReplayResponse to protobuf.
   */
  encode: function(msg) {
    return GamesAddOnlineReplayResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesAddOnlineReplayResponse from protobuf.
   */
  decode: function(bytes) {
    return GamesAddOnlineReplayResponse._readMessage(
      GamesAddOnlineReplayResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesAddOnlineReplayResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      game: protoAtoms.GameResult.initialize(),
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.game) {
      writer.writeMessage(1, msg.game, protoAtoms.GameResult._writeMessage);
    }
    if (msg.players?.length) {
      writer.writeRepeatedMessage(
        2,
        msg.players,
        protoAtoms.Player._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.game, protoAtoms.GameResult._readMessage);
          break;
        }
        case 2: {
          const m = protoAtoms.Player.initialize();
          reader.readMessage(m, protoAtoms.Player._readMessage);
          msg.players.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetLastResultsPayload = {
  /**
   * Serializes PlayersGetLastResultsPayload to protobuf.
   */
  encode: function(msg) {
    return PlayersGetLastResultsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetLastResultsPayload from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetLastResultsPayload._readMessage(
      PlayersGetLastResultsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetLastResultsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetLastResultsResponse = {
  /**
   * Serializes PlayersGetLastResultsResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetLastResultsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetLastResultsResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetLastResultsResponse._readMessage(
      PlayersGetLastResultsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetLastResultsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      results: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.results?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.results,
        protoAtoms.SessionHistoryResult._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.SessionHistoryResult.initialize();
          reader.readMessage(m, protoAtoms.SessionHistoryResult._readMessage);
          msg.results.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetLastRoundPayload = {
  /**
   * Serializes PlayersGetLastRoundPayload to protobuf.
   */
  encode: function(msg) {
    return PlayersGetLastRoundPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetLastRoundPayload from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetLastRoundPayload._readMessage(
      PlayersGetLastRoundPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetLastRoundPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetLastRoundResponse = {
  /**
   * Serializes PlayersGetLastRoundResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetLastRoundResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetLastRoundResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetLastRoundResponse._readMessage(
      PlayersGetLastRoundResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetLastRoundResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      round: protoAtoms.RoundState.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.round) {
      writer.writeMessage(1, msg.round, protoAtoms.RoundState._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.round, protoAtoms.RoundState._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetAllRoundsResponse = {
  /**
   * Serializes PlayersGetAllRoundsResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetAllRoundsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetAllRoundsResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetAllRoundsResponse._readMessage(
      PlayersGetAllRoundsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetAllRoundsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      rounds: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.rounds?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.rounds,
        protoAtoms.RoundState._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.RoundState.initialize();
          reader.readMessage(m, protoAtoms.RoundState._readMessage);
          msg.rounds.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetLastRoundByHashResponse = {
  /**
   * Serializes PlayersGetLastRoundByHashResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetLastRoundByHashResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetLastRoundByHashResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetLastRoundByHashResponse._readMessage(
      PlayersGetLastRoundByHashResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetLastRoundByHashResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      round: protoAtoms.RoundState.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.round) {
      writer.writeMessage(1, msg.round, protoAtoms.RoundState._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.round, protoAtoms.RoundState._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetEventForEditPayload = {
  /**
   * Serializes EventsGetEventForEditPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventForEditPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventForEditPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventForEditPayload._readMessage(
      EventsGetEventForEditPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventForEditPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetEventForEditResponse = {
  /**
   * Serializes EventsGetEventForEditResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetEventForEditResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetEventForEditResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetEventForEditResponse._readMessage(
      EventsGetEventForEditResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetEventForEditResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      event: protoAtoms.EventData.initialize(),
      finished: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.event) {
      writer.writeMessage(2, msg.event, protoAtoms.EventData._writeMessage);
    }
    if (msg.finished) {
      writer.writeBool(3, msg.finished);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          reader.readMessage(msg.event, protoAtoms.EventData._readMessage);
          break;
        }
        case 3: {
          msg.finished = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsUpdateEventPayload = {
  /**
   * Serializes EventsUpdateEventPayload to protobuf.
   */
  encode: function(msg) {
    return EventsUpdateEventPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsUpdateEventPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsUpdateEventPayload._readMessage(
      EventsUpdateEventPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsUpdateEventPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      event: protoAtoms.EventData.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    if (msg.event) {
      writer.writeMessage(2, msg.event, protoAtoms.EventData._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        case 2: {
          reader.readMessage(msg.event, protoAtoms.EventData._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetTablesStatePayload = {
  /**
   * Serializes EventsGetTablesStatePayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetTablesStatePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetTablesStatePayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetTablesStatePayload._readMessage(
      EventsGetTablesStatePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetTablesStatePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      omitLastRound: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.omitLastRound) {
      writer.writeBool(2, msg.omitLastRound);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.omitLastRound = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetTablesStateResponse = {
  /**
   * Serializes EventsGetTablesStateResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetTablesStateResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetTablesStateResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetTablesStateResponse._readMessage(
      EventsGetTablesStateResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetTablesStateResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      tables: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.tables?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.tables,
        protoAtoms.TableState._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.TableState.initialize();
          reader.readMessage(m, protoAtoms.TableState._readMessage);
          msg.tables.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsRegisterPlayerPayload = {
  /**
   * Serializes EventsRegisterPlayerPayload to protobuf.
   */
  encode: function(msg) {
    return EventsRegisterPlayerPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsRegisterPlayerPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsRegisterPlayerPayload._readMessage(
      EventsRegisterPlayerPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsRegisterPlayerPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsUnregisterPlayerPayload = {
  /**
   * Serializes EventsUnregisterPlayerPayload to protobuf.
   */
  encode: function(msg) {
    return EventsUnregisterPlayerPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsUnregisterPlayerPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsUnregisterPlayerPayload._readMessage(
      EventsUnregisterPlayerPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsUnregisterPlayerPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsUpdatePlayerSeatingFlagPayload = {
  /**
   * Serializes EventsUpdatePlayerSeatingFlagPayload to protobuf.
   */
  encode: function(msg) {
    return EventsUpdatePlayerSeatingFlagPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsUpdatePlayerSeatingFlagPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsUpdatePlayerSeatingFlagPayload._readMessage(
      EventsUpdatePlayerSeatingFlagPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsUpdatePlayerSeatingFlagPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ignoreSeating: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    if (msg.ignoreSeating) {
      writer.writeBool(3, msg.ignoreSeating);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 3: {
          msg.ignoreSeating = reader.readBool();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetAchievementsPayload = {
  /**
   * Serializes EventsGetAchievementsPayload to protobuf.
   */
  encode: function(msg) {
    return EventsGetAchievementsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetAchievementsPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsGetAchievementsPayload._readMessage(
      EventsGetAchievementsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetAchievementsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      achievementsList: [],
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.achievementsList?.length) {
      writer.writeRepeatedString(2, msg.achievementsList);
    }
    if (msg.eventId) {
      writer.writeInt32(3, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 2: {
          msg.achievementsList.push(reader.readString());
          break;
        }
        case 3: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetAchievementsResponse = {
  /**
   * Serializes EventsGetAchievementsResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetAchievementsResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetAchievementsResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetAchievementsResponse._readMessage(
      EventsGetAchievementsResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetAchievementsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      achievements: [],
      lastUpdate: "",
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.achievements?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.achievements,
        protoAtoms.Achievement._writeMessage
      );
    }
    if (msg.lastUpdate) {
      writer.writeString(2, msg.lastUpdate);
    }
    if (msg.players?.length) {
      writer.writeRepeatedMessage(
        3,
        msg.players,
        protoAtoms.PersonEx._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.Achievement.initialize();
          reader.readMessage(m, protoAtoms.Achievement._readMessage);
          msg.achievements.push(m);
          break;
        }
        case 2: {
          msg.lastUpdate = reader.readString();
          break;
        }
        case 3: {
          const m = protoAtoms.PersonEx.initialize();
          reader.readMessage(m, protoAtoms.PersonEx._readMessage);
          msg.players.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsUpdatePlayersLocalIdsPayload = {
  /**
   * Serializes EventsUpdatePlayersLocalIdsPayload to protobuf.
   */
  encode: function(msg) {
    return EventsUpdatePlayersLocalIdsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsUpdatePlayersLocalIdsPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsUpdatePlayersLocalIdsPayload._readMessage(
      EventsUpdatePlayersLocalIdsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsUpdatePlayersLocalIdsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      idsToLocalIds: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.idsToLocalIds?.length) {
      writer.writeRepeatedMessage(
        2,
        msg.idsToLocalIds,
        protoAtoms.LocalIdMapping._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          const m = protoAtoms.LocalIdMapping.initialize();
          reader.readMessage(m, protoAtoms.LocalIdMapping._readMessage);
          msg.idsToLocalIds.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsUpdatePlayerReplacementPayload = {
  /**
   * Serializes EventsUpdatePlayerReplacementPayload to protobuf.
   */
  encode: function(msg) {
    return EventsUpdatePlayerReplacementPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsUpdatePlayerReplacementPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsUpdatePlayerReplacementPayload._readMessage(
      EventsUpdatePlayerReplacementPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsUpdatePlayerReplacementPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      replacementId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    if (msg.replacementId) {
      writer.writeInt32(3, msg.replacementId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 3: {
          msg.replacementId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsUpdatePlayersTeamsPayload = {
  /**
   * Serializes EventsUpdatePlayersTeamsPayload to protobuf.
   */
  encode: function(msg) {
    return EventsUpdatePlayersTeamsPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsUpdatePlayersTeamsPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsUpdatePlayersTeamsPayload._readMessage(
      EventsUpdatePlayersTeamsPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsUpdatePlayersTeamsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      idsToTeamNames: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.idsToTeamNames?.length) {
      writer.writeRepeatedMessage(
        2,
        msg.idsToTeamNames,
        protoAtoms.TeamMapping._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          const m = protoAtoms.TeamMapping.initialize();
          reader.readMessage(m, protoAtoms.TeamMapping._readMessage);
          msg.idsToTeamNames.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesStartGamePayload = {
  /**
   * Serializes GamesStartGamePayload to protobuf.
   */
  encode: function(msg) {
    return GamesStartGamePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesStartGamePayload from protobuf.
   */
  decode: function(bytes) {
    return GamesStartGamePayload._readMessage(
      GamesStartGamePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesStartGamePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.players?.length) {
      writer.writePackedInt32(2, msg.players);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          if (reader.isDelimited()) {
            msg.players.push(...reader.readPackedInt32());
          } else {
            msg.players.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesDropLastRoundPayload = {
  /**
   * Serializes GamesDropLastRoundPayload to protobuf.
   */
  encode: function(msg) {
    return GamesDropLastRoundPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesDropLastRoundPayload from protobuf.
   */
  decode: function(bytes) {
    return GamesDropLastRoundPayload._readMessage(
      GamesDropLastRoundPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesDropLastRoundPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHash: "",
      intermediateResults: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessionHash) {
      writer.writeString(1, msg.sessionHash);
    }
    if (msg.intermediateResults?.length) {
      writer.writeRepeatedMessage(
        2,
        msg.intermediateResults,
        protoAtoms.IntermediateResultOfSession._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHash = reader.readString();
          break;
        }
        case 2: {
          const m = protoAtoms.IntermediateResultOfSession.initialize();
          reader.readMessage(
            m,
            protoAtoms.IntermediateResultOfSession._readMessage
          );
          msg.intermediateResults.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesAddPenaltyPayload = {
  /**
   * Serializes GamesAddPenaltyPayload to protobuf.
   */
  encode: function(msg) {
    return GamesAddPenaltyPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesAddPenaltyPayload from protobuf.
   */
  decode: function(bytes) {
    return GamesAddPenaltyPayload._readMessage(
      GamesAddPenaltyPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesAddPenaltyPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      playerId: 0,
      amount: 0,
      reason: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.playerId) {
      writer.writeInt32(2, msg.playerId);
    }
    if (msg.amount) {
      writer.writeInt32(3, msg.amount);
    }
    if (msg.reason) {
      writer.writeString(4, msg.reason);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.playerId = reader.readInt32();
          break;
        }
        case 3: {
          msg.amount = reader.readInt32();
          break;
        }
        case 4: {
          msg.reason = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GamesAddPenaltyGamePayload = {
  /**
   * Serializes GamesAddPenaltyGamePayload to protobuf.
   */
  encode: function(msg) {
    return GamesAddPenaltyGamePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GamesAddPenaltyGamePayload from protobuf.
   */
  decode: function(bytes) {
    return GamesAddPenaltyGamePayload._readMessage(
      GamesAddPenaltyGamePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GamesAddPenaltyGamePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.players?.length) {
      writer.writePackedInt32(2, msg.players);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          if (reader.isDelimited()) {
            msg.players.push(...reader.readPackedInt32());
          } else {
            msg.players.push(reader.readInt32());
          }
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetPlayerPayload = {
  /**
   * Serializes PlayersGetPlayerPayload to protobuf.
   */
  encode: function(msg) {
    return PlayersGetPlayerPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetPlayerPayload from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetPlayerPayload._readMessage(
      PlayersGetPlayerPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetPlayerPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.id) {
      writer.writeInt32(1, msg.id);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.id = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PlayersGetPlayerResponse = {
  /**
   * Serializes PlayersGetPlayerResponse to protobuf.
   */
  encode: function(msg) {
    return PlayersGetPlayerResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PlayersGetPlayerResponse from protobuf.
   */
  decode: function(bytes) {
    return PlayersGetPlayerResponse._readMessage(
      PlayersGetPlayerResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PlayersGetPlayerResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      players: protoAtoms.Player.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.players) {
      writer.writeMessage(1, msg.players, protoAtoms.Player._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          reader.readMessage(msg.players, protoAtoms.Player._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetCurrentSeatingResponse = {
  /**
   * Serializes EventsGetCurrentSeatingResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetCurrentSeatingResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetCurrentSeatingResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetCurrentSeatingResponse._readMessage(
      EventsGetCurrentSeatingResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetCurrentSeatingResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      seating: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.seating?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.seating,
        protoAtoms.PlayerSeating._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.PlayerSeating.initialize();
          reader.readMessage(m, protoAtoms.PlayerSeating._readMessage);
          msg.seating.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const SeatingMakeShuffledSeatingPayload = {
  /**
   * Serializes SeatingMakeShuffledSeatingPayload to protobuf.
   */
  encode: function(msg) {
    return SeatingMakeShuffledSeatingPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SeatingMakeShuffledSeatingPayload from protobuf.
   */
  decode: function(bytes) {
    return SeatingMakeShuffledSeatingPayload._readMessage(
      SeatingMakeShuffledSeatingPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes SeatingMakeShuffledSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      groupsCount: 0,
      seed: 0,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.groupsCount) {
      writer.writeInt32(2, msg.groupsCount);
    }
    if (msg.seed) {
      writer.writeInt32(3, msg.seed);
    }
    if (msg.windShuffleMode != void 0) {
      writer.writeEnum(
        4,
        protoAtoms.WindShuffleMode._toInt(msg.windShuffleMode)
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.groupsCount = reader.readInt32();
          break;
        }
        case 3: {
          msg.seed = reader.readInt32();
          break;
        }
        case 4: {
          msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(
            reader.readEnum()
          );
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const SeatingMakeSwissSeatingPayload = {
  /**
   * Serializes SeatingMakeSwissSeatingPayload to protobuf.
   */
  encode: function(msg) {
    return SeatingMakeSwissSeatingPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SeatingMakeSwissSeatingPayload from protobuf.
   */
  decode: function(bytes) {
    return SeatingMakeSwissSeatingPayload._readMessage(
      SeatingMakeSwissSeatingPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes SeatingMakeSwissSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.windShuffleMode != void 0) {
      writer.writeEnum(
        2,
        protoAtoms.WindShuffleMode._toInt(msg.windShuffleMode)
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(
            reader.readEnum()
          );
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const SeatingGenerateSwissSeatingPayload = {
  /**
   * Serializes SeatingGenerateSwissSeatingPayload to protobuf.
   */
  encode: function(msg) {
    return SeatingGenerateSwissSeatingPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SeatingGenerateSwissSeatingPayload from protobuf.
   */
  decode: function(bytes) {
    return SeatingGenerateSwissSeatingPayload._readMessage(
      SeatingGenerateSwissSeatingPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes SeatingGenerateSwissSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      substituteReplacementPlayers: false,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.substituteReplacementPlayers) {
      writer.writeBool(2, msg.substituteReplacementPlayers);
    }
    if (msg.windShuffleMode != void 0) {
      writer.writeEnum(
        3,
        protoAtoms.WindShuffleMode._toInt(msg.windShuffleMode)
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.substituteReplacementPlayers = reader.readBool();
          break;
        }
        case 3: {
          msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(
            reader.readEnum()
          );
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const SeatingGenerateSwissSeatingResponse = {
  /**
   * Serializes SeatingGenerateSwissSeatingResponse to protobuf.
   */
  encode: function(msg) {
    return SeatingGenerateSwissSeatingResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SeatingGenerateSwissSeatingResponse from protobuf.
   */
  decode: function(bytes) {
    return SeatingGenerateSwissSeatingResponse._readMessage(
      SeatingGenerateSwissSeatingResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes SeatingGenerateSwissSeatingResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      tables: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.tables?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.tables,
        protoAtoms.TableItemSwiss._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.TableItemSwiss.initialize();
          reader.readMessage(m, protoAtoms.TableItemSwiss._readMessage);
          msg.tables.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const SeatingMakeIntervalSeatingPayload = {
  /**
   * Serializes SeatingMakeIntervalSeatingPayload to protobuf.
   */
  encode: function(msg) {
    return SeatingMakeIntervalSeatingPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SeatingMakeIntervalSeatingPayload from protobuf.
   */
  decode: function(bytes) {
    return SeatingMakeIntervalSeatingPayload._readMessage(
      SeatingMakeIntervalSeatingPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes SeatingMakeIntervalSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      step: 0,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.step) {
      writer.writeInt32(2, msg.step);
    }
    if (msg.windShuffleMode != void 0) {
      writer.writeEnum(
        3,
        protoAtoms.WindShuffleMode._toInt(msg.windShuffleMode)
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.step = reader.readInt32();
          break;
        }
        case 3: {
          msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(
            reader.readEnum()
          );
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const SeatingMakePrescriptedSeatingPayload = {
  /**
   * Serializes SeatingMakePrescriptedSeatingPayload to protobuf.
   */
  encode: function(msg) {
    return SeatingMakePrescriptedSeatingPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes SeatingMakePrescriptedSeatingPayload from protobuf.
   */
  decode: function(bytes) {
    return SeatingMakePrescriptedSeatingPayload._readMessage(
      SeatingMakePrescriptedSeatingPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes SeatingMakePrescriptedSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.windShuffleMode != void 0) {
      writer.writeEnum(
        3,
        protoAtoms.WindShuffleMode._toInt(msg.windShuffleMode)
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 3: {
          msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(
            reader.readEnum()
          );
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetPrescriptedEventConfigResponse = {
  /**
   * Serializes EventsGetPrescriptedEventConfigResponse to protobuf.
   */
  encode: function(msg) {
    return EventsGetPrescriptedEventConfigResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsGetPrescriptedEventConfigResponse from protobuf.
   */
  decode: function(bytes) {
    return EventsGetPrescriptedEventConfigResponse._readMessage(
      EventsGetPrescriptedEventConfigResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsGetPrescriptedEventConfigResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      nextSessionIndex: 0,
      prescript: void 0,
      errors: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.nextSessionIndex) {
      writer.writeInt32(2, msg.nextSessionIndex);
    }
    if (msg.prescript != void 0) {
      writer.writeString(3, msg.prescript);
    }
    if (msg.errors?.length) {
      writer.writeRepeatedString(4, msg.errors);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.nextSessionIndex = reader.readInt32();
          break;
        }
        case 3: {
          msg.prescript = reader.readString();
          break;
        }
        case 4: {
          msg.errors.push(reader.readString());
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsUpdatePrescriptedEventConfigPayload = {
  /**
   * Serializes EventsUpdatePrescriptedEventConfigPayload to protobuf.
   */
  encode: function(msg) {
    return EventsUpdatePrescriptedEventConfigPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes EventsUpdatePrescriptedEventConfigPayload from protobuf.
   */
  decode: function(bytes) {
    return EventsUpdatePrescriptedEventConfigPayload._readMessage(
      EventsUpdatePrescriptedEventConfigPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes EventsUpdatePrescriptedEventConfigPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      nextSessionIndex: 0,
      prescript: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.nextSessionIndex) {
      writer.writeInt32(2, msg.nextSessionIndex);
    }
    if (msg.prescript) {
      writer.writeString(3, msg.prescript);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.nextSessionIndex = reader.readInt32();
          break;
        }
        case 3: {
          msg.prescript = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const ClearStatCachePayload = {
  /**
   * Serializes ClearStatCachePayload to protobuf.
   */
  encode: function(msg) {
    return ClearStatCachePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes ClearStatCachePayload from protobuf.
   */
  decode: function(bytes) {
    return ClearStatCachePayload._readMessage(
      ClearStatCachePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes ClearStatCachePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.playerId) {
      writer.writeInt32(1, msg.playerId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.playerId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const TypedGamesAddOnlineReplayPayload = {
  /**
   * Serializes TypedGamesAddOnlineReplayPayload to protobuf.
   */
  encode: function(msg) {
    return TypedGamesAddOnlineReplayPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes TypedGamesAddOnlineReplayPayload from protobuf.
   */
  decode: function(bytes) {
    return TypedGamesAddOnlineReplayPayload._readMessage(
      TypedGamesAddOnlineReplayPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes TypedGamesAddOnlineReplayPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      platformId: protoAtoms.PlatformType._fromInt(0),
      contentType: 0,
      logTimestamp: 0,
      replayHash: "",
      content: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.platformId && protoAtoms.PlatformType._toInt(msg.platformId)) {
      writer.writeEnum(2, protoAtoms.PlatformType._toInt(msg.platformId));
    }
    if (msg.contentType) {
      writer.writeInt32(3, msg.contentType);
    }
    if (msg.logTimestamp) {
      writer.writeInt32(4, msg.logTimestamp);
    }
    if (msg.replayHash) {
      writer.writeString(5, msg.replayHash);
    }
    if (msg.content) {
      writer.writeString(6, msg.content);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.platformId = protoAtoms.PlatformType._fromInt(reader.readEnum());
          break;
        }
        case 3: {
          msg.contentType = reader.readInt32();
          break;
        }
        case 4: {
          msg.logTimestamp = reader.readInt32();
          break;
        }
        case 5: {
          msg.replayHash = reader.readString();
          break;
        }
        case 6: {
          msg.content = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const CallRefereePayload = {
  /**
   * Serializes CallRefereePayload to protobuf.
   */
  encode: function(msg) {
    return CallRefereePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes CallRefereePayload from protobuf.
   */
  decode: function(bytes) {
    return CallRefereePayload._readMessage(
      CallRefereePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes CallRefereePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      tableIndex: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.tableIndex) {
      writer.writeInt32(1, msg.tableIndex);
    }
    if (msg.eventId) {
      writer.writeInt32(2, msg.eventId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.tableIndex = reader.readInt32();
          break;
        }
        case 2: {
          msg.eventId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const PenaltiesResponse = {
  /**
   * Serializes PenaltiesResponse to protobuf.
   */
  encode: function(msg) {
    return PenaltiesResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes PenaltiesResponse from protobuf.
   */
  decode: function(bytes) {
    return PenaltiesResponse._readMessage(
      PenaltiesResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes PenaltiesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      penalties: [],
      referees: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.penalties?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.penalties,
        protoAtoms.Penalty._writeMessage
      );
    }
    if (msg.referees?.length) {
      writer.writeRepeatedMessage(
        2,
        msg.referees,
        protoAtoms.Player._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.Penalty.initialize();
          reader.readMessage(m, protoAtoms.Penalty._readMessage);
          msg.penalties.push(m);
          break;
        }
        case 2: {
          const m = protoAtoms.Player.initialize();
          reader.readMessage(m, protoAtoms.Player._readMessage);
          msg.referees.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const CancelPenaltyPayload = {
  /**
   * Serializes CancelPenaltyPayload to protobuf.
   */
  encode: function(msg) {
    return CancelPenaltyPayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes CancelPenaltyPayload from protobuf.
   */
  decode: function(bytes) {
    return CancelPenaltyPayload._readMessage(
      CancelPenaltyPayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes CancelPenaltyPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      penaltyId: 0,
      reason: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.penaltyId) {
      writer.writeInt32(1, msg.penaltyId);
    }
    if (msg.reason != void 0) {
      writer.writeString(2, msg.reason);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.penaltyId = reader.readInt32();
          break;
        }
        case 2: {
          msg.reason = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const AddExtraTimePayload = {
  /**
   * Serializes AddExtraTimePayload to protobuf.
   */
  encode: function(msg) {
    return AddExtraTimePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes AddExtraTimePayload from protobuf.
   */
  decode: function(bytes) {
    return AddExtraTimePayload._readMessage(
      AddExtraTimePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes AddExtraTimePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHashList: [],
      extraTime: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessionHashList?.length) {
      writer.writeRepeatedString(1, msg.sessionHashList);
    }
    if (msg.extraTime) {
      writer.writeInt32(2, msg.extraTime);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.sessionHashList.push(reader.readString());
          break;
        }
        case 2: {
          msg.extraTime = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GetCurrentStatePayload = {
  /**
   * Serializes GetCurrentStatePayload to protobuf.
   */
  encode: function(msg) {
    return GetCurrentStatePayload._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GetCurrentStatePayload from protobuf.
   */
  decode: function(bytes) {
    return GetCurrentStatePayload._readMessage(
      GetCurrentStatePayload.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GetCurrentStatePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      playerId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.eventId) {
      writer.writeInt32(1, msg.eventId);
    }
    if (msg.playerId) {
      writer.writeInt32(2, msg.playerId);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.eventId = reader.readInt32();
          break;
        }
        case 2: {
          msg.playerId = reader.readInt32();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const GetCurrentStateResponse = {
  /**
   * Serializes GetCurrentStateResponse to protobuf.
   */
  encode: function(msg) {
    return GetCurrentStateResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes GetCurrentStateResponse from protobuf.
   */
  decode: function(bytes) {
    return GetCurrentStateResponse._readMessage(
      GetCurrentStateResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes GetCurrentStateResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessions: [],
      config: protoAtoms.GameConfig.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.sessions?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.sessions,
        CurrentSession._writeMessage
      );
    }
    if (msg.config) {
      writer.writeMessage(2, msg.config, protoAtoms.GameConfig._writeMessage);
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = CurrentSession.initialize();
          reader.readMessage(m, CurrentSession._readMessage);
          msg.sessions.push(m);
          break;
        }
        case 2: {
          reader.readMessage(msg.config, protoAtoms.GameConfig._readMessage);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const ChomboResponse = {
  /**
   * Serializes ChomboResponse to protobuf.
   */
  encode: function(msg) {
    return ChomboResponse._writeMessage(
      msg,
      new protoscript.BinaryWriter()
    ).getResultBuffer();
  },
  /**
   * Deserializes ChomboResponse from protobuf.
   */
  decode: function(bytes) {
    return ChomboResponse._readMessage(
      ChomboResponse.initialize(),
      new protoscript.BinaryReader(bytes)
    );
  },
  /**
   * Initializes ChomboResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      chombos: [],
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg, writer) {
    if (msg.chombos?.length) {
      writer.writeRepeatedMessage(
        1,
        msg.chombos,
        protoAtoms.Chombo._writeMessage
      );
    }
    if (msg.players?.length) {
      writer.writeRepeatedMessage(
        2,
        msg.players,
        protoAtoms.Player._writeMessage
      );
    }
    return writer;
  },
  /**
   * @private
   */
  _readMessage: function(msg, reader) {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          const m = protoAtoms.Chombo.initialize();
          reader.readMessage(m, protoAtoms.Chombo._readMessage);
          msg.chombos.push(m);
          break;
        }
        case 2: {
          const m = protoAtoms.Player.initialize();
          reader.readMessage(m, protoAtoms.Player._readMessage);
          msg.players.push(m);
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  }
};
export const EventsGetRulesetsPayloadJSON = {
  /**
   * Serializes EventsGetRulesetsPayload to JSON.
   */
  encode: function(_msg) {
    return "{}";
  },
  /**
   * Deserializes EventsGetRulesetsPayload from JSON.
   */
  decode: function(_json) {
    return {};
  },
  /**
   * Initializes EventsGetRulesetsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(_msg) {
    return {};
  },
  /**
   * @private
   */
  _readMessage: function(msg, _json) {
    return msg;
  }
};
export const EventsGetRulesetsResponseJSON = {
  /**
   * Serializes EventsGetRulesetsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetRulesetsResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetRulesetsResponse from JSON.
   */
  decode: function(json) {
    return EventsGetRulesetsResponseJSON._readMessage(
      EventsGetRulesetsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetRulesetsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      rulesets: [],
      rulesetIds: [],
      rulesetTitles: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.rulesets?.length) {
      json["rulesets"] = msg.rulesets.map(
        protoAtoms.RulesetConfigJSON._writeMessage
      );
    }
    if (msg.rulesetIds?.length) {
      json["rulesetIds"] = msg.rulesetIds;
    }
    if (msg.rulesetTitles?.length) {
      json["rulesetTitles"] = msg.rulesetTitles;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _rulesets_ = json["rulesets"];
    if (_rulesets_) {
      for (const item of _rulesets_) {
        const m = protoAtoms.RulesetConfigJSON.initialize();
        protoAtoms.RulesetConfigJSON._readMessage(m, item);
        msg.rulesets.push(m);
      }
    }
    const _rulesetIds_ = json["rulesetIds"] ?? json["ruleset_ids"];
    if (_rulesetIds_) {
      msg.rulesetIds = _rulesetIds_;
    }
    const _rulesetTitles_ = json["rulesetTitles"] ?? json["ruleset_titles"];
    if (_rulesetTitles_) {
      msg.rulesetTitles = _rulesetTitles_;
    }
    return msg;
  }
};
export const EventsGetEventsPayloadJSON = {
  /**
   * Serializes EventsGetEventsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetEventsPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetEventsPayload from JSON.
   */
  decode: function(json) {
    return EventsGetEventsPayloadJSON._readMessage(
      EventsGetEventsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetEventsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      limit: 0,
      offset: 0,
      filterUnlisted: false,
      filter: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.limit) {
      json["limit"] = msg.limit;
    }
    if (msg.offset) {
      json["offset"] = msg.offset;
    }
    if (msg.filterUnlisted) {
      json["filterUnlisted"] = msg.filterUnlisted;
    }
    if (msg.filter) {
      json["filter"] = msg.filter;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _limit_ = json["limit"];
    if (_limit_) {
      msg.limit = protoscript.parseNumber(_limit_);
    }
    const _offset_ = json["offset"];
    if (_offset_) {
      msg.offset = protoscript.parseNumber(_offset_);
    }
    const _filterUnlisted_ = json["filterUnlisted"] ?? json["filter_unlisted"];
    if (_filterUnlisted_) {
      msg.filterUnlisted = _filterUnlisted_;
    }
    const _filter_ = json["filter"];
    if (_filter_) {
      msg.filter = _filter_;
    }
    return msg;
  }
};
export const EventsGetEventsResponseJSON = {
  /**
   * Serializes EventsGetEventsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetEventsResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetEventsResponse from JSON.
   */
  decode: function(json) {
    return EventsGetEventsResponseJSON._readMessage(
      EventsGetEventsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetEventsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      total: 0,
      events: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.total) {
      json["total"] = msg.total;
    }
    if (msg.events?.length) {
      json["events"] = msg.events.map(protoAtoms.EventJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _total_ = json["total"];
    if (_total_) {
      msg.total = protoscript.parseNumber(_total_);
    }
    const _events_ = json["events"];
    if (_events_) {
      for (const item of _events_) {
        const m = protoAtoms.EventJSON.initialize();
        protoAtoms.EventJSON._readMessage(m, item);
        msg.events.push(m);
      }
    }
    return msg;
  }
};
export const EventsGetEventsByIdPayloadJSON = {
  /**
   * Serializes EventsGetEventsByIdPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetEventsByIdPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetEventsByIdPayload from JSON.
   */
  decode: function(json) {
    return EventsGetEventsByIdPayloadJSON._readMessage(
      EventsGetEventsByIdPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetEventsByIdPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ids: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ids?.length) {
      json["ids"] = msg.ids;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ids_ = json["ids"];
    if (_ids_) {
      msg.ids = _ids_.map(protoscript.parseNumber);
    }
    return msg;
  }
};
export const EventsGetEventsByIdResponseJSON = {
  /**
   * Serializes EventsGetEventsByIdResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetEventsByIdResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetEventsByIdResponse from JSON.
   */
  decode: function(json) {
    return EventsGetEventsByIdResponseJSON._readMessage(
      EventsGetEventsByIdResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetEventsByIdResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      events: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.events?.length) {
      json["events"] = msg.events.map(protoAtoms.EventJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _events_ = json["events"];
    if (_events_) {
      for (const item of _events_) {
        const m = protoAtoms.EventJSON.initialize();
        protoAtoms.EventJSON._readMessage(m, item);
        msg.events.push(m);
      }
    }
    return msg;
  }
};
export const PlayersGetMyEventsPayloadJSON = {
  /**
   * Serializes PlayersGetMyEventsPayload to JSON.
   */
  encode: function(_msg) {
    return "{}";
  },
  /**
   * Deserializes PlayersGetMyEventsPayload from JSON.
   */
  decode: function(_json) {
    return {};
  },
  /**
   * Initializes PlayersGetMyEventsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(_msg) {
    return {};
  },
  /**
   * @private
   */
  _readMessage: function(msg, _json) {
    return msg;
  }
};
export const PlayersGetMyEventsResponseJSON = {
  /**
   * Serializes PlayersGetMyEventsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetMyEventsResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetMyEventsResponse from JSON.
   */
  decode: function(json) {
    return PlayersGetMyEventsResponseJSON._readMessage(
      PlayersGetMyEventsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetMyEventsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      events: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.events?.length) {
      json["events"] = msg.events.map(protoAtoms.MyEventJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _events_ = json["events"];
    if (_events_) {
      for (const item of _events_) {
        const m = protoAtoms.MyEventJSON.initialize();
        protoAtoms.MyEventJSON._readMessage(m, item);
        msg.events.push(m);
      }
    }
    return msg;
  }
};
export const EventsGetRatingTablePayloadJSON = {
  /**
   * Serializes EventsGetRatingTablePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetRatingTablePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetRatingTablePayload from JSON.
   */
  decode: function(json) {
    return EventsGetRatingTablePayloadJSON._readMessage(
      EventsGetRatingTablePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetRatingTablePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventIdList: [],
      orderBy: "",
      order: "",
      onlyMinGames: void 0,
      dateFrom: void 0,
      dateTo: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventIdList?.length) {
      json["eventIdList"] = msg.eventIdList;
    }
    if (msg.orderBy) {
      json["orderBy"] = msg.orderBy;
    }
    if (msg.order) {
      json["order"] = msg.order;
    }
    if (msg.onlyMinGames != void 0) {
      json["onlyMinGames"] = msg.onlyMinGames;
    }
    if (msg.dateFrom != void 0) {
      json["dateFrom"] = msg.dateFrom;
    }
    if (msg.dateTo != void 0) {
      json["dateTo"] = msg.dateTo;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventIdList_ = json["eventIdList"] ?? json["event_id_list"];
    if (_eventIdList_) {
      msg.eventIdList = _eventIdList_.map(protoscript.parseNumber);
    }
    const _orderBy_ = json["orderBy"] ?? json["order_by"];
    if (_orderBy_) {
      msg.orderBy = _orderBy_;
    }
    const _order_ = json["order"];
    if (_order_) {
      msg.order = _order_;
    }
    const _onlyMinGames_ = json["onlyMinGames"] ?? json["only_min_games"];
    if (_onlyMinGames_) {
      msg.onlyMinGames = _onlyMinGames_;
    }
    const _dateFrom_ = json["dateFrom"] ?? json["date_from"];
    if (_dateFrom_) {
      msg.dateFrom = _dateFrom_;
    }
    const _dateTo_ = json["dateTo"] ?? json["date_to"];
    if (_dateTo_) {
      msg.dateTo = _dateTo_;
    }
    return msg;
  }
};
export const EventsGetRatingTableResponseJSON = {
  /**
   * Serializes EventsGetRatingTableResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetRatingTableResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetRatingTableResponse from JSON.
   */
  decode: function(json) {
    return EventsGetRatingTableResponseJSON._readMessage(
      EventsGetRatingTableResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetRatingTableResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      list: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.list?.length) {
      json["list"] = msg.list.map(protoAtoms.PlayerInRatingJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _list_ = json["list"];
    if (_list_) {
      for (const item of _list_) {
        const m = protoAtoms.PlayerInRatingJSON.initialize();
        protoAtoms.PlayerInRatingJSON._readMessage(m, item);
        msg.list.push(m);
      }
    }
    return msg;
  }
};
export const EventsGetLastGamesPayloadJSON = {
  /**
   * Serializes EventsGetLastGamesPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetLastGamesPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetLastGamesPayload from JSON.
   */
  decode: function(json) {
    return EventsGetLastGamesPayloadJSON._readMessage(
      EventsGetLastGamesPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetLastGamesPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventIdList: [],
      limit: 0,
      offset: 0,
      orderBy: void 0,
      order: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventIdList?.length) {
      json["eventIdList"] = msg.eventIdList;
    }
    if (msg.limit) {
      json["limit"] = msg.limit;
    }
    if (msg.offset) {
      json["offset"] = msg.offset;
    }
    if (msg.orderBy != void 0) {
      json["orderBy"] = msg.orderBy;
    }
    if (msg.order != void 0) {
      json["order"] = msg.order;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventIdList_ = json["eventIdList"] ?? json["event_id_list"];
    if (_eventIdList_) {
      msg.eventIdList = _eventIdList_.map(protoscript.parseNumber);
    }
    const _limit_ = json["limit"];
    if (_limit_) {
      msg.limit = protoscript.parseNumber(_limit_);
    }
    const _offset_ = json["offset"];
    if (_offset_) {
      msg.offset = protoscript.parseNumber(_offset_);
    }
    const _orderBy_ = json["orderBy"] ?? json["order_by"];
    if (_orderBy_) {
      msg.orderBy = _orderBy_;
    }
    const _order_ = json["order"];
    if (_order_) {
      msg.order = _order_;
    }
    return msg;
  }
};
export const EventsGetLastGamesResponseJSON = {
  /**
   * Serializes EventsGetLastGamesResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetLastGamesResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetLastGamesResponse from JSON.
   */
  decode: function(json) {
    return EventsGetLastGamesResponseJSON._readMessage(
      EventsGetLastGamesResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetLastGamesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      games: [],
      totalGames: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.games?.length) {
      json["games"] = msg.games.map(protoAtoms.GameResultJSON._writeMessage);
    }
    if (msg.totalGames) {
      json["totalGames"] = msg.totalGames;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _games_ = json["games"];
    if (_games_) {
      for (const item of _games_) {
        const m = protoAtoms.GameResultJSON.initialize();
        protoAtoms.GameResultJSON._readMessage(m, item);
        msg.games.push(m);
      }
    }
    const _totalGames_ = json["totalGames"] ?? json["total_games"];
    if (_totalGames_) {
      msg.totalGames = protoscript.parseNumber(_totalGames_);
    }
    return msg;
  }
};
export const EventsGetGameResponseJSON = {
  /**
   * Serializes EventsGetGameResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetGameResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetGameResponse from JSON.
   */
  decode: function(json) {
    return EventsGetGameResponseJSON._readMessage(
      EventsGetGameResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetGameResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      game: protoAtoms.GameResultJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.game) {
      const _game_ = protoAtoms.GameResultJSON._writeMessage(msg.game);
      if (Object.keys(_game_).length > 0) {
        json["game"] = _game_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _game_ = json["game"];
    if (_game_) {
      protoAtoms.GameResultJSON._readMessage(msg.game, _game_);
    }
    return msg;
  }
};
export const EventsGetGamesSeriesResponseJSON = {
  /**
   * Serializes EventsGetGamesSeriesResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetGamesSeriesResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetGamesSeriesResponse from JSON.
   */
  decode: function(json) {
    return EventsGetGamesSeriesResponseJSON._readMessage(
      EventsGetGamesSeriesResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetGamesSeriesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      results: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.results?.length) {
      json["results"] = msg.results.map(
        protoAtoms.SeriesResultJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _results_ = json["results"];
    if (_results_) {
      for (const item of _results_) {
        const m = protoAtoms.SeriesResultJSON.initialize();
        protoAtoms.SeriesResultJSON._readMessage(m, item);
        msg.results.push(m);
      }
    }
    return msg;
  }
};
export const PlayersGetCurrentSessionsPayloadJSON = {
  /**
   * Serializes PlayersGetCurrentSessionsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PlayersGetCurrentSessionsPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PlayersGetCurrentSessionsPayload from JSON.
   */
  decode: function(json) {
    return PlayersGetCurrentSessionsPayloadJSON._readMessage(
      PlayersGetCurrentSessionsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetCurrentSessionsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const CurrentSessionJSON = {
  /**
   * Serializes CurrentSession to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(CurrentSessionJSON._writeMessage(msg));
  },
  /**
   * Deserializes CurrentSession from JSON.
   */
  decode: function(json) {
    return CurrentSessionJSON._readMessage(
      CurrentSessionJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes CurrentSession with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHash: "",
      status: "",
      tableIndex: void 0,
      players: [],
      timerState: EventsGetTimerStateResponseJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.sessionHash) {
      json["sessionHash"] = msg.sessionHash;
    }
    if (msg.status) {
      json["status"] = msg.status;
    }
    if (msg.tableIndex != void 0) {
      json["tableIndex"] = msg.tableIndex;
    }
    if (msg.players?.length) {
      json["players"] = msg.players.map(
        protoAtoms.PlayerInSessionJSON._writeMessage
      );
    }
    if (msg.timerState) {
      const _timerState_ = EventsGetTimerStateResponseJSON._writeMessage(
        msg.timerState
      );
      if (Object.keys(_timerState_).length > 0) {
        json["timerState"] = _timerState_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _sessionHash_ = json["sessionHash"] ?? json["session_hash"];
    if (_sessionHash_) {
      msg.sessionHash = _sessionHash_;
    }
    const _status_ = json["status"];
    if (_status_) {
      msg.status = _status_;
    }
    const _tableIndex_ = json["tableIndex"] ?? json["table_index"];
    if (_tableIndex_) {
      msg.tableIndex = protoscript.parseNumber(_tableIndex_);
    }
    const _players_ = json["players"];
    if (_players_) {
      for (const item of _players_) {
        const m = protoAtoms.PlayerInSessionJSON.initialize();
        protoAtoms.PlayerInSessionJSON._readMessage(m, item);
        msg.players.push(m);
      }
    }
    const _timerState_ = json["timerState"] ?? json["timer_state"];
    if (_timerState_) {
      EventsGetTimerStateResponseJSON._readMessage(
        msg.timerState,
        _timerState_
      );
    }
    return msg;
  }
};
export const PlayersGetCurrentSessionsResponseJSON = {
  /**
   * Serializes PlayersGetCurrentSessionsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PlayersGetCurrentSessionsResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PlayersGetCurrentSessionsResponse from JSON.
   */
  decode: function(json) {
    return PlayersGetCurrentSessionsResponseJSON._readMessage(
      PlayersGetCurrentSessionsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetCurrentSessionsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessions: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.sessions?.length) {
      json["sessions"] = msg.sessions.map(CurrentSessionJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _sessions_ = json["sessions"];
    if (_sessions_) {
      for (const item of _sessions_) {
        const m = CurrentSessionJSON.initialize();
        CurrentSessionJSON._readMessage(m, item);
        msg.sessions.push(m);
      }
    }
    return msg;
  }
};
export const EventsGetAllRegisteredPlayersPayloadJSON = {
  /**
   * Serializes EventsGetAllRegisteredPlayersPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsGetAllRegisteredPlayersPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsGetAllRegisteredPlayersPayload from JSON.
   */
  decode: function(json) {
    return EventsGetAllRegisteredPlayersPayloadJSON._readMessage(
      EventsGetAllRegisteredPlayersPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetAllRegisteredPlayersPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventIds: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventIds?.length) {
      json["eventIds"] = msg.eventIds;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventIds_ = json["eventIds"] ?? json["event_ids"];
    if (_eventIds_) {
      msg.eventIds = _eventIds_.map(protoscript.parseNumber);
    }
    return msg;
  }
};
export const EventsGetAllRegisteredPlayersResponseJSON = {
  /**
   * Serializes EventsGetAllRegisteredPlayersResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsGetAllRegisteredPlayersResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsGetAllRegisteredPlayersResponse from JSON.
   */
  decode: function(json) {
    return EventsGetAllRegisteredPlayersResponseJSON._readMessage(
      EventsGetAllRegisteredPlayersResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetAllRegisteredPlayersResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.players?.length) {
      json["players"] = msg.players.map(
        protoAtoms.RegisteredPlayerJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _players_ = json["players"];
    if (_players_) {
      for (const item of _players_) {
        const m = protoAtoms.RegisteredPlayerJSON.initialize();
        protoAtoms.RegisteredPlayerJSON._readMessage(m, item);
        msg.players.push(m);
      }
    }
    return msg;
  }
};
export const EventsGetTimerStateResponseJSON = {
  /**
   * Serializes EventsGetTimerStateResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetTimerStateResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetTimerStateResponse from JSON.
   */
  decode: function(json) {
    return EventsGetTimerStateResponseJSON._readMessage(
      EventsGetTimerStateResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetTimerStateResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      started: false,
      finished: false,
      timeRemaining: 0,
      waitingForTimer: false,
      hideSeatingAfter: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.started) {
      json["started"] = msg.started;
    }
    if (msg.finished) {
      json["finished"] = msg.finished;
    }
    if (msg.timeRemaining) {
      json["timeRemaining"] = msg.timeRemaining;
    }
    if (msg.waitingForTimer) {
      json["waitingForTimer"] = msg.waitingForTimer;
    }
    if (msg.hideSeatingAfter) {
      json["hideSeatingAfter"] = msg.hideSeatingAfter;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _started_ = json["started"];
    if (_started_) {
      msg.started = _started_;
    }
    const _finished_ = json["finished"];
    if (_finished_) {
      msg.finished = _finished_;
    }
    const _timeRemaining_ = json["timeRemaining"] ?? json["time_remaining"];
    if (_timeRemaining_) {
      msg.timeRemaining = protoscript.parseNumber(_timeRemaining_);
    }
    const _waitingForTimer_ = json["waitingForTimer"] ?? json["waiting_for_timer"];
    if (_waitingForTimer_) {
      msg.waitingForTimer = _waitingForTimer_;
    }
    const _hideSeatingAfter_ = json["hideSeatingAfter"] ?? json["hide_seating_after"];
    if (_hideSeatingAfter_) {
      msg.hideSeatingAfter = protoscript.parseNumber(_hideSeatingAfter_);
    }
    return msg;
  }
};
export const GamesGetSessionOverviewResponseJSON = {
  /**
   * Serializes GamesGetSessionOverviewResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      GamesGetSessionOverviewResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes GamesGetSessionOverviewResponse from JSON.
   */
  decode: function(json) {
    return GamesGetSessionOverviewResponseJSON._readMessage(
      GamesGetSessionOverviewResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesGetSessionOverviewResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      eventId: 0,
      tableIndex: void 0,
      players: [],
      state: protoAtoms.SessionStateJSON.initialize(),
      timerState: EventsGetTimerStateResponseJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.id) {
      json["id"] = msg.id;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.tableIndex != void 0) {
      json["tableIndex"] = msg.tableIndex;
    }
    if (msg.players?.length) {
      json["players"] = msg.players.map(
        protoAtoms.PlayerInSessionJSON._writeMessage
      );
    }
    if (msg.state) {
      const _state_ = protoAtoms.SessionStateJSON._writeMessage(msg.state);
      if (Object.keys(_state_).length > 0) {
        json["state"] = _state_;
      }
    }
    if (msg.timerState) {
      const _timerState_ = EventsGetTimerStateResponseJSON._writeMessage(
        msg.timerState
      );
      if (Object.keys(_timerState_).length > 0) {
        json["timerState"] = _timerState_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _id_ = json["id"];
    if (_id_) {
      msg.id = protoscript.parseNumber(_id_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _tableIndex_ = json["tableIndex"] ?? json["table_index"];
    if (_tableIndex_) {
      msg.tableIndex = protoscript.parseNumber(_tableIndex_);
    }
    const _players_ = json["players"];
    if (_players_) {
      for (const item of _players_) {
        const m = protoAtoms.PlayerInSessionJSON.initialize();
        protoAtoms.PlayerInSessionJSON._readMessage(m, item);
        msg.players.push(m);
      }
    }
    const _state_ = json["state"];
    if (_state_) {
      protoAtoms.SessionStateJSON._readMessage(msg.state, _state_);
    }
    const _timerState_ = json["timerState"] ?? json["timer_state"];
    if (_timerState_) {
      EventsGetTimerStateResponseJSON._readMessage(
        msg.timerState,
        _timerState_
      );
    }
    return msg;
  }
};
export const PlayersGetPlayerStatsPayloadJSON = {
  /**
   * Serializes PlayersGetPlayerStatsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetPlayerStatsPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetPlayerStatsPayload from JSON.
   */
  decode: function(json) {
    return PlayersGetPlayerStatsPayloadJSON._readMessage(
      PlayersGetPlayerStatsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetPlayerStatsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventIdList: [],
      dateFrom: void 0,
      dateTo: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.eventIdList?.length) {
      json["eventIdList"] = msg.eventIdList;
    }
    if (msg.dateFrom != void 0) {
      json["dateFrom"] = msg.dateFrom;
    }
    if (msg.dateTo != void 0) {
      json["dateTo"] = msg.dateTo;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _eventIdList_ = json["eventIdList"] ?? json["event_id_list"];
    if (_eventIdList_) {
      msg.eventIdList = _eventIdList_.map(protoscript.parseNumber);
    }
    const _dateFrom_ = json["dateFrom"] ?? json["date_from"];
    if (_dateFrom_) {
      msg.dateFrom = _dateFrom_;
    }
    const _dateTo_ = json["dateTo"] ?? json["date_to"];
    if (_dateTo_) {
      msg.dateTo = _dateTo_;
    }
    return msg;
  }
};
export const PlayersGetPlayerStatsResponseJSON = {
  /**
   * Serializes PlayersGetPlayerStatsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetPlayerStatsResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetPlayerStatsResponse from JSON.
   */
  decode: function(json) {
    return PlayersGetPlayerStatsResponseJSON._readMessage(
      PlayersGetPlayerStatsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetPlayerStatsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      ratingHistory: [],
      scoreHistory: [],
      playersInfo: [],
      placesSummary: [],
      totalPlayedGames: 0,
      totalPlayedRounds: 0,
      winSummary: protoAtoms.PlayerWinSummaryJSON.initialize(),
      handsValueSummary: [],
      yakuSummary: [],
      riichiSummary: protoAtoms.RiichiSummaryJSON.initialize(),
      doraStat: protoAtoms.DoraSummaryJSON.initialize(),
      lastUpdate: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.ratingHistory?.length) {
      json["ratingHistory"] = msg.ratingHistory;
    }
    if (msg.scoreHistory?.length) {
      json["scoreHistory"] = msg.scoreHistory.map(
        protoAtoms.SessionHistoryResultTableJSON._writeMessage
      );
    }
    if (msg.playersInfo?.length) {
      json["playersInfo"] = msg.playersInfo.map(
        protoAtoms.PlayerJSON._writeMessage
      );
    }
    if (msg.placesSummary?.length) {
      json["placesSummary"] = msg.placesSummary.map(
        protoAtoms.PlacesSummaryItemJSON._writeMessage
      );
    }
    if (msg.totalPlayedGames) {
      json["totalPlayedGames"] = msg.totalPlayedGames;
    }
    if (msg.totalPlayedRounds) {
      json["totalPlayedRounds"] = msg.totalPlayedRounds;
    }
    if (msg.winSummary) {
      const _winSummary_ = protoAtoms.PlayerWinSummaryJSON._writeMessage(
        msg.winSummary
      );
      if (Object.keys(_winSummary_).length > 0) {
        json["winSummary"] = _winSummary_;
      }
    }
    if (msg.handsValueSummary?.length) {
      json["handsValueSummary"] = msg.handsValueSummary.map(
        protoAtoms.HandValueStatJSON._writeMessage
      );
    }
    if (msg.yakuSummary?.length) {
      json["yakuSummary"] = msg.yakuSummary.map(
        protoAtoms.YakuStatJSON._writeMessage
      );
    }
    if (msg.riichiSummary) {
      const _riichiSummary_ = protoAtoms.RiichiSummaryJSON._writeMessage(
        msg.riichiSummary
      );
      if (Object.keys(_riichiSummary_).length > 0) {
        json["riichiSummary"] = _riichiSummary_;
      }
    }
    if (msg.doraStat) {
      const _doraStat_ = protoAtoms.DoraSummaryJSON._writeMessage(msg.doraStat);
      if (Object.keys(_doraStat_).length > 0) {
        json["doraStat"] = _doraStat_;
      }
    }
    if (msg.lastUpdate) {
      json["lastUpdate"] = msg.lastUpdate;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _ratingHistory_ = json["ratingHistory"] ?? json["rating_history"];
    if (_ratingHistory_) {
      msg.ratingHistory = _ratingHistory_.map(protoscript.parseNumber);
    }
    const _scoreHistory_ = json["scoreHistory"] ?? json["score_history"];
    if (_scoreHistory_) {
      for (const item of _scoreHistory_) {
        const m = protoAtoms.SessionHistoryResultTableJSON.initialize();
        protoAtoms.SessionHistoryResultTableJSON._readMessage(m, item);
        msg.scoreHistory.push(m);
      }
    }
    const _playersInfo_ = json["playersInfo"] ?? json["players_info"];
    if (_playersInfo_) {
      for (const item of _playersInfo_) {
        const m = protoAtoms.PlayerJSON.initialize();
        protoAtoms.PlayerJSON._readMessage(m, item);
        msg.playersInfo.push(m);
      }
    }
    const _placesSummary_ = json["placesSummary"] ?? json["places_summary"];
    if (_placesSummary_) {
      for (const item of _placesSummary_) {
        const m = protoAtoms.PlacesSummaryItemJSON.initialize();
        protoAtoms.PlacesSummaryItemJSON._readMessage(m, item);
        msg.placesSummary.push(m);
      }
    }
    const _totalPlayedGames_ = json["totalPlayedGames"] ?? json["total_played_games"];
    if (_totalPlayedGames_) {
      msg.totalPlayedGames = protoscript.parseNumber(_totalPlayedGames_);
    }
    const _totalPlayedRounds_ = json["totalPlayedRounds"] ?? json["total_played_rounds"];
    if (_totalPlayedRounds_) {
      msg.totalPlayedRounds = protoscript.parseNumber(_totalPlayedRounds_);
    }
    const _winSummary_ = json["winSummary"] ?? json["win_summary"];
    if (_winSummary_) {
      protoAtoms.PlayerWinSummaryJSON._readMessage(
        msg.winSummary,
        _winSummary_
      );
    }
    const _handsValueSummary_ = json["handsValueSummary"] ?? json["hands_value_summary"];
    if (_handsValueSummary_) {
      for (const item of _handsValueSummary_) {
        const m = protoAtoms.HandValueStatJSON.initialize();
        protoAtoms.HandValueStatJSON._readMessage(m, item);
        msg.handsValueSummary.push(m);
      }
    }
    const _yakuSummary_ = json["yakuSummary"] ?? json["yaku_summary"];
    if (_yakuSummary_) {
      for (const item of _yakuSummary_) {
        const m = protoAtoms.YakuStatJSON.initialize();
        protoAtoms.YakuStatJSON._readMessage(m, item);
        msg.yakuSummary.push(m);
      }
    }
    const _riichiSummary_ = json["riichiSummary"] ?? json["riichi_summary"];
    if (_riichiSummary_) {
      protoAtoms.RiichiSummaryJSON._readMessage(
        msg.riichiSummary,
        _riichiSummary_
      );
    }
    const _doraStat_ = json["doraStat"] ?? json["dora_stat"];
    if (_doraStat_) {
      protoAtoms.DoraSummaryJSON._readMessage(msg.doraStat, _doraStat_);
    }
    const _lastUpdate_ = json["lastUpdate"] ?? json["last_update"];
    if (_lastUpdate_) {
      msg.lastUpdate = _lastUpdate_;
    }
    return msg;
  }
};
export const GamesAddRoundPayloadJSON = {
  /**
   * Serializes GamesAddRoundPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesAddRoundPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesAddRoundPayload from JSON.
   */
  decode: function(json) {
    return GamesAddRoundPayloadJSON._readMessage(
      GamesAddRoundPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesAddRoundPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHash: "",
      roundData: protoAtoms.RoundJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.sessionHash) {
      json["sessionHash"] = msg.sessionHash;
    }
    if (msg.roundData) {
      const _roundData_ = protoAtoms.RoundJSON._writeMessage(msg.roundData);
      if (Object.keys(_roundData_).length > 0) {
        json["roundData"] = _roundData_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _sessionHash_ = json["sessionHash"] ?? json["session_hash"];
    if (_sessionHash_) {
      msg.sessionHash = _sessionHash_;
    }
    const _roundData_ = json["roundData"] ?? json["round_data"];
    if (_roundData_) {
      protoAtoms.RoundJSON._readMessage(msg.roundData, _roundData_);
    }
    return msg;
  }
};
export const GamesAddRoundResponseJSON = {
  /**
   * Serializes GamesAddRoundResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesAddRoundResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesAddRoundResponse from JSON.
   */
  decode: function(json) {
    return GamesAddRoundResponseJSON._readMessage(
      GamesAddRoundResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesAddRoundResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      scores: [],
      round: 0,
      honba: 0,
      riichiBets: 0,
      prematurelyFinished: false,
      roundJustChanged: false,
      isFinished: false,
      lastHandStarted: false,
      lastOutcome: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.scores?.length) {
      json["scores"] = msg.scores.map(
        protoAtoms.IntermediateResultOfSessionJSON._writeMessage
      );
    }
    if (msg.round) {
      json["round"] = msg.round;
    }
    if (msg.honba) {
      json["honba"] = msg.honba;
    }
    if (msg.riichiBets) {
      json["riichiBets"] = msg.riichiBets;
    }
    if (msg.prematurelyFinished) {
      json["prematurelyFinished"] = msg.prematurelyFinished;
    }
    if (msg.roundJustChanged) {
      json["roundJustChanged"] = msg.roundJustChanged;
    }
    if (msg.isFinished) {
      json["isFinished"] = msg.isFinished;
    }
    if (msg.lastHandStarted) {
      json["lastHandStarted"] = msg.lastHandStarted;
    }
    if (msg.lastOutcome != void 0) {
      json["lastOutcome"] = msg.lastOutcome;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _scores_ = json["scores"];
    if (_scores_) {
      for (const item of _scores_) {
        const m = protoAtoms.IntermediateResultOfSessionJSON.initialize();
        protoAtoms.IntermediateResultOfSessionJSON._readMessage(m, item);
        msg.scores.push(m);
      }
    }
    const _round_ = json["round"];
    if (_round_) {
      msg.round = protoscript.parseNumber(_round_);
    }
    const _honba_ = json["honba"];
    if (_honba_) {
      msg.honba = protoscript.parseNumber(_honba_);
    }
    const _riichiBets_ = json["riichiBets"] ?? json["riichi_bets"];
    if (_riichiBets_) {
      msg.riichiBets = protoscript.parseNumber(_riichiBets_);
    }
    const _prematurelyFinished_ = json["prematurelyFinished"] ?? json["prematurely_finished"];
    if (_prematurelyFinished_) {
      msg.prematurelyFinished = _prematurelyFinished_;
    }
    const _roundJustChanged_ = json["roundJustChanged"] ?? json["round_just_changed"];
    if (_roundJustChanged_) {
      msg.roundJustChanged = _roundJustChanged_;
    }
    const _isFinished_ = json["isFinished"] ?? json["is_finished"];
    if (_isFinished_) {
      msg.isFinished = _isFinished_;
    }
    const _lastHandStarted_ = json["lastHandStarted"] ?? json["last_hand_started"];
    if (_lastHandStarted_) {
      msg.lastHandStarted = _lastHandStarted_;
    }
    const _lastOutcome_ = json["lastOutcome"] ?? json["last_outcome"];
    if (_lastOutcome_) {
      msg.lastOutcome = protoAtoms.RoundOutcome._fromInt(_lastOutcome_);
    }
    return msg;
  }
};
export const GamesPreviewRoundPayloadJSON = {
  /**
   * Serializes GamesPreviewRoundPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesPreviewRoundPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesPreviewRoundPayload from JSON.
   */
  decode: function(json) {
    return GamesPreviewRoundPayloadJSON._readMessage(
      GamesPreviewRoundPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesPreviewRoundPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHash: "",
      roundData: protoAtoms.RoundJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.sessionHash) {
      json["sessionHash"] = msg.sessionHash;
    }
    if (msg.roundData) {
      const _roundData_ = protoAtoms.RoundJSON._writeMessage(msg.roundData);
      if (Object.keys(_roundData_).length > 0) {
        json["roundData"] = _roundData_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _sessionHash_ = json["sessionHash"] ?? json["session_hash"];
    if (_sessionHash_) {
      msg.sessionHash = _sessionHash_;
    }
    const _roundData_ = json["roundData"] ?? json["round_data"];
    if (_roundData_) {
      protoAtoms.RoundJSON._readMessage(msg.roundData, _roundData_);
    }
    return msg;
  }
};
export const GamesPreviewRoundResponseJSON = {
  /**
   * Serializes GamesPreviewRoundResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesPreviewRoundResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesPreviewRoundResponse from JSON.
   */
  decode: function(json) {
    return GamesPreviewRoundResponseJSON._readMessage(
      GamesPreviewRoundResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesPreviewRoundResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      state: protoAtoms.RoundStateJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.state) {
      const _state_ = protoAtoms.RoundStateJSON._writeMessage(msg.state);
      if (Object.keys(_state_).length > 0) {
        json["state"] = _state_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _state_ = json["state"];
    if (_state_) {
      protoAtoms.RoundStateJSON._readMessage(msg.state, _state_);
    }
    return msg;
  }
};
export const GamesAddOnlineReplayPayloadJSON = {
  /**
   * Serializes GamesAddOnlineReplayPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesAddOnlineReplayPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesAddOnlineReplayPayload from JSON.
   */
  decode: function(json) {
    return GamesAddOnlineReplayPayloadJSON._readMessage(
      GamesAddOnlineReplayPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesAddOnlineReplayPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      link: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.link) {
      json["link"] = msg.link;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _link_ = json["link"];
    if (_link_) {
      msg.link = _link_;
    }
    return msg;
  }
};
export const GamesAddOnlineReplayResponseJSON = {
  /**
   * Serializes GamesAddOnlineReplayResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesAddOnlineReplayResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesAddOnlineReplayResponse from JSON.
   */
  decode: function(json) {
    return GamesAddOnlineReplayResponseJSON._readMessage(
      GamesAddOnlineReplayResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesAddOnlineReplayResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      game: protoAtoms.GameResultJSON.initialize(),
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.game) {
      const _game_ = protoAtoms.GameResultJSON._writeMessage(msg.game);
      if (Object.keys(_game_).length > 0) {
        json["game"] = _game_;
      }
    }
    if (msg.players?.length) {
      json["players"] = msg.players.map(protoAtoms.PlayerJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _game_ = json["game"];
    if (_game_) {
      protoAtoms.GameResultJSON._readMessage(msg.game, _game_);
    }
    const _players_ = json["players"];
    if (_players_) {
      for (const item of _players_) {
        const m = protoAtoms.PlayerJSON.initialize();
        protoAtoms.PlayerJSON._readMessage(m, item);
        msg.players.push(m);
      }
    }
    return msg;
  }
};
export const PlayersGetLastResultsPayloadJSON = {
  /**
   * Serializes PlayersGetLastResultsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetLastResultsPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetLastResultsPayload from JSON.
   */
  decode: function(json) {
    return PlayersGetLastResultsPayloadJSON._readMessage(
      PlayersGetLastResultsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetLastResultsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const PlayersGetLastResultsResponseJSON = {
  /**
   * Serializes PlayersGetLastResultsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetLastResultsResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetLastResultsResponse from JSON.
   */
  decode: function(json) {
    return PlayersGetLastResultsResponseJSON._readMessage(
      PlayersGetLastResultsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetLastResultsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      results: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.results?.length) {
      json["results"] = msg.results.map(
        protoAtoms.SessionHistoryResultJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _results_ = json["results"];
    if (_results_) {
      for (const item of _results_) {
        const m = protoAtoms.SessionHistoryResultJSON.initialize();
        protoAtoms.SessionHistoryResultJSON._readMessage(m, item);
        msg.results.push(m);
      }
    }
    return msg;
  }
};
export const PlayersGetLastRoundPayloadJSON = {
  /**
   * Serializes PlayersGetLastRoundPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetLastRoundPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetLastRoundPayload from JSON.
   */
  decode: function(json) {
    return PlayersGetLastRoundPayloadJSON._readMessage(
      PlayersGetLastRoundPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetLastRoundPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const PlayersGetLastRoundResponseJSON = {
  /**
   * Serializes PlayersGetLastRoundResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetLastRoundResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetLastRoundResponse from JSON.
   */
  decode: function(json) {
    return PlayersGetLastRoundResponseJSON._readMessage(
      PlayersGetLastRoundResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetLastRoundResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      round: protoAtoms.RoundStateJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.round) {
      const _round_ = protoAtoms.RoundStateJSON._writeMessage(msg.round);
      if (Object.keys(_round_).length > 0) {
        json["round"] = _round_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _round_ = json["round"];
    if (_round_) {
      protoAtoms.RoundStateJSON._readMessage(msg.round, _round_);
    }
    return msg;
  }
};
export const PlayersGetAllRoundsResponseJSON = {
  /**
   * Serializes PlayersGetAllRoundsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetAllRoundsResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetAllRoundsResponse from JSON.
   */
  decode: function(json) {
    return PlayersGetAllRoundsResponseJSON._readMessage(
      PlayersGetAllRoundsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetAllRoundsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      rounds: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.rounds?.length) {
      json["rounds"] = msg.rounds.map(protoAtoms.RoundStateJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _rounds_ = json["rounds"];
    if (_rounds_) {
      for (const item of _rounds_) {
        const m = protoAtoms.RoundStateJSON.initialize();
        protoAtoms.RoundStateJSON._readMessage(m, item);
        msg.rounds.push(m);
      }
    }
    return msg;
  }
};
export const PlayersGetLastRoundByHashResponseJSON = {
  /**
   * Serializes PlayersGetLastRoundByHashResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      PlayersGetLastRoundByHashResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes PlayersGetLastRoundByHashResponse from JSON.
   */
  decode: function(json) {
    return PlayersGetLastRoundByHashResponseJSON._readMessage(
      PlayersGetLastRoundByHashResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetLastRoundByHashResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      round: protoAtoms.RoundStateJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.round) {
      const _round_ = protoAtoms.RoundStateJSON._writeMessage(msg.round);
      if (Object.keys(_round_).length > 0) {
        json["round"] = _round_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _round_ = json["round"];
    if (_round_) {
      protoAtoms.RoundStateJSON._readMessage(msg.round, _round_);
    }
    return msg;
  }
};
export const EventsGetEventForEditPayloadJSON = {
  /**
   * Serializes EventsGetEventForEditPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetEventForEditPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetEventForEditPayload from JSON.
   */
  decode: function(json) {
    return EventsGetEventForEditPayloadJSON._readMessage(
      EventsGetEventForEditPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetEventForEditPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.id) {
      json["id"] = msg.id;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _id_ = json["id"];
    if (_id_) {
      msg.id = protoscript.parseNumber(_id_);
    }
    return msg;
  }
};
export const EventsGetEventForEditResponseJSON = {
  /**
   * Serializes EventsGetEventForEditResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetEventForEditResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetEventForEditResponse from JSON.
   */
  decode: function(json) {
    return EventsGetEventForEditResponseJSON._readMessage(
      EventsGetEventForEditResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetEventForEditResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      event: protoAtoms.EventDataJSON.initialize(),
      finished: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.id) {
      json["id"] = msg.id;
    }
    if (msg.event) {
      const _event_ = protoAtoms.EventDataJSON._writeMessage(msg.event);
      if (Object.keys(_event_).length > 0) {
        json["event"] = _event_;
      }
    }
    if (msg.finished) {
      json["finished"] = msg.finished;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _id_ = json["id"];
    if (_id_) {
      msg.id = protoscript.parseNumber(_id_);
    }
    const _event_ = json["event"];
    if (_event_) {
      protoAtoms.EventDataJSON._readMessage(msg.event, _event_);
    }
    const _finished_ = json["finished"];
    if (_finished_) {
      msg.finished = _finished_;
    }
    return msg;
  }
};
export const EventsUpdateEventPayloadJSON = {
  /**
   * Serializes EventsUpdateEventPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsUpdateEventPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsUpdateEventPayload from JSON.
   */
  decode: function(json) {
    return EventsUpdateEventPayloadJSON._readMessage(
      EventsUpdateEventPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsUpdateEventPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      event: protoAtoms.EventDataJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.id) {
      json["id"] = msg.id;
    }
    if (msg.event) {
      const _event_ = protoAtoms.EventDataJSON._writeMessage(msg.event);
      if (Object.keys(_event_).length > 0) {
        json["event"] = _event_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _id_ = json["id"];
    if (_id_) {
      msg.id = protoscript.parseNumber(_id_);
    }
    const _event_ = json["event"];
    if (_event_) {
      protoAtoms.EventDataJSON._readMessage(msg.event, _event_);
    }
    return msg;
  }
};
export const EventsGetTablesStatePayloadJSON = {
  /**
   * Serializes EventsGetTablesStatePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetTablesStatePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetTablesStatePayload from JSON.
   */
  decode: function(json) {
    return EventsGetTablesStatePayloadJSON._readMessage(
      EventsGetTablesStatePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetTablesStatePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      omitLastRound: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.omitLastRound) {
      json["omitLastRound"] = msg.omitLastRound;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _omitLastRound_ = json["omitLastRound"] ?? json["omit_last_round"];
    if (_omitLastRound_) {
      msg.omitLastRound = _omitLastRound_;
    }
    return msg;
  }
};
export const EventsGetTablesStateResponseJSON = {
  /**
   * Serializes EventsGetTablesStateResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetTablesStateResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetTablesStateResponse from JSON.
   */
  decode: function(json) {
    return EventsGetTablesStateResponseJSON._readMessage(
      EventsGetTablesStateResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetTablesStateResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      tables: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.tables?.length) {
      json["tables"] = msg.tables.map(protoAtoms.TableStateJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _tables_ = json["tables"];
    if (_tables_) {
      for (const item of _tables_) {
        const m = protoAtoms.TableStateJSON.initialize();
        protoAtoms.TableStateJSON._readMessage(m, item);
        msg.tables.push(m);
      }
    }
    return msg;
  }
};
export const EventsRegisterPlayerPayloadJSON = {
  /**
   * Serializes EventsRegisterPlayerPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsRegisterPlayerPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsRegisterPlayerPayload from JSON.
   */
  decode: function(json) {
    return EventsRegisterPlayerPayloadJSON._readMessage(
      EventsRegisterPlayerPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsRegisterPlayerPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const EventsUnregisterPlayerPayloadJSON = {
  /**
   * Serializes EventsUnregisterPlayerPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsUnregisterPlayerPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsUnregisterPlayerPayload from JSON.
   */
  decode: function(json) {
    return EventsUnregisterPlayerPayloadJSON._readMessage(
      EventsUnregisterPlayerPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsUnregisterPlayerPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const EventsUpdatePlayerSeatingFlagPayloadJSON = {
  /**
   * Serializes EventsUpdatePlayerSeatingFlagPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsUpdatePlayerSeatingFlagPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsUpdatePlayerSeatingFlagPayload from JSON.
   */
  decode: function(json) {
    return EventsUpdatePlayerSeatingFlagPayloadJSON._readMessage(
      EventsUpdatePlayerSeatingFlagPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsUpdatePlayerSeatingFlagPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      ignoreSeating: false,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.ignoreSeating) {
      json["ignoreSeating"] = msg.ignoreSeating;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _ignoreSeating_ = json["ignoreSeating"] ?? json["ignore_seating"];
    if (_ignoreSeating_) {
      msg.ignoreSeating = _ignoreSeating_;
    }
    return msg;
  }
};
export const EventsGetAchievementsPayloadJSON = {
  /**
   * Serializes EventsGetAchievementsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetAchievementsPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetAchievementsPayload from JSON.
   */
  decode: function(json) {
    return EventsGetAchievementsPayloadJSON._readMessage(
      EventsGetAchievementsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetAchievementsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      achievementsList: [],
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.achievementsList?.length) {
      json["achievementsList"] = msg.achievementsList;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _achievementsList_ = json["achievementsList"] ?? json["achievements_list"];
    if (_achievementsList_) {
      msg.achievementsList = _achievementsList_;
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const EventsGetAchievementsResponseJSON = {
  /**
   * Serializes EventsGetAchievementsResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(EventsGetAchievementsResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes EventsGetAchievementsResponse from JSON.
   */
  decode: function(json) {
    return EventsGetAchievementsResponseJSON._readMessage(
      EventsGetAchievementsResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetAchievementsResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      achievements: [],
      lastUpdate: "",
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.achievements?.length) {
      json["achievements"] = msg.achievements.map(
        protoAtoms.AchievementJSON._writeMessage
      );
    }
    if (msg.lastUpdate) {
      json["lastUpdate"] = msg.lastUpdate;
    }
    if (msg.players?.length) {
      json["players"] = msg.players.map(protoAtoms.PersonExJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _achievements_ = json["achievements"];
    if (_achievements_) {
      for (const item of _achievements_) {
        const m = protoAtoms.AchievementJSON.initialize();
        protoAtoms.AchievementJSON._readMessage(m, item);
        msg.achievements.push(m);
      }
    }
    const _lastUpdate_ = json["lastUpdate"] ?? json["last_update"];
    if (_lastUpdate_) {
      msg.lastUpdate = _lastUpdate_;
    }
    const _players_ = json["players"];
    if (_players_) {
      for (const item of _players_) {
        const m = protoAtoms.PersonExJSON.initialize();
        protoAtoms.PersonExJSON._readMessage(m, item);
        msg.players.push(m);
      }
    }
    return msg;
  }
};
export const EventsUpdatePlayersLocalIdsPayloadJSON = {
  /**
   * Serializes EventsUpdatePlayersLocalIdsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsUpdatePlayersLocalIdsPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsUpdatePlayersLocalIdsPayload from JSON.
   */
  decode: function(json) {
    return EventsUpdatePlayersLocalIdsPayloadJSON._readMessage(
      EventsUpdatePlayersLocalIdsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsUpdatePlayersLocalIdsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      idsToLocalIds: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.idsToLocalIds?.length) {
      json["idsToLocalIds"] = msg.idsToLocalIds.map(
        protoAtoms.LocalIdMappingJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _idsToLocalIds_ = json["idsToLocalIds"] ?? json["ids_to_local_ids"];
    if (_idsToLocalIds_) {
      for (const item of _idsToLocalIds_) {
        const m = protoAtoms.LocalIdMappingJSON.initialize();
        protoAtoms.LocalIdMappingJSON._readMessage(m, item);
        msg.idsToLocalIds.push(m);
      }
    }
    return msg;
  }
};
export const EventsUpdatePlayerReplacementPayloadJSON = {
  /**
   * Serializes EventsUpdatePlayerReplacementPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsUpdatePlayerReplacementPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsUpdatePlayerReplacementPayload from JSON.
   */
  decode: function(json) {
    return EventsUpdatePlayerReplacementPayloadJSON._readMessage(
      EventsUpdatePlayerReplacementPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsUpdatePlayerReplacementPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      eventId: 0,
      replacementId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.replacementId) {
      json["replacementId"] = msg.replacementId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _replacementId_ = json["replacementId"] ?? json["replacement_id"];
    if (_replacementId_) {
      msg.replacementId = protoscript.parseNumber(_replacementId_);
    }
    return msg;
  }
};
export const EventsUpdatePlayersTeamsPayloadJSON = {
  /**
   * Serializes EventsUpdatePlayersTeamsPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsUpdatePlayersTeamsPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsUpdatePlayersTeamsPayload from JSON.
   */
  decode: function(json) {
    return EventsUpdatePlayersTeamsPayloadJSON._readMessage(
      EventsUpdatePlayersTeamsPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsUpdatePlayersTeamsPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      idsToTeamNames: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.idsToTeamNames?.length) {
      json["idsToTeamNames"] = msg.idsToTeamNames.map(
        protoAtoms.TeamMappingJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _idsToTeamNames_ = json["idsToTeamNames"] ?? json["ids_to_team_names"];
    if (_idsToTeamNames_) {
      for (const item of _idsToTeamNames_) {
        const m = protoAtoms.TeamMappingJSON.initialize();
        protoAtoms.TeamMappingJSON._readMessage(m, item);
        msg.idsToTeamNames.push(m);
      }
    }
    return msg;
  }
};
export const GamesStartGamePayloadJSON = {
  /**
   * Serializes GamesStartGamePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesStartGamePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesStartGamePayload from JSON.
   */
  decode: function(json) {
    return GamesStartGamePayloadJSON._readMessage(
      GamesStartGamePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesStartGamePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.players?.length) {
      json["players"] = msg.players;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _players_ = json["players"];
    if (_players_) {
      msg.players = _players_.map(protoscript.parseNumber);
    }
    return msg;
  }
};
export const GamesDropLastRoundPayloadJSON = {
  /**
   * Serializes GamesDropLastRoundPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesDropLastRoundPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesDropLastRoundPayload from JSON.
   */
  decode: function(json) {
    return GamesDropLastRoundPayloadJSON._readMessage(
      GamesDropLastRoundPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesDropLastRoundPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHash: "",
      intermediateResults: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.sessionHash) {
      json["sessionHash"] = msg.sessionHash;
    }
    if (msg.intermediateResults?.length) {
      json["intermediateResults"] = msg.intermediateResults.map(
        protoAtoms.IntermediateResultOfSessionJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _sessionHash_ = json["sessionHash"] ?? json["session_hash"];
    if (_sessionHash_) {
      msg.sessionHash = _sessionHash_;
    }
    const _intermediateResults_ = json["intermediateResults"] ?? json["intermediate_results"];
    if (_intermediateResults_) {
      for (const item of _intermediateResults_) {
        const m = protoAtoms.IntermediateResultOfSessionJSON.initialize();
        protoAtoms.IntermediateResultOfSessionJSON._readMessage(m, item);
        msg.intermediateResults.push(m);
      }
    }
    return msg;
  }
};
export const GamesAddPenaltyPayloadJSON = {
  /**
   * Serializes GamesAddPenaltyPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesAddPenaltyPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesAddPenaltyPayload from JSON.
   */
  decode: function(json) {
    return GamesAddPenaltyPayloadJSON._readMessage(
      GamesAddPenaltyPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesAddPenaltyPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      playerId: 0,
      amount: 0,
      reason: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    if (msg.amount) {
      json["amount"] = msg.amount;
    }
    if (msg.reason) {
      json["reason"] = msg.reason;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    const _amount_ = json["amount"];
    if (_amount_) {
      msg.amount = protoscript.parseNumber(_amount_);
    }
    const _reason_ = json["reason"];
    if (_reason_) {
      msg.reason = _reason_;
    }
    return msg;
  }
};
export const GamesAddPenaltyGamePayloadJSON = {
  /**
   * Serializes GamesAddPenaltyGamePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GamesAddPenaltyGamePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes GamesAddPenaltyGamePayload from JSON.
   */
  decode: function(json) {
    return GamesAddPenaltyGamePayloadJSON._readMessage(
      GamesAddPenaltyGamePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GamesAddPenaltyGamePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.players?.length) {
      json["players"] = msg.players;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _players_ = json["players"];
    if (_players_) {
      msg.players = _players_.map(protoscript.parseNumber);
    }
    return msg;
  }
};
export const PlayersGetPlayerPayloadJSON = {
  /**
   * Serializes PlayersGetPlayerPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetPlayerPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetPlayerPayload from JSON.
   */
  decode: function(json) {
    return PlayersGetPlayerPayloadJSON._readMessage(
      PlayersGetPlayerPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetPlayerPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      id: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.id) {
      json["id"] = msg.id;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _id_ = json["id"];
    if (_id_) {
      msg.id = protoscript.parseNumber(_id_);
    }
    return msg;
  }
};
export const PlayersGetPlayerResponseJSON = {
  /**
   * Serializes PlayersGetPlayerResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PlayersGetPlayerResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PlayersGetPlayerResponse from JSON.
   */
  decode: function(json) {
    return PlayersGetPlayerResponseJSON._readMessage(
      PlayersGetPlayerResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PlayersGetPlayerResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      players: protoAtoms.PlayerJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.players) {
      const _players_ = protoAtoms.PlayerJSON._writeMessage(msg.players);
      if (Object.keys(_players_).length > 0) {
        json["players"] = _players_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _players_ = json["players"];
    if (_players_) {
      protoAtoms.PlayerJSON._readMessage(msg.players, _players_);
    }
    return msg;
  }
};
export const EventsGetCurrentSeatingResponseJSON = {
  /**
   * Serializes EventsGetCurrentSeatingResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsGetCurrentSeatingResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsGetCurrentSeatingResponse from JSON.
   */
  decode: function(json) {
    return EventsGetCurrentSeatingResponseJSON._readMessage(
      EventsGetCurrentSeatingResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetCurrentSeatingResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      seating: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.seating?.length) {
      json["seating"] = msg.seating.map(
        protoAtoms.PlayerSeatingJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _seating_ = json["seating"];
    if (_seating_) {
      for (const item of _seating_) {
        const m = protoAtoms.PlayerSeatingJSON.initialize();
        protoAtoms.PlayerSeatingJSON._readMessage(m, item);
        msg.seating.push(m);
      }
    }
    return msg;
  }
};
export const SeatingMakeShuffledSeatingPayloadJSON = {
  /**
   * Serializes SeatingMakeShuffledSeatingPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      SeatingMakeShuffledSeatingPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes SeatingMakeShuffledSeatingPayload from JSON.
   */
  decode: function(json) {
    return SeatingMakeShuffledSeatingPayloadJSON._readMessage(
      SeatingMakeShuffledSeatingPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes SeatingMakeShuffledSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      groupsCount: 0,
      seed: 0,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.groupsCount) {
      json["groupsCount"] = msg.groupsCount;
    }
    if (msg.seed) {
      json["seed"] = msg.seed;
    }
    if (msg.windShuffleMode != void 0) {
      json["windShuffleMode"] = msg.windShuffleMode;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _groupsCount_ = json["groupsCount"] ?? json["groups_count"];
    if (_groupsCount_) {
      msg.groupsCount = protoscript.parseNumber(_groupsCount_);
    }
    const _seed_ = json["seed"];
    if (_seed_) {
      msg.seed = protoscript.parseNumber(_seed_);
    }
    const _windShuffleMode_ = json["windShuffleMode"] ?? json["wind_shuffle_mode"];
    if (_windShuffleMode_) {
      msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(_windShuffleMode_);
    }
    return msg;
  }
};
export const SeatingMakeSwissSeatingPayloadJSON = {
  /**
   * Serializes SeatingMakeSwissSeatingPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      SeatingMakeSwissSeatingPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes SeatingMakeSwissSeatingPayload from JSON.
   */
  decode: function(json) {
    return SeatingMakeSwissSeatingPayloadJSON._readMessage(
      SeatingMakeSwissSeatingPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes SeatingMakeSwissSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.windShuffleMode != void 0) {
      json["windShuffleMode"] = msg.windShuffleMode;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _windShuffleMode_ = json["windShuffleMode"] ?? json["wind_shuffle_mode"];
    if (_windShuffleMode_) {
      msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(_windShuffleMode_);
    }
    return msg;
  }
};
export const SeatingGenerateSwissSeatingPayloadJSON = {
  /**
   * Serializes SeatingGenerateSwissSeatingPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      SeatingGenerateSwissSeatingPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes SeatingGenerateSwissSeatingPayload from JSON.
   */
  decode: function(json) {
    return SeatingGenerateSwissSeatingPayloadJSON._readMessage(
      SeatingGenerateSwissSeatingPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes SeatingGenerateSwissSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      substituteReplacementPlayers: false,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.substituteReplacementPlayers) {
      json["substituteReplacementPlayers"] = msg.substituteReplacementPlayers;
    }
    if (msg.windShuffleMode != void 0) {
      json["windShuffleMode"] = msg.windShuffleMode;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _substituteReplacementPlayers_ = json["substituteReplacementPlayers"] ?? json["substitute_replacement_players"];
    if (_substituteReplacementPlayers_) {
      msg.substituteReplacementPlayers = _substituteReplacementPlayers_;
    }
    const _windShuffleMode_ = json["windShuffleMode"] ?? json["wind_shuffle_mode"];
    if (_windShuffleMode_) {
      msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(_windShuffleMode_);
    }
    return msg;
  }
};
export const SeatingGenerateSwissSeatingResponseJSON = {
  /**
   * Serializes SeatingGenerateSwissSeatingResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      SeatingGenerateSwissSeatingResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes SeatingGenerateSwissSeatingResponse from JSON.
   */
  decode: function(json) {
    return SeatingGenerateSwissSeatingResponseJSON._readMessage(
      SeatingGenerateSwissSeatingResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes SeatingGenerateSwissSeatingResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      tables: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.tables?.length) {
      json["tables"] = msg.tables.map(
        protoAtoms.TableItemSwissJSON._writeMessage
      );
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _tables_ = json["tables"];
    if (_tables_) {
      for (const item of _tables_) {
        const m = protoAtoms.TableItemSwissJSON.initialize();
        protoAtoms.TableItemSwissJSON._readMessage(m, item);
        msg.tables.push(m);
      }
    }
    return msg;
  }
};
export const SeatingMakeIntervalSeatingPayloadJSON = {
  /**
   * Serializes SeatingMakeIntervalSeatingPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      SeatingMakeIntervalSeatingPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes SeatingMakeIntervalSeatingPayload from JSON.
   */
  decode: function(json) {
    return SeatingMakeIntervalSeatingPayloadJSON._readMessage(
      SeatingMakeIntervalSeatingPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes SeatingMakeIntervalSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      step: 0,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.step) {
      json["step"] = msg.step;
    }
    if (msg.windShuffleMode != void 0) {
      json["windShuffleMode"] = msg.windShuffleMode;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _step_ = json["step"];
    if (_step_) {
      msg.step = protoscript.parseNumber(_step_);
    }
    const _windShuffleMode_ = json["windShuffleMode"] ?? json["wind_shuffle_mode"];
    if (_windShuffleMode_) {
      msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(_windShuffleMode_);
    }
    return msg;
  }
};
export const SeatingMakePrescriptedSeatingPayloadJSON = {
  /**
   * Serializes SeatingMakePrescriptedSeatingPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      SeatingMakePrescriptedSeatingPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes SeatingMakePrescriptedSeatingPayload from JSON.
   */
  decode: function(json) {
    return SeatingMakePrescriptedSeatingPayloadJSON._readMessage(
      SeatingMakePrescriptedSeatingPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes SeatingMakePrescriptedSeatingPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      windShuffleMode: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.windShuffleMode != void 0) {
      json["windShuffleMode"] = msg.windShuffleMode;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _windShuffleMode_ = json["windShuffleMode"] ?? json["wind_shuffle_mode"];
    if (_windShuffleMode_) {
      msg.windShuffleMode = protoAtoms.WindShuffleMode._fromInt(_windShuffleMode_);
    }
    return msg;
  }
};
export const EventsGetPrescriptedEventConfigResponseJSON = {
  /**
   * Serializes EventsGetPrescriptedEventConfigResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsGetPrescriptedEventConfigResponseJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsGetPrescriptedEventConfigResponse from JSON.
   */
  decode: function(json) {
    return EventsGetPrescriptedEventConfigResponseJSON._readMessage(
      EventsGetPrescriptedEventConfigResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsGetPrescriptedEventConfigResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      nextSessionIndex: 0,
      prescript: void 0,
      errors: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.nextSessionIndex) {
      json["nextSessionIndex"] = msg.nextSessionIndex;
    }
    if (msg.prescript != void 0) {
      json["prescript"] = msg.prescript;
    }
    if (msg.errors?.length) {
      json["errors"] = msg.errors;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _nextSessionIndex_ = json["nextSessionIndex"] ?? json["next_session_index"];
    if (_nextSessionIndex_) {
      msg.nextSessionIndex = protoscript.parseNumber(_nextSessionIndex_);
    }
    const _prescript_ = json["prescript"];
    if (_prescript_) {
      msg.prescript = _prescript_;
    }
    const _errors_ = json["errors"];
    if (_errors_) {
      msg.errors = _errors_;
    }
    return msg;
  }
};
export const EventsUpdatePrescriptedEventConfigPayloadJSON = {
  /**
   * Serializes EventsUpdatePrescriptedEventConfigPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      EventsUpdatePrescriptedEventConfigPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes EventsUpdatePrescriptedEventConfigPayload from JSON.
   */
  decode: function(json) {
    return EventsUpdatePrescriptedEventConfigPayloadJSON._readMessage(
      EventsUpdatePrescriptedEventConfigPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes EventsUpdatePrescriptedEventConfigPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      nextSessionIndex: 0,
      prescript: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.nextSessionIndex) {
      json["nextSessionIndex"] = msg.nextSessionIndex;
    }
    if (msg.prescript) {
      json["prescript"] = msg.prescript;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _nextSessionIndex_ = json["nextSessionIndex"] ?? json["next_session_index"];
    if (_nextSessionIndex_) {
      msg.nextSessionIndex = protoscript.parseNumber(_nextSessionIndex_);
    }
    const _prescript_ = json["prescript"];
    if (_prescript_) {
      msg.prescript = _prescript_;
    }
    return msg;
  }
};
export const ClearStatCachePayloadJSON = {
  /**
   * Serializes ClearStatCachePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(ClearStatCachePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes ClearStatCachePayload from JSON.
   */
  decode: function(json) {
    return ClearStatCachePayloadJSON._readMessage(
      ClearStatCachePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes ClearStatCachePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      playerId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    return msg;
  }
};
export const TypedGamesAddOnlineReplayPayloadJSON = {
  /**
   * Serializes TypedGamesAddOnlineReplayPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(
      TypedGamesAddOnlineReplayPayloadJSON._writeMessage(msg)
    );
  },
  /**
   * Deserializes TypedGamesAddOnlineReplayPayload from JSON.
   */
  decode: function(json) {
    return TypedGamesAddOnlineReplayPayloadJSON._readMessage(
      TypedGamesAddOnlineReplayPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes TypedGamesAddOnlineReplayPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      platformId: protoAtoms.PlatformType._fromInt(0),
      contentType: 0,
      logTimestamp: 0,
      replayHash: "",
      content: "",
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.platformId && protoAtoms.PlatformTypeJSON._toInt(msg.platformId)) {
      json["platformId"] = msg.platformId;
    }
    if (msg.contentType) {
      json["contentType"] = msg.contentType;
    }
    if (msg.logTimestamp) {
      json["logTimestamp"] = msg.logTimestamp;
    }
    if (msg.replayHash) {
      json["replayHash"] = msg.replayHash;
    }
    if (msg.content) {
      json["content"] = msg.content;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _platformId_ = json["platformId"] ?? json["platform_id"];
    if (_platformId_) {
      msg.platformId = protoAtoms.PlatformType._fromInt(_platformId_);
    }
    const _contentType_ = json["contentType"] ?? json["content_type"];
    if (_contentType_) {
      msg.contentType = protoscript.parseNumber(_contentType_);
    }
    const _logTimestamp_ = json["logTimestamp"] ?? json["log_timestamp"];
    if (_logTimestamp_) {
      msg.logTimestamp = protoscript.parseNumber(_logTimestamp_);
    }
    const _replayHash_ = json["replayHash"] ?? json["replay_hash"];
    if (_replayHash_) {
      msg.replayHash = _replayHash_;
    }
    const _content_ = json["content"];
    if (_content_) {
      msg.content = _content_;
    }
    return msg;
  }
};
export const CallRefereePayloadJSON = {
  /**
   * Serializes CallRefereePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(CallRefereePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes CallRefereePayload from JSON.
   */
  decode: function(json) {
    return CallRefereePayloadJSON._readMessage(
      CallRefereePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes CallRefereePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      tableIndex: 0,
      eventId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.tableIndex) {
      json["tableIndex"] = msg.tableIndex;
    }
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _tableIndex_ = json["tableIndex"] ?? json["table_index"];
    if (_tableIndex_) {
      msg.tableIndex = protoscript.parseNumber(_tableIndex_);
    }
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    return msg;
  }
};
export const PenaltiesResponseJSON = {
  /**
   * Serializes PenaltiesResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(PenaltiesResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes PenaltiesResponse from JSON.
   */
  decode: function(json) {
    return PenaltiesResponseJSON._readMessage(
      PenaltiesResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes PenaltiesResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      penalties: [],
      referees: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.penalties?.length) {
      json["penalties"] = msg.penalties.map(
        protoAtoms.PenaltyJSON._writeMessage
      );
    }
    if (msg.referees?.length) {
      json["referees"] = msg.referees.map(protoAtoms.PlayerJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _penalties_ = json["penalties"];
    if (_penalties_) {
      for (const item of _penalties_) {
        const m = protoAtoms.PenaltyJSON.initialize();
        protoAtoms.PenaltyJSON._readMessage(m, item);
        msg.penalties.push(m);
      }
    }
    const _referees_ = json["referees"];
    if (_referees_) {
      for (const item of _referees_) {
        const m = protoAtoms.PlayerJSON.initialize();
        protoAtoms.PlayerJSON._readMessage(m, item);
        msg.referees.push(m);
      }
    }
    return msg;
  }
};
export const CancelPenaltyPayloadJSON = {
  /**
   * Serializes CancelPenaltyPayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(CancelPenaltyPayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes CancelPenaltyPayload from JSON.
   */
  decode: function(json) {
    return CancelPenaltyPayloadJSON._readMessage(
      CancelPenaltyPayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes CancelPenaltyPayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      penaltyId: 0,
      reason: void 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.penaltyId) {
      json["penaltyId"] = msg.penaltyId;
    }
    if (msg.reason != void 0) {
      json["reason"] = msg.reason;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _penaltyId_ = json["penaltyId"] ?? json["penalty_id"];
    if (_penaltyId_) {
      msg.penaltyId = protoscript.parseNumber(_penaltyId_);
    }
    const _reason_ = json["reason"];
    if (_reason_) {
      msg.reason = _reason_;
    }
    return msg;
  }
};
export const AddExtraTimePayloadJSON = {
  /**
   * Serializes AddExtraTimePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(AddExtraTimePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes AddExtraTimePayload from JSON.
   */
  decode: function(json) {
    return AddExtraTimePayloadJSON._readMessage(
      AddExtraTimePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes AddExtraTimePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessionHashList: [],
      extraTime: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.sessionHashList?.length) {
      json["sessionHashList"] = msg.sessionHashList;
    }
    if (msg.extraTime) {
      json["extraTime"] = msg.extraTime;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _sessionHashList_ = json["sessionHashList"] ?? json["session_hash_list"];
    if (_sessionHashList_) {
      msg.sessionHashList = _sessionHashList_;
    }
    const _extraTime_ = json["extraTime"] ?? json["extra_time"];
    if (_extraTime_) {
      msg.extraTime = protoscript.parseNumber(_extraTime_);
    }
    return msg;
  }
};
export const GetCurrentStatePayloadJSON = {
  /**
   * Serializes GetCurrentStatePayload to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GetCurrentStatePayloadJSON._writeMessage(msg));
  },
  /**
   * Deserializes GetCurrentStatePayload from JSON.
   */
  decode: function(json) {
    return GetCurrentStatePayloadJSON._readMessage(
      GetCurrentStatePayloadJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GetCurrentStatePayload with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      eventId: 0,
      playerId: 0,
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.eventId) {
      json["eventId"] = msg.eventId;
    }
    if (msg.playerId) {
      json["playerId"] = msg.playerId;
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _eventId_ = json["eventId"] ?? json["event_id"];
    if (_eventId_) {
      msg.eventId = protoscript.parseNumber(_eventId_);
    }
    const _playerId_ = json["playerId"] ?? json["player_id"];
    if (_playerId_) {
      msg.playerId = protoscript.parseNumber(_playerId_);
    }
    return msg;
  }
};
export const GetCurrentStateResponseJSON = {
  /**
   * Serializes GetCurrentStateResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(GetCurrentStateResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes GetCurrentStateResponse from JSON.
   */
  decode: function(json) {
    return GetCurrentStateResponseJSON._readMessage(
      GetCurrentStateResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes GetCurrentStateResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      sessions: [],
      config: protoAtoms.GameConfigJSON.initialize(),
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.sessions?.length) {
      json["sessions"] = msg.sessions.map(CurrentSessionJSON._writeMessage);
    }
    if (msg.config) {
      const _config_ = protoAtoms.GameConfigJSON._writeMessage(msg.config);
      if (Object.keys(_config_).length > 0) {
        json["config"] = _config_;
      }
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _sessions_ = json["sessions"];
    if (_sessions_) {
      for (const item of _sessions_) {
        const m = CurrentSessionJSON.initialize();
        CurrentSessionJSON._readMessage(m, item);
        msg.sessions.push(m);
      }
    }
    const _config_ = json["config"];
    if (_config_) {
      protoAtoms.GameConfigJSON._readMessage(msg.config, _config_);
    }
    return msg;
  }
};
export const ChomboResponseJSON = {
  /**
   * Serializes ChomboResponse to JSON.
   */
  encode: function(msg) {
    return JSON.stringify(ChomboResponseJSON._writeMessage(msg));
  },
  /**
   * Deserializes ChomboResponse from JSON.
   */
  decode: function(json) {
    return ChomboResponseJSON._readMessage(
      ChomboResponseJSON.initialize(),
      JSON.parse(json)
    );
  },
  /**
   * Initializes ChomboResponse with all fields set to their default value.
   */
  initialize: function(msg) {
    return {
      chombos: [],
      players: [],
      ...msg
    };
  },
  /**
   * @private
   */
  _writeMessage: function(msg) {
    const json = {};
    if (msg.chombos?.length) {
      json["chombos"] = msg.chombos.map(protoAtoms.ChomboJSON._writeMessage);
    }
    if (msg.players?.length) {
      json["players"] = msg.players.map(protoAtoms.PlayerJSON._writeMessage);
    }
    return json;
  },
  /**
   * @private
   */
  _readMessage: function(msg, json) {
    const _chombos_ = json["chombos"];
    if (_chombos_) {
      for (const item of _chombos_) {
        const m = protoAtoms.ChomboJSON.initialize();
        protoAtoms.ChomboJSON._readMessage(m, item);
        msg.chombos.push(m);
      }
    }
    const _players_ = json["players"];
    if (_players_) {
      for (const item of _players_) {
        const m = protoAtoms.PlayerJSON.initialize();
        protoAtoms.PlayerJSON._readMessage(m, item);
        msg.players.push(m);
      }
    }
    return msg;
  }
};
