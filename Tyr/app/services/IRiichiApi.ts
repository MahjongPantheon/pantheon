import { IAppState } from '#/store/interfaces';
import {
  CurrentSession,
  GameConfig,
  MyEvent,
  PersonEx,
  RegisteredPlayer,
  RoundState,
  SessionHistoryResult,
  TableState,
} from '#/clients/atoms.pb';
import {
  Events_GetTimerState_Response,
  Games_AddRound_Response,
  Games_GetSessionOverview_Response,
} from '#/clients/mimir.pb';
import { Auth_Authorize_Response } from '#/clients/frey.pb';

export interface IRiichiApi {
  setCredentials(personId: number, token: string): void;
  startGame(eventId: number, playerIds: number[]): Promise<string>;
  getMyEvents(): Promise<MyEvent[]>;
  getGameConfig(eventId: number): Promise<GameConfig>;
  getTimerState(eventId: number): Promise<Events_GetTimerState_Response>;
  getLastResults(playerId: number, eventId: number): Promise<SessionHistoryResult[]>;
  getAllPlayers(eventId: number): Promise<RegisteredPlayer[]>;
  getGameOverview(sessionHashcode: string): Promise<Games_GetSessionOverview_Response>;
  getCurrentGames(playerId: number, eventId: number): Promise<CurrentSession[]>;
  getUserInfo(personIds: number[]): Promise<PersonEx[]>;
  getChangesOverview(state: IAppState): Promise<RoundState>;
  getLastRoundByHash(sessionHashcode: string): Promise<RoundState>;
  getLastRound(playerId: number, eventId: number): Promise<RoundState>;
  getAllRounds(sessionHashcode: string): Promise<RoundState[]>;
  addRound(state: IAppState): Promise<Games_AddRound_Response>;
  getTablesState(eventId: number): Promise<TableState[]>;
  quickAuthorize(): Promise<boolean>;
  authorize(email: string, password: string): Promise<Auth_Authorize_Response>;
}
