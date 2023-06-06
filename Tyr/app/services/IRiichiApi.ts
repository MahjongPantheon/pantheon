/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { IAppState } from '../store/interfaces';
import {
  CurrentSession,
  GameConfig,
  MyEvent,
  PersonEx,
  RegisteredPlayer,
  RoundState,
  SessionHistoryResult,
  TableState,
} from '../clients/proto/atoms.pb';
import {
  EventsGetTimerStateResponse,
  GamesAddRoundResponse,
  GamesGetSessionOverviewResponse,
} from '../clients/proto/mimir.pb';
import { AuthAuthorizeResponse } from '../clients/proto/frey.pb';

export interface IRiichiApi {
  setCredentials(personId: number, token: string): void;
  startGame(eventId: number, playerIds: number[]): Promise<string>;
  getMyEvents(): Promise<MyEvent[]>;
  getGameConfig(eventId: number): Promise<GameConfig>;
  getTimerState(eventId: number): Promise<EventsGetTimerStateResponse>;
  getLastResults(playerId: number, eventId: number): Promise<SessionHistoryResult[]>;
  getAllPlayers(eventId: number): Promise<RegisteredPlayer[]>;
  getGameOverview(sessionHashcode: string): Promise<GamesGetSessionOverviewResponse>;
  getCurrentGames(playerId: number, eventId: number): Promise<CurrentSession[]>;
  getUserInfo(personIds: number[]): Promise<PersonEx[]>;
  getChangesOverview(state: IAppState): Promise<RoundState>;
  getLastRoundByHash(sessionHashcode: string): Promise<RoundState>;
  getLastRound(playerId: number, eventId: number): Promise<RoundState>;
  getAllRounds(sessionHashcode: string): Promise<RoundState[]>;
  addRound(state: IAppState): Promise<GamesAddRoundResponse>;
  getTablesState(eventId: number): Promise<TableState[]>;
  quickAuthorize(): Promise<boolean>;
  authorize(email: string, password: string): Promise<AuthAuthorizeResponse>;
}
