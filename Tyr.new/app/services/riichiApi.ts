/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.net>
 *
 * This file is part of Tyr.
 *
 * Tyr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tyr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tyr.  If not, see <http://www.gnu.org/licenses/>.
 */

import { RemoteError } from './remoteError';
import {
  RTimerState, RGameConfig, RSessionOverview, RCurrentGames,
  RUserInfo, RAllPlayersInEvent, RLastResults,
  RRoundPaymentsInfo, RTablesState, SessionState, RRoundOverviewInfo, RFreyAuthData,
} from '#/interfaces/remote';
import {
  LCurrentGame,
  LUser,
  LUserWithScore,
  LTimerState,
  LSessionOverview,
  LGameConfig, LFreyAuthData
} from '#/interfaces/local';
import { Table } from '#/interfaces/common';
import {
  currentGamesFormatter,
  formatRoundToRemote,
  userListFormatter,
  lastResultsFormatter,
  timerFormatter,
  gameConfigFormatter,
  tablesStateFormatter,
  gameOverviewFormatter, freyAuthFormatter
} from './formatters';
import {IAppState} from '#/store/interfaces';
import {environment} from "#config";

type GenericResponse = {
  error?: { message: string, code: any },
  headers: any,
  result: any
};

export class RiichiApiService {
  private _authToken: string | null = null;
  private _personId: string | null = null;

  setCredentials(personId: number, token: string) {
    this._authToken = token;
    this._personId = (personId || 0).toString();
  }

  // TODO: formatters

  // returns game hashcode
  startGame(playerIds: number[]) {
    return this._jsonRpcRequest<string>('startGameT', playerIds);
  }

  getGameConfig() {
    return this._jsonRpcRequest<RGameConfig>('getGameConfigT')
      .then<LGameConfig>(gameConfigFormatter);
  }

  getTimerState() {
    return this._jsonRpcRequest<RTimerState>('getTimerStateT')
      .then<LTimerState>(timerFormatter);
  }

  getLastResults() {
    return this._jsonRpcRequest<RLastResults>('getLastResultsT')
      .then<LUserWithScore[]>(lastResultsFormatter);
  }

  getAllPlayers() {
    return this._jsonRpcRequest<RAllPlayersInEvent>('getAllPlayersT')
      .then<LUser[]>(userListFormatter);
  }

  getGameOverview(sessionHashcode: string) {
    return this._jsonRpcRequest<RSessionOverview>('getGameOverview', sessionHashcode)
      .then<LSessionOverview>(gameOverviewFormatter);
  }

  getCurrentGames(): Promise<LCurrentGame[]> {
    return this._jsonRpcRequest<RCurrentGames>('getCurrentGamesT')
      .then<LCurrentGame[]>(currentGamesFormatter);
  }

  getUserInfo(personIds: number[]) {
    return this._jsonRpcRequestFrey<RUserInfo[]>('getPersonalInfo', personIds)
      .then<LUser[]>(userListFormatter);
  }

  /**
   * @deprecated
   * @param pin
   */
  confirmRegistration(pin: string) {
    return this._jsonRpcRequest<string>('registerPlayer', pin);
  }

  getChangesOverview(state: IAppState) {
    const gameHashcode: string = state.currentSessionHash || '';
    const roundData = formatRoundToRemote(state);
    return this._jsonRpcRequest<RRoundPaymentsInfo>('addRound', gameHashcode, roundData, true);
  }

  getLastRound(sessionHashcode?: string) {
    if (!sessionHashcode) {
      return this._jsonRpcRequest<RRoundPaymentsInfo>('getLastRoundT');
    } else {
      return this._jsonRpcRequest<RRoundPaymentsInfo>('getLastRoundByHash', sessionHashcode)
        .then((result) => {
          result.sessionHash = sessionHashcode;
          return result;
        });
    }
  }

  getAllRounds(sessionHashcode: string) {
    return this._jsonRpcRequest<RRoundOverviewInfo[]>('getAllRounds', sessionHashcode);
  }

  addRound(state: IAppState) {
    const gameHashcode: string = state.currentSessionHash || '';
    const roundData = formatRoundToRemote(state);
    return this._jsonRpcRequest<boolean | SessionState>('addRound', gameHashcode, roundData, false);
  }

  getTablesState() {
    return this._jsonRpcRequest<RTablesState>('getTablesStateT')
      .then<Table[]>(tablesStateFormatter);
  }

  quickAuthorize() {
    return this._jsonRpcRequestFrey<boolean>('quickAuthorize', this._personId, this._authToken);
  }

  authorize(email: string, password: string) {
    return this._jsonRpcRequestFrey<RFreyAuthData>('authorize', email, password)
      .then<LFreyAuthData>(freyAuthFormatter);
  }

  /////////////////////////////////////////////////////////////////////////////////////

  private _jsonRpcRequest<RET_TYPE>(methodName: string, ...params: any[]): Promise<RET_TYPE> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Api-Version', environment.apiVersion.map((v) => v.toString()).join('.'));
    headers.append('X-Auth-Token', this._authToken || '');

    const jsonRpcBody = {
      jsonrpc: '2.0',
      method: methodName,
      params: params,
      id: Math.round(1000000 * Math.random()) // TODO: bind request to response?
    };

    const fetchInit: RequestInit = {
      method: 'post',
      headers,
      // mode: 'same-origin', //todo please help
      body: JSON.stringify(jsonRpcBody)
    };

    return fetch(environment.apiUrl, fetchInit)
      .then((r) => r.json())
      .then<RET_TYPE>((resp: GenericResponse) => {
        if (resp.error) {
          if (!environment.production) {
            console.error(resp.error.message);
          }
          throw new RemoteError(resp.error.message, resp.error.code.toString());
        }

        return resp.result; // TODO: runtime checks of object structure
      });
  }

  private _jsonRpcRequestFrey<RET_TYPE>(methodName: string, ...params: any[]): Promise<RET_TYPE> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Api-Version', environment.apiVersion.map((v) => v.toString()).join('.'));
    headers.append('X-Auth-Token', this._authToken || '');
    headers.append('X-Current-Person-Id', this._personId || '');

    const jsonRpcBody = {
      jsonrpc: '2.0',
      method: methodName,
      params: params,
      id: Math.round(1000000 * Math.random()) // TODO: bind request to response?
    };

    const fetchInit: RequestInit = {
      method: 'post',
      headers,
      // mode: 'same-origin', //todo please help
      body: JSON.stringify(jsonRpcBody)
    };

    return fetch(environment.uaUrl, fetchInit)
      .then((r) => r.json())
      .then<RET_TYPE>((resp: GenericResponse) => {
        if (resp.error) {
          if (!environment.production) {
            console.error(resp.error.message);
          }
          throw new RemoteError(resp.error.message, resp.error.code.toString());
        }

        return resp.result; // TODO: runtime checks of object structure
      });
  }
}
