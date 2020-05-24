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

import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MetrikaService} from '../../services/metrika';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {IAppState} from '../../services/store/interfaces';
import {Dispatch} from 'redux';
import {
  AppActionTypes,
  GET_OTHER_TABLES_LIST_INIT,
  GET_OTHER_TABLES_LIST_RELOAD,
  SHOW_OTHER_TABLE,
  UPDATE_CURRENT_GAMES_INIT
} from '../../services/store/actions/interfaces';

@Component({
  selector: 'screen-other-tables-list',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class OtherTablesListScreenComponent extends I18nComponent implements OnInit, OnDestroy {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  private _timer;
  constructor(
    public i18n: I18nService,
    private metrika: MetrikaService
  ) { super(i18n); }

  ngOnInit() {
    this.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-other-tables-list' });
    this.dispatch({ type: GET_OTHER_TABLES_LIST_INIT });
    this._timer = setInterval(() => this.dispatch({ type: GET_OTHER_TABLES_LIST_RELOAD }), 5000 + (300 * Math.random()));
  }

  ngOnDestroy(): void {
    clearInterval(this._timer);
  }

  viewTable(hash: string) {
    this.dispatch({ type: SHOW_OTHER_TABLE, payload: { hash } });
  }
}

