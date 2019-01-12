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
import { AppState } from '../../primitives/appstate';
import { MetrikaService } from '../../services/metrika';
import { Player } from '../../interfaces/common';
import { I18nComponent, I18nService } from '../auxiliary-i18n';

@Component({
  selector: 'screen-overview',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class OverviewScreen extends I18nComponent {
  @Input() state: AppState;
  @Input() players: [Player, Player, Player, Player];
  @Input('loading') _loading: boolean;
  @Input() currentGameHash: string;
  @Input() currentRound: number;
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
    return this.i18n._t('Hello, %1!', [this.state.playerName()]);
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
      this.state.getGameConfig('chomboPenalty')
    ) || '';
  }

  get timeRemaining() {
    if (!this.state.getGameConfig('useTimer')) {
      return '';
    }

    if (this.state.isTimerWaiting()) {
      return '⏳';
    }

    let min = Math.floor(this.state.getTimeRemaining() / 60);
    let sec = this.state.getTimeRemaining() % 60;
    return min.toString() + ':' + (
      (sec < 10) ? ("0" + sec.toString()) : sec.toString()
    );
  }

  get redZone() {
    return this.state.getGameConfig('useTimer') && this.state.getCurrentTimerZone() === 'redZone';
  }

  get yellowZone() {
    return this.state.getGameConfig('useTimer') && this.state.getCurrentTimerZone() === 'yellowZone';
  }

  get showNewGame(): boolean {
    return !this.state.getGameConfig('autoSeating') && !this.isUniversalWatcher;
  }

  get showStatButton(): boolean {
    return !!this.state.getGameConfig('eventStatHost') && !this.isUniversalWatcher;
  }

  newGame() {
    this.state.newGame();
  }

  lastResults() {
    this.state.showLastResults();
  }

  gotoStat() {
    window.open(`http://${this.state.getGameConfig('eventStatHost')}/last/`);
  }

  reloadOverview() {
    this.state.updateCurrentGames();
  }

  viewLastRound() {
    this.state.showLastRound();
  }

  playerClick(who: string) {
    if (this._diffedBy === who) {
      this._diffedBy = null;
    } else {
      this._diffedBy = who;
    }
  }

  otherTables() {
    this.state.showOtherTablesList();
  }

  ngOnChanges() {
    if (!this.players || this.players.length !== 4) {
      return;
    }

    let players: Player[] = [].concat(this.players);
    let seating = ['東', '南', '西', '北'];
    for (let i = 1; i < this.currentRound; i++) {
      seating = [seating.pop()].concat(seating);
    }

    const current = this.state.getCurrentPlayerId();
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
    return this.state.isUniversalWatcher();
  }
}


