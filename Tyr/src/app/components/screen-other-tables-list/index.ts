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
import {MetrikaService} from '../../services/metrika';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {IAppState} from "../../services/store/interfaces";
import {Dispatch} from "redux";
import {
  AppActionTypes,
  GET_OTHER_TABLES_LIST_INIT,
  SHOW_OTHER_TABLE,
  UPDATE_CURRENT_GAMES_INIT
} from "../../services/store/actions/interfaces";

@Component({
  selector: 'screen-other-tables-list',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class OtherTablesListScreen extends I18nComponent {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) { super(i18n); }

  ngOnInit() {
    this.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-other-tables-list' });
    this.dispatch({ type: GET_OTHER_TABLES_LIST_INIT });
  }

  viewTable(hash: string) {
    this.dispatch({ type: SHOW_OTHER_TABLE, payload: { hash } });
  }
}

