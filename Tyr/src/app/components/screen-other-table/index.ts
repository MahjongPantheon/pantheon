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

import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Player} from '../../interfaces/common';
import {MetrikaService} from '../../services/metrika';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {IAppState} from '../../services/store/interfaces';
import {Dispatch} from 'redux';
import {
  AppActionTypes,
  GET_OTHER_TABLE_INIT,
  GET_OTHER_TABLE_RELOAD,
  SHOW_LAST_ROUND,
  TABLE_ROTATE_CLOCKWISE,
  TABLE_ROTATE_COUNTERCLOCKWISE,
  TOGGLE_OVERVIEW_DIFFBY
} from '../../services/store/actions/interfaces';
import {
  getChomboKamicha,
  getChomboSelf,
  getChomboShimocha,
  getChomboToimen,
  getScoreKamicha,
  getScoreSelf,
  getScoreShimocha,
  getScoreToimen,
} from '../../services/store/selectors/overviewSelectors';
import {getOutcomeName} from '../../services/store/selectors/commonSelectors';
import {
  getPenalty,
  getWins
} from '../../services/store/selectors/otherTableSelectors';
import {
  getSelf,
  getShimocha,
  getToimen,
  getKamicha,
  getSeatSelf,
  getSeatShimocha,
  getSeatToimen,
  getSeatKamicha
} from 'app/services/store/selectors/roundPreviewSchemeSelectors';

@Component({
  selector: 'screen-other-table',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class OtherTableScreenComponent extends I18nComponent implements OnInit {
  get self(): Player { return getSelf(this.state, 'other_overview'); }
  get shimocha(): Player { return getShimocha(this.state, 'other_overview'); }
  get toimen(): Player { return getToimen(this.state, 'other_overview'); }
  get kamicha(): Player { return getKamicha(this.state, 'other_overview'); }

  get seatSelf(): string { return getSeatSelf(this.state, 'other_overview'); }
  get seatShimocha(): string { return getSeatShimocha(this.state, 'other_overview'); }
  get seatToimen(): string { return getSeatToimen(this.state, 'other_overview'); }
  get seatKamicha(): string { return getSeatKamicha(this.state, 'other_overview'); }

  get scoreSelf(): string { return getScoreSelf(this.state, this.state.currentOtherTablePlayers); }
  get scoreShimocha(): string { return getScoreShimocha(this.state, this.state.currentOtherTablePlayers); }
  get scoreToimen(): string { return getScoreToimen(this.state, this.state.currentOtherTablePlayers); }
  get scoreKamicha(): string { return getScoreKamicha(this.state, this.state.currentOtherTablePlayers); }

  get chomboSelf(): string { return getChomboSelf(this.state, this.state.currentOtherTablePlayers); }
  get chomboShimocha(): string { return getChomboShimocha(this.state, this.state.currentOtherTablePlayers); }
  get chomboToimen(): string { return getChomboToimen(this.state, this.state.currentOtherTablePlayers); }
  get chomboKamicha(): string { return getChomboKamicha(this.state, this.state.currentOtherTablePlayers); }

  get _loading() {
    return this.state.loading.otherTable
      || this.state.loading.overview
      || this.state.currentOtherTablePlayers.length === 0
      || !this.state.currentOtherTable;
  }
  get currentTable() {
    return {
      round: this.state.currentOtherTable.currentRound,
      honba: this.state.currentOtherTable.honba,
      riichi: this.state.currentOtherTable.riichiOnTable
    };
  }

  /// last round sub-screen related

  get penalty() { return getPenalty(this.state.lastRoundOverview, this.state.currentOtherTablePlayers); }
  get wins() { return getWins(this.state.lastRoundOverview, this.state.currentOtherTablePlayers, this.i18n); }
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) { super(i18n); }

  reloadOverview() {
    this.dispatch({ type: GET_OTHER_TABLE_RELOAD });
  }

  viewLastRound() {
    this.dispatch({ type: SHOW_LAST_ROUND });
  }

  rotateTable(dir: boolean) {
    this.dispatch({ type: dir ? TABLE_ROTATE_COUNTERCLOCKWISE : TABLE_ROTATE_CLOCKWISE });
  }

  playerClick(who: IAppState['overviewDiffBy']) { this.dispatch( { type: TOGGLE_OVERVIEW_DIFFBY, payload: who }); }

  ngOnInit() {
    this.dispatch({ type: GET_OTHER_TABLE_INIT, payload: this.state.currentOtherTableHash });
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-other-table' });
  }
}
