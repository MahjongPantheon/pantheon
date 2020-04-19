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
import {Player} from '../../interfaces/common';
import {MetrikaService} from '../../services/metrika';
import {RRoundPaymentsInfo} from '../../interfaces/remote';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {IAppState} from '../../services/store/interfaces';
import {Dispatch} from 'redux';
import {
  AppActionTypes,
  GET_OTHER_TABLE_INIT,
  GET_OTHER_TABLE_LAST_ROUND_INIT, TABLE_ROTATE_CLOCKWISE, TABLE_ROTATE_COUNTERCLOCKWISE, TOGGLE_OVERVIEW_DIFFBY
} from '../../services/store/actions/interfaces';
import {
  getChomboKamicha,
  getChomboSelf, getChomboShimocha, getChomboToimen,
  getKamicha, getScoreKamicha, getScoreSelf, getScoreShimocha, getScoreToimen, getSeatKamicha,
  getSeatSelf, getSeatShimocha, getSeatToimen,
  getSelf,
  getShimocha,
  getToimen
} from '../../services/store/selectors/overviewSelectors';
import {getOutcomeName} from '../../services/store/selectors/lastRoundSelectors';
import {
  getNotenPlayers, getPenalty,
  getRiichiPlayers,
  getTempaiPlayers,
  getWins
} from '../../services/store/selectors/otherTableSelectors';

@Component({
  selector: 'screen-other-table',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class OtherTableScreen extends I18nComponent {

  get lastRoundInfo() {
    if (this._showLastRound) {
      return this.state.currentOtherTableLastRound;
    }

    return null;
  }

  get self(): Player { return getSelf(this.state, this.state.currentOtherTablePlayers); }
  get shimocha(): Player { return getShimocha(this.state, this.state.currentOtherTablePlayers); }
  get toimen(): Player { return getToimen(this.state, this.state.currentOtherTablePlayers); }
  get kamicha(): Player { return getKamicha(this.state, this.state.currentOtherTablePlayers); }

  get seatSelf(): string { return getSeatSelf(this.state, this.state.currentOtherTablePlayers); }
  get seatShimocha(): string { return getSeatShimocha(this.state, this.state.currentOtherTablePlayers); }
  get seatToimen(): string { return getSeatToimen(this.state, this.state.currentOtherTablePlayers); }
  get seatKamicha(): string { return getSeatKamicha(this.state, this.state.currentOtherTablePlayers); }

  get scoreSelf(): string { return getScoreSelf(this.state, this.state.currentOtherTablePlayers); }
  get scoreShimocha(): string { return getScoreShimocha(this.state, this.state.currentOtherTablePlayers); }
  get scoreToimen(): string { return getScoreToimen(this.state, this.state.currentOtherTablePlayers); }
  get scoreKamicha(): string { return getScoreKamicha(this.state, this.state.currentOtherTablePlayers); }

  get chomboSelf(): string { return getChomboSelf(this.state, this.state.currentOtherTablePlayers); }
  get chomboShimocha(): string { return getChomboShimocha(this.state, this.state.currentOtherTablePlayers); }
  get chomboToimen(): string { return getChomboToimen(this.state, this.state.currentOtherTablePlayers); }
  get chomboKamicha(): string { return getChomboKamicha(this.state, this.state.currentOtherTablePlayers); }

  get _loading() { return !this._dataUpdated && this.state.loading.otherTable; }
  get currentGameHash() { return this.state.currentOtherTableHash; }
  get currentTable() { return this.state.currentOtherTable.state; }
  get outcomeName() { return getOutcomeName(this.state.currentOtherTableLastRound); }

  /// last round sub-screen related

  get penalty() { return getPenalty(this.state.currentOtherTableLastRound, this.state.currentOtherTablePlayers); }
  get wins() { return getWins(this.state.currentOtherTableLastRound, this.state.currentOtherTablePlayers); }
  get tempaiPlayers() { return getTempaiPlayers(this.state.currentOtherTableLastRound, this.state.currentOtherTablePlayers); }
  get notenPlayers() { return getNotenPlayers(this.state.currentOtherTableLastRound, this.state.currentOtherTablePlayers); }
  get riichiPlayers() { return getRiichiPlayers(this.state.currentOtherTableLastRound, this.state.currentOtherTablePlayers); }
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  /**
   * Flag to prevent blinking on manual updates when all data was already loaded
   */
  private _dataUpdated = false;
  private _updateInterval: NodeJS.Timer;
  private _lastRoundLocal: RRoundPaymentsInfo;
  private _showLastRound = false;
  private _lastRoundTimer: NodeJS.Timer;

  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) { super(i18n); }

  reloadOverview() { this.dispatch({ type: GET_OTHER_TABLE_INIT, payload: this.currentGameHash }); }
  viewLastRound() {
    this.dispatch({ type: GET_OTHER_TABLE_LAST_ROUND_INIT, payload: this.currentGameHash });
    clearTimeout(this._lastRoundTimer);
    this._lastRoundTimer = setTimeout(() => this._showLastRound = false, 8000);
  }

  rotateTable(dir: boolean) {
    this.dispatch({ type: dir ? TABLE_ROTATE_COUNTERCLOCKWISE : TABLE_ROTATE_CLOCKWISE });
  }

  playerClick(who: IAppState['overviewDiffBy']) { this.dispatch( { type: TOGGLE_OVERVIEW_DIFFBY, payload: who }); }

  ngOnChanges() {
    if (
      this.state.currentOtherTableLastRound &&
      this._lastRoundLocal &&
      this._lastRoundLocal.penaltyFor !== this.state.currentOtherTableLastRound.penaltyFor &&
      this._lastRoundLocal.honba !== this.state.currentOtherTableLastRound.honba &&
      this._lastRoundLocal.round !== this.state.currentOtherTableLastRound.round
    ) {
      clearTimeout(this._lastRoundTimer);
      this._showLastRound = true;
      this._lastRoundTimer = setTimeout(() => this._showLastRound = false, 8000);
    }

    this._lastRoundLocal = this.state.currentOtherTableLastRound;
  }

  ngOnInit() {
    this.dispatch({ type: GET_OTHER_TABLE_INIT, payload: this.currentGameHash });
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-other-table' });
    this._lastRoundTimer = null;
    this._showLastRound = false;
    this._updateInterval = setInterval(() => this._dataUpdated && this.reloadOverview(), 5000);
  }

  ngOnDestroy() {
    clearInterval(this._updateInterval);
    clearTimeout(this._lastRoundTimer);
  }
}


