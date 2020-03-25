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

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import { Yaku, Player } from '../../interfaces/common';
import { YakuId, yakuMap, sortByViewPriority } from '../../primitives/yaku';
import { AppState } from '../../primitives/appstate';
import { RRoundPaymentsInfo } from '../../interfaces/remote';
import { RiichiApiService } from '../../services/riichiApi';
import { MetrikaService } from '../../services/metrika';
import { RemoteError } from '../../services/remoteError';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import {IAppState} from "../../services/store/interfaces";
import {Dispatch} from "redux";
import {AppActionTypes, GET_LAST_ROUND_INIT} from "../../services/store/actions/interfaces";

@Component({
  selector: 'screen-last-round',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class LastRoundScreen extends I18nComponent {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  public _dataReady: boolean;
  public _data: RRoundPaymentsInfo;
  public confirmed: boolean = false;
  public _error: string = '';

  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) {
    super(i18n);
  }

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-last-round' });
    this._error = '';
    this._dataReady = false;

    this.dispatch({ type: GET_LAST_ROUND_INIT, payload: this.state.currentSessionHash, async: true });
    // this._data = overview; // TODO ##1: this should be taken from state!
  }

  getWins(): Array<{ winner: string, han: number, fu: number, dora: number, yakuList: string }> {
    switch (this._data.outcome) {
      case 'ron':
      case 'tsumo':
        return [{
          winner: this._getPlayerName(this._data.winner),
          yakuList: this._getYakuList(this._data.yaku),
          han: this._data.han,
          fu: this._data.fu,
          dora: this._data.dora
        }];
      case 'multiron':
        let wins = [];
        for (let idx in this._data.winner) {
          wins.push({
            winner: this._getPlayerName(this._data.winner[idx]),
            yakuList: this._getYakuList(this._data.yaku[idx]),
            han: this._data.han[idx],
            fu: this._data.fu[idx],
            dora: this._data.dora[idx]
          });
        }
        return wins;
    }
  }

  getOutcomeName() {
    switch (this._data.outcome) {
      case 'ron': return this.i18n._t('Ron');
      case 'tsumo': return this.i18n._t('Tsumo');
      case 'draw': return this.i18n._t('Exhaustive draw');
      case 'abort': return this.i18n._t('Abortive draw');
      case 'chombo': return this.i18n._t('Chombo');
      case 'nagashi': return this.i18n._t('Nagashi mangan');
      case 'multiron': return (this._data.winner.length === 2
        ? this.i18n._t('Double ron')
        : this.i18n._t('Triple ron')
      );
    }
  }

  private _getYakuList(str: string) {
    const yakuIds: YakuId[] = str.split(',').map((y) => parseInt(y, 10));
    const yakuNames: string[] = yakuIds.map((y) => yakuMap[y].name(this.i18n).toLowerCase());
    return yakuNames.join(', ');
  }

  private _getPlayerName(playerId: number): string {
    let players = this.state.getPlayers();
    for (let i in players) {
      if (players[i].id == playerId) {
        return players[i].displayName;
      }
    }
    return '';
  }

  onerror(e) {
    this._dataReady = true;
    this._error = this.i18n._t('Error occured. Try again.');
    if (!e) {
      this._error = this.i18n._t("Latest hand wasn't found");
    } else if (e instanceof RemoteError) {
      this.metrika.track(MetrikaService.LOAD_ERROR, { type: 'screen-last-round', request: 'getLastRound' });
      if (e.code === 403) {
        this._error = this.i18n._t("Authentication failed");
      } else {
        this._error = this.i18n._t('Unexpected server error');
      }
    }
  }
}
