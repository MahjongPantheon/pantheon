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
  AddRound,
  CallReferee,
  GetAllRegisteredPlayers,
  GetAllRounds,
  GetCurrentStateForPlayer,
  GetCurrentStateResponse,
  GetGameConfig,
  GetLastResults,
  GetLastRound,
  GetLastRoundByHash,
  GetMyEvents,
  GetSessionOverview,
  GetTablesState,
  ListMyPenalties,
  PreviewRound,
  StartGame,
} from '../clients/proto/mimir.pb';
import { IRiichiApi } from './IRiichiApi';
import { Authorize, GetPersonalInfo, QuickAuthorize } from '../clients/proto/frey.pb';
import { formatRoundToTwirp } from './formatters';
import { ClientConfiguration } from 'twirpscript';
import { Penalty, SessionStatus } from '../clients/proto/atoms.pb';

import { handleReleaseTag } from './releaseTags';
import { env } from '../helpers/env';

export class RiichiApiTwirpService implements IRiichiApi {
  private _authToken: string | null = null;
  private _personId: string | null = null;
  private readonly _clientConfMimir: ClientConfiguration = {
    prefix: '/v2',
  };
  private readonly _clientConfFrey: ClientConfiguration = {
    prefix: '/v2',
  };

  setCredentials(personId: number, token: string) {
    this._authToken = token;
    this._personId = (personId || 0).toString();

    const headers = new Headers();
    headers.append('X-Auth-Token', this._authToken ?? '');
    headers.append('X-Twirp', 'true');
    headers.append('X-Current-Person-Id', this._personId ?? '');

    this._clientConfMimir.baseURL = env.urls.mimir;
    this._clientConfFrey.baseURL = env.urls.frey;
    // eslint-disable-next-line no-multi-assign
    this._clientConfFrey.rpcTransport = this._clientConfMimir.rpcTransport = (url, opts) => {
      Object.keys(opts.headers ?? {}).forEach((key) => headers.set(key, opts.headers[key]));
      return fetch(url + (process.env.NODE_ENV === 'production' ? '' : '?XDEBUG_SESSION=start'), {
        ...opts,
        headers,
      })
        .then(handleReleaseTag)
        .then((resp) => {
          if (!resp.ok) {
            return resp.json().then((err) => {
              // Twirp server error handling
              if (err.code && err.code === 'internal' && err.meta && err.meta.cause) {
                fetch(env.urls.hugin, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    source: 'Tyr [twirp]',
                    error: `From: ${
                      typeof window !== 'undefined' && window.location.href
                    } | To: ${url} | Details: ${err.meta.cause}`,
                  }),
                });
                throw new Error(err.meta.cause);
              }
              return resp;
            });
          }
          return resp;
        });
    };
  }

  // returns game hashcode
  startGame(eventId: number, playerIds: number[]) {
    return StartGame(
      {
        eventId,
        players: playerIds,
      },
      this._clientConfMimir
    ).then((val) => val.sessionHash);
  }

  getMyEvents() {
    return GetMyEvents({}, this._clientConfMimir).then((val) => val.events);
  }

  getGameConfig(eventId: number) {
    return GetGameConfig({ eventId }, this._clientConfMimir);
  }

  getLastResults(playerId: number, eventId: number) {
    return GetLastResults(
      {
        playerId,
        eventId,
      },
      this._clientConfMimir
    ).then((val) => val.results);
  }

  getAllPlayers(eventId: number) {
    return GetAllRegisteredPlayers({ eventIds: [eventId] }, this._clientConfMimir).then(
      (val) => val.players
    );
  }

  getGameOverview(sessionHashcode: string) {
    return GetSessionOverview({ sessionHash: sessionHashcode }, this._clientConfMimir);
  }

  getCurrentState(playerId: number, eventId: number): Promise<GetCurrentStateResponse> {
    return GetCurrentStateForPlayer({ playerId, eventId }, this._clientConfMimir);
  }

  getUserInfo(personIds: number[]) {
    return GetPersonalInfo({ ids: personIds }, this._clientConfFrey).then((val) => val.people);
  }

  /**
   * @deprecated
   * @param pin
   */
  confirmRegistration(pin: string) {
    return Promise.resolve(pin);
  }

  getChangesOverview(state: IAppState) {
    const roundData = formatRoundToTwirp(state);
    if (!state.currentSessionHash || !roundData) {
      return Promise.reject();
    }

    return PreviewRound(
      { sessionHash: state.currentSessionHash, roundData },
      this._clientConfMimir
    ).then((val) => val.state);
  }

  getLastRoundByHash(sessionHashcode: string) {
    return GetLastRoundByHash({ sessionHash: sessionHashcode }, this._clientConfMimir).then(
      (r) => r.round
    );
  }

  getLastRound(playerId: number, eventId: number) {
    return GetLastRound({ playerId, eventId }, this._clientConfMimir).then((val) => val.round);
  }

  getAllRounds(sessionHashcode: string) {
    return GetAllRounds({ sessionHash: sessionHashcode }, this._clientConfMimir).then(
      (val) => val.rounds
    );
  }

  addRound(state: IAppState) {
    const sessionHash: string = state.currentSessionHash ?? '';
    const roundData = formatRoundToTwirp(state);
    if (!sessionHash || !roundData) {
      return Promise.reject();
    }
    return AddRound({ sessionHash, roundData }, this._clientConfMimir);
  }

  getTablesState(eventId: number) {
    return GetTablesState({ eventId, omitLastRound: true }, this._clientConfMimir).then((v) =>
      v.tables.filter((t) => t.status === SessionStatus.SESSION_STATUS_INPROGRESS)
    );
  }

  quickAuthorize() {
    if (!this._personId || !this._authToken) {
      return Promise.reject();
    }
    return QuickAuthorize(
      {
        personId: parseInt(this._personId, 10),
        authToken: this._authToken,
      },
      this._clientConfFrey
    ).then((v) => v.authSuccess);
  }

  authorize(email: string, password: string) {
    return Authorize({ email, password }, this._clientConfFrey);
  }

  callReferee(eventId: number, tableIndex: number): Promise<boolean> {
    return CallReferee({ eventId, tableIndex }, this._clientConfMimir).then((v) => v.success);
  }

  getPenalties(eventId: number): Promise<Penalty[]> {
    return ListMyPenalties({ eventId }, this._clientConfMimir).then((v) => v.penalties);
  }
}
