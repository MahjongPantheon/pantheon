/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.dev>
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

import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { RemoteError } from './remoteError';
import {
  RTimerState, RGameConfig, RSessionOverview, RCurrentGames,
  RUserInfo, RAllPlayersInEvent, RLastResults,
  RRoundPaymentsInfo, RTablesState, SessionState
} from '../interfaces/remote';
import {
  LCurrentGame,
  LUser,
  LUserWithScore,
  LTimerState,
  LSessionOverview,
  LGameConfig
} from '../interfaces/local';
import { Table } from '../interfaces/common';
import {
  currentGamesFormatter,
  formatRoundToRemote,
  userInfoFormatter,
  userListFormatter,
  lastResultsFormatter,
  timerFormatter,
  gameConfigFormatter,
  tablesStateFormatter,
  gameOverviewFormatter
} from './formatters';
import config from '../config';
import { environment } from '../../environments/environment';
import {IAppState} from './store/interfaces';

type GenericResponse = {
  error?: { message: string, code: any },
  headers: any,
  result: any
};

@Injectable()
export class RiichiApiService {
  private _authToken: string = null;
  private _personId: string = null;
  constructor(private http: HttpClient) { }
  setCredentials(personId: number, token: string) {
    this._personId = (personId || 0).toString();
    this._authToken = token;
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
      .then<LUser[]>(userInfoFormatter);
  }

  /**
   * @deprecated
   * @param pin
   */
  confirmRegistration(pin: string) {
    return this._jsonRpcRequest<string>('registerPlayer', pin);
  }

  getChangesOverview(state: IAppState) {
    const gameHashcode: string = state.currentSessionHash;
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

  addRound(state: IAppState) {
    const gameHashcode: string = state.currentSessionHash;
    const roundData = formatRoundToRemote(state);
    return this._jsonRpcRequest<boolean | SessionState>('addRound', gameHashcode, roundData, false);
  }

  getTablesState() {
    return this._jsonRpcRequest<RTablesState>('getTablesStateT')
      .then<Table[]>(tablesStateFormatter);
  }

  quickAuthorize(personId: number, token: string) {
    return this._jsonRpcRequestFrey<boolean>('quickAuthorize', personId, token);
  }

  /////////////////////////////////////////////////////////////////////////////////////

  private _jsonRpcRequest<RET_TYPE>(methodName: string, ...params: any[]): Promise<RET_TYPE> {
    const commonHeaders = new HttpHeaders({
      'Content-type': 'application/json',
      'X-Api-Version': config.apiVersion.map((v) => v.toString()).join('.'),
      'X-Auth-Token': this._authToken || '',
    });
    const jsonRpcBody = {
      jsonrpc: '2.0',
      method: methodName,
      params: params,
      id: Math.round(1000000 * Math.random()) // TODO: bind request to response?
    };

    return this.http
      .post(environment.apiUrl, jsonRpcBody, { headers: commonHeaders })
      .toPromise()
      .then<RET_TYPE>((response: GenericResponse) => {
        if (response.error) {
          if (isDevMode()) {
            console.error(response.error.message);
          }
          throw new RemoteError(response.error.message, response.error.code.toString());
        }

        return response.result; // TODO: runtime checks of object structure
      });
  }

  private _jsonRpcRequestFrey<RET_TYPE>(methodName: string, ...params: any[]): Promise<RET_TYPE> {
    const commonHeaders = new HttpHeaders({
      'Content-type': 'application/json',
      'X-Current-Person-Id': this._personId || '0',
      'X-Auth-Token': this._authToken || '',
    });
    const jsonRpcBody = {
      jsonrpc: '2.0',
      method: methodName,
      params: params,
      id: Math.round(1000000 * Math.random()) // TODO: bind request to response?
    };

    return this.http
      .post(environment.uaUrl, jsonRpcBody, { headers: commonHeaders })
      .toPromise()
      .then<RET_TYPE>((response: GenericResponse) => {
        if (response.error) {
          if (isDevMode()) {
            console.error(response.error.message);
          }
          throw new RemoteError(response.error.message, response.error.code.toString());
        }

        return response.result; // TODO: runtime checks of object structure
      });
  }
}
