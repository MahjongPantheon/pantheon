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

import { Component, Input } from '@angular/core';
import { Yaku, Player } from '../../interfaces/common';
import { YakuId, yakuMap, sortByViewPriority } from '../../primitives/yaku';
import { AppState } from '../../primitives/appstate';
import { RRoundPaymentsInfo } from '../../interfaces/remote';
import { RiichiApiService } from '../../services/riichiApi';
import { RemoteError } from '../../services/remoteError';

@Component({
  selector: 'screen-last-round',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class LastRoundScreen {
  @Input() state: AppState;
  public _dataReady: boolean;
  public _data: RRoundPaymentsInfo;
  public confirmed: boolean = false;
  public _error: string = '';

  constructor(private api: RiichiApiService) { }

  ngOnInit() {
    this._error = '';
    this._dataReady = false;
    this.api.getLastRound()
      .then((overview) => {
        if (overview) {
          this._data = overview;
          this._dataReady = true;
        } else {
          this.onerror(null); // TODO: log it
        }
      })
      .catch((e) => this.onerror(e));
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
      case 'ron': return 'Рон';
      case 'tsumo': return 'Цумо';
      case 'draw': return 'Ничья';
      case 'abort': return 'Абортивная ничья';
      case 'chombo': return 'Чомбо';
      case 'multiron': return this._data.winner.length === 2 ? 'Дабл-рон' : 'Трипл-рон';
    }
  }

  private _getYakuList(str: string) {
    const yakuIds: YakuId[] = str.split(',').map((y) => parseInt(y, 10));
    const yakuNames: string[] = yakuIds.map((y) => yakuMap[y].name.toLowerCase());
    return yakuNames.join(', ');
  }

  private _getPlayerName(player_id: number): string {
    let players = this.state.getPlayers();
    for (let i in players) {
      if (players[i].id == player_id) {
        return players[i].displayName;
      }
    }
    return '';
  }

  onerror(e) {
    this._dataReady = true;
    this._error = 'Произошла ошибка. Попробуйте еще раз.';
    if (!e) {
      this._error = `Последняя внесенная раздача не найдена.`;
    } else if (e instanceof RemoteError) {
      if (e.code === 403) {
        this._error = 'Не удалось выполнить действие: авторизация не подтверждена';
      } else {
        this._error = 'Не удалось выполнить действие. Ошибка сервера.';
      }
    }
  }
}
