import { RRoundOverviewInfo, RRoundPaymentsInfo, SessionState } from '#/interfaces/remote';
import {
  LCurrentGame,
  LEventsList,
  LFreyAuthData,
  LGameConfig,
  LSessionOverview,
  LTimerState,
  LUser,
  LUserWithScore,
} from '#/interfaces/local';
import { IAppState } from '#/store/interfaces';
import { Table } from '#/interfaces/common';

export interface IRiichiApi {
  setCredentials(personId: number, token: string): void;
  startGame(eventId: number, playerIds: number[]): Promise<string>;
  getMyEvents(): Promise<LEventsList>;
  getGameConfig(eventId: number): Promise<LGameConfig>;
  getTimerState(eventId: number): Promise<LTimerState>;
  getLastResults(playerId: number, eventId: number): Promise<LUserWithScore[]>;
  getAllPlayers(eventId: number): Promise<LUser[]>;
  getGameOverview(sessionHashcode: string): Promise<LSessionOverview>;
  getCurrentGames(playerId: number, eventId: number): Promise<LCurrentGame[]>;
  getUserInfo(personIds: number[]): Promise<LUser[]>;
  /**
   * @deprecated
   * @param pin
   */
  confirmRegistration(pin: string): Promise<string>;
  getChangesOverview(state: IAppState): Promise<RRoundPaymentsInfo>;
  getLastRoundByHash(sessionHashcode: string): Promise<RRoundPaymentsInfo>;
  getLastRound(playerId: number, eventId: number): Promise<RRoundPaymentsInfo>;
  getAllRounds(sessionHashcode: string): Promise<RRoundOverviewInfo[]>;
  addRound(state: IAppState): Promise<boolean | SessionState>;
  getTablesState(eventId: number): Promise<Table[]>;
  quickAuthorize(): Promise<boolean>;
  authorize(email: string, password: string): Promise<LFreyAuthData>;
}
