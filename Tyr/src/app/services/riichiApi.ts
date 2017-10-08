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

import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { RemoteError } from './remoteError';
import {
  RRound,
  RRoundRon, RRoundTsumo, RRoundDraw, RRoundAbort, RRoundChombo,
  RTimerState, RGameConfig, RSessionOverview, RCurrentGames,
  RUserInfo, RAllPlayersInEvent, RLastResults,
  RRoundPaymentsInfo, RTablesState
} from '../interfaces/remote';
import {
  LCurrentGame,
  LUser,
  LUserWithScore,
  LTimerState,
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
  tablesStateFormatter
} from './formatters';
import { AppState } from '../primitives/appstate';
import 'rxjs/add/operator/toPromise';
import config from '../config';
import { environment } from '../../environments/environment';

@Injectable()
export class RiichiApiService {
  private _authToken: string = null;
  constructor(private http: Http) { }
  setCredentials(token: string) {
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
    return this._jsonRpcRequest<RSessionOverview>('getGameOverview', sessionHashcode);
  }

  getCurrentGames(): Promise<LCurrentGame[]> {
    return this._jsonRpcRequest<RCurrentGames>('getCurrentGamesT')
      .then<LCurrentGame[]>(currentGamesFormatter);
  }

  getUserInfo() {
    return this._jsonRpcRequest<RUserInfo>('getPlayerT')
      .then<LUser>(userInfoFormatter);
  }

  confirmRegistration(pin: string) {
    return this._jsonRpcRequest<string>('registerPlayer', pin);
  }

  getChangesOverview(state: AppState) {
    const gameHashcode: string = state.getHashcode();
    const roundData = formatRoundToRemote(state);
    return this._jsonRpcRequest<RRoundPaymentsInfo>('addRound', gameHashcode, roundData, true);
  }

  getLastRound(sessionHashcode?: string) {
    if (!sessionHashcode) {
      return this._jsonRpcRequest<RRoundPaymentsInfo>('getLastRoundT');
    } else {
      return this._jsonRpcRequest<RRoundPaymentsInfo>('getLastRoundByHash', sessionHashcode);
    }
  }

  addRound(state: AppState) {
    const gameHashcode: string = state.getHashcode();
    const roundData = formatRoundToRemote(state);
    return this._jsonRpcRequest<boolean>('addRound', gameHashcode, roundData, false);
  }

  getTablesState() {
    return this._jsonRpcRequest<RTablesState>('getTablesStateT')
      .then<Table[]>(tablesStateFormatter);
  }

  /////////////////////////////////////////////////////////////////////////////////////

  private _jsonRpcRequest<RET_TYPE>(methodName: string, ...params: any[]): Promise<RET_TYPE> {
    const commonHeaders = new Headers({
      'Content-type': 'application/json',
      'X-Auth-Token': this._authToken,
      'X-Api-Version': config.apiVersion.map((v) => v.toString()).join('.')
    });
    const jsonRpcBody = {
      jsonrpc: "2.0",
      method: methodName,
      params: params,
      id: Math.round(1000000 * Math.random()) // TODO: bind request to response?
    };

    return this.http
      .post(environment.apiUrl, jsonRpcBody, { headers: commonHeaders })
      .toPromise()
      .then<RET_TYPE>((response) => {
        this._checkCompatibility(response.headers.get('x-api-version')); // for some reason headers are lowercase
        const json = response.json();
        if (json.error) {
          if (isDevMode()) {
            console.error(json.error.message);
          }
          throw new RemoteError(json.error.message, json.error.code);
        }

        return json.result; // TODO: runtime checks of object structure
      });
  }

  private _checkCompatibility(versionString) {
    const [major, minor] = (versionString || '').split('.').map((v) => parseInt(v, 10));
    const [localMajor, localMinor] = config.apiVersion;
    if (major !== localMajor) {
      console.error('API major version mismatch. Update your app or API instance!');
      throw new Error('Critical: API major version mismatch');
    }

    if (minor > localMinor && isDevMode()) {
      console.warn('API minor version mismatch. Consider updating if possible');
    }
  }
}
