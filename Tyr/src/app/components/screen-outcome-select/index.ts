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

import {Component, Input} from '@angular/core';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {MetrikaService} from '../../services/metrika';
import {IAppState} from "../../services/store/interfaces";
import {
  AppActionTypes,
  GOTO_NEXT_SCREEN,
  INIT_BLANK_OUTCOME,
  UPDATE_CURRENT_GAMES_INIT
} from "../../services/store/actions/interfaces";
import {Outcome} from "../../interfaces/common";
import {Dispatch} from "redux";

@Component({
  selector: 'screen-outcome-select',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class OutcomeSelectScreen extends I18nComponent {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) { super(i18n); }

  ngOnInit() {
    this.dispatch({ type: UPDATE_CURRENT_GAMES_INIT }); // update state before entering new data to prevent "Wrong round" errors.
    // This still prevents errors when simultaneous submission happens, because two or more players update
    // their data first, and only then add new data. This will lead to error if more than one player enter
    // data simultaneously.
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-outcome-select' });
  }

  get abortsAllowed() {
    return this.state.gameConfig.withAbortives;
  }

  get multironAllowed() {
    return !this.state.gameConfig.withAtamahane;
  }

  get nagashiAllowed() {
    return this.state.gameConfig.withNagashiMangan;
  }

  get screenEnabled() {
    return !this.state.timer.waiting
  }

  select(outcome: Outcome) {
    this.dispatch({ type: INIT_BLANK_OUTCOME, payload: outcome });
    this.dispatch({ type: GOTO_NEXT_SCREEN });
  }
}

