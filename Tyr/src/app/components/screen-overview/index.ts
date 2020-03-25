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
import {MetrikaService} from '../../services/metrika';
import {Player} from '../../interfaces/common';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {IAppState} from "../../services/store/interfaces";
import {Dispatch} from "redux";
import {
  AppActionTypes,
  SHOW_LAST_RESULTS,
  SHOW_LAST_ROUND,
  SHOW_OTHER_TABLES_LIST,
  START_NEW_GAME,
  UPDATE_CURRENT_GAMES_INIT
} from "../../services/store/actions/interfaces";
import {getCurrentTimerZone} from "../../services/store/selectors/mimirSelectors";

@Component({
  selector: 'screen-overview',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class OverviewScreen extends I18nComponent {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) { super(i18n); }

  self: Player;
  shimocha: Player;
  toimen: Player;
  kamicha: Player;

  seatSelf: string;
  seatShimocha: string;
  seatToimen: string;
  seatKamicha: string;

  _diffedBy: string = null;

  get greeting() {
    return this.i18n._t('Hello, %1!', [this.state.currentPlayerDisplayName]);
  }

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-overview' });
  }

  getScore(who) {
    let score = this[who].score;
    if (!this._diffedBy) {
      return score;
    }

    if (this._diffedBy && this._diffedBy !== who) {
      score -= this[this._diffedBy].score;
    }
    return (score > 0 && this._diffedBy !== who) ? '+' + score : score;
  }

  getChomboCount(who) {
    return Math.abs(
      (this[who].penalties || 0) /
      this.state.gameConfig.chomboPenalty
    ) || '';
  }

  get timeRemaining() {
    if (!this.state.gameConfig.useTimer) {
      return '';
    }

    if (this.state.timer.waiting) {
      return '⏳';
    }

    let min = Math.floor(this.state.timer.secondsRemaining / 60);
    let sec = this.state.timer.secondsRemaining % 60;
    return min.toString() + ':' + (
      (sec < 10) ? ("0" + sec.toString()) : sec.toString()
    );
  }

  get redZone() {
    return this.state.gameConfig.useTimer && getCurrentTimerZone(this.state) === 'redZone';
  }

  get yellowZone() {
    return this.state.gameConfig.useTimer && getCurrentTimerZone(this.state) === 'yellowZone';
  }

  get showNewGame(): boolean {
    return !this.state.gameConfig.autoSeating && !this.isUniversalWatcher;
  }

  get showStatButton(): boolean {
    return !!this.state.gameConfig.eventStatHost && !this.isUniversalWatcher;
  }

  newGame() {
    this.dispatch({ type: START_NEW_GAME })
  }

  lastResults() {
    this.dispatch({ type: SHOW_LAST_RESULTS });
  }

  gotoStat() {
    window.open(`https://${this.state.gameConfig.eventStatHost}/last/`);
  }

  reloadOverview() {
    this.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
  }

  viewLastRound() {
    this.dispatch({ type: SHOW_LAST_ROUND });
  }

  playerClick(who: string) {
    if (this._diffedBy === who) {
      this._diffedBy = null;
    } else {
      this._diffedBy = who;
    }
  }

  otherTables() {
    this.dispatch({ type: SHOW_OTHER_TABLES_LIST });
  }

  ngOnChanges() {
    if (!this.state.players || this.state.players.length !== 4) {
      return;
    }

    let players: Player[] = [].concat(this.state.players);
    let seating = ['東', '南', '西', '北'];
    for (let i = 1; i < this.state.currentRound; i++) {
      seating = [seating.pop()].concat(seating);
    }

    const current = this.state.currentPlayerId;
    for (let i = 0; i < 4; i++) {
      if (players[0].id === current) {
        break;
      }

      players = players.slice(1).concat(players[0]);
      seating = seating.slice(1).concat(seating[0]);
    }

    this.self = players[0];
    this.shimocha = players[1];
    this.toimen = players[2];
    this.kamicha = players[3];

    this.seatSelf = seating[0];
    this.seatShimocha = seating[1];
    this.seatToimen = seating[2];
    this.seatKamicha = seating[3];
  }

  get isUniversalWatcher() {
    return this.state.isUniversalWatcher;
  }
}


