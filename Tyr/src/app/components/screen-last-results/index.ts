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
import { RiichiApiService } from '../../services/riichiApi';
import { MetrikaService } from '../../services/metrika';
import { Player } from '../../interfaces/common';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import {IAppState} from "../../services/store/interfaces";
import {Dispatch} from "redux";
import {AppActionTypes, GOTO_NEXT_SCREEN} from "../../services/store/actions/interfaces";

@Component({
  selector: 'screen-last-results',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class LastResultsScreen extends I18nComponent {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) { super(i18n); }

  public _loading: boolean = true;
  public _noResults: boolean = false;

  self: Player;
  shimocha: Player;
  toimen: Player;
  kamicha: Player;

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-last-results' });
    this.dispatch({ type: GET_LAST_RESULTS_INIT });
  }
  //
  // formatState() {
  //   // TODO ##1: this is from old then() handler, we should use data from state in new code
  //   if (!results) {
  //     this._loading = false;
  //     this._noResults = true;
  //     return;
  //   }
  //
  //   const current = this.state.getCurrentPlayerId();
  //   for (let i = 0; i < 4; i++) {
  //     if (results[0].id === current) {
  //       break;
  //     }
  //
  //     results = results.slice(1).concat(results[0]);
  //   }
  //
  //   this.self = results[0];
  //   this.shimocha = results[1];
  //   this.toimen = results[2];
  //   this.kamicha = results[3];
  // }

  nextScreen() {
    this.dispatch({ type: GOTO_NEXT_SCREEN });
  }
}
