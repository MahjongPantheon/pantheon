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
import {MetrikaService} from '../../services/metrika';
import {Player} from '../../interfaces/common';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {IAppState} from '../../services/store/interfaces';
import {Dispatch} from 'redux';
import {
  AppActionTypes,
  SHOW_LAST_RESULTS,
  SHOW_LAST_ROUND,
  SHOW_OTHER_TABLES_LIST,
  START_NEW_GAME, TOGGLE_OVERVIEW_DIFFBY,
  UPDATE_CURRENT_GAMES_INIT
} from '../../services/store/actions/interfaces';
import {getCurrentTimerZone} from '../../services/store/selectors/mimirSelectors';
import {
  getChomboKamicha,
  getChomboSelf, getChomboShimocha, getChomboToimen,
  getScoreKamicha, getScoreSelf, getScoreShimocha,
  getScoreToimen, getTimeRemaining
} from '../../services/store/selectors/overviewSelectors';
import {
  getSelf, getShimocha, getToimen, getKamicha,
  getSeatSelf, getSeatShimocha, getSeatToimen, getSeatKamicha
} from 'app/services/store/selectors/roundPreviewSchemeSelectors';

@Component({
  selector: 'screen-overview',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class OverviewScreenComponent extends I18nComponent implements OnInit {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) { super(i18n); }

  get loading(): boolean { return this.state.loading.overview ||  this.state.loading.games || !this.state.gameOverviewReady; }

  get self(): Player { return getSelf(this.state, 'overview'); }
  get shimocha(): Player { return getShimocha(this.state, 'overview'); }
  get toimen(): Player { return getToimen(this.state, 'overview'); }
  get kamicha(): Player { return getKamicha(this.state, 'overview'); }

  get seatSelf(): string { return getSeatSelf(this.state, 'overview'); }
  get seatShimocha(): string { return getSeatShimocha(this.state, 'overview'); }
  get seatToimen(): string { return getSeatToimen(this.state, 'overview'); }
  get seatKamicha(): string { return getSeatKamicha(this.state, 'overview'); }

  get scoreSelf(): string { return getScoreSelf(this.state, this.state.players); }
  get scoreShimocha(): string { return getScoreShimocha(this.state, this.state.players); }
  get scoreToimen(): string { return getScoreToimen(this.state, this.state.players); }
  get scoreKamicha(): string { return getScoreKamicha(this.state, this.state.players); }

  get chomboSelf(): string { return getChomboSelf(this.state, this.state.players); }
  get chomboShimocha(): string { return getChomboShimocha(this.state, this.state.players); }
  get chomboToimen(): string { return getChomboToimen(this.state, this.state.players); }
  get chomboKamicha(): string { return getChomboKamicha(this.state, this.state.players); }

  get timeRemaining() { return getTimeRemaining(this.state); }

  get redZone() { return this.state.gameConfig.useTimer && getCurrentTimerZone(this.state) === 'redZone'; }
  get yellowZone() { return this.state.gameConfig.useTimer && getCurrentTimerZone(this.state) === 'yellowZone'; }
  get showNewGame(): boolean { return !this.state.gameConfig.autoSeating && !this.state.isUniversalWatcher; }
  get showStatButton(): boolean { return !!this.state.gameConfig.eventStatHost && !this.state.isUniversalWatcher; }

  get greeting() { return this.i18n._t('Hello, %1!', [this.state.currentPlayerDisplayName]); }

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-overview' });
  }

  newGame() { this.dispatch({ type: START_NEW_GAME }); }
  lastResults() { this.dispatch({ type: SHOW_LAST_RESULTS }); }
  reloadOverview() { this.dispatch({ type: UPDATE_CURRENT_GAMES_INIT }); }
  viewLastRound() { this.dispatch({ type: SHOW_LAST_ROUND }); }
  playerClick(who: IAppState['overviewDiffBy']) { this.dispatch( { type: TOGGLE_OVERVIEW_DIFFBY, payload: who }); }
  otherTables() { this.dispatch({ type: SHOW_OTHER_TABLES_LIST }); }

  gotoStat() {
    window.open(`https://${this.state.gameConfig.eventStatHost}/last/`);
  }
}


