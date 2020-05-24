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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { IAppState } from '../../services/store/interfaces';
import { Dispatch } from 'redux';
import {
  ADD_ROUND_INIT,
  AppActionTypes,
  GET_CHANGES_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_INIT
} from '../../services/store/actions/interfaces';
import { isLoading } from '../../services/store/selectors/screenConfirmationSelectors';

@Component({
  selector: 'screen-confirmation',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class ConfirmationScreenComponent extends I18nComponent implements OnInit {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  public _initialized = false;
  public confirmed = false;

  constructor(
    public i18n: I18nService,
    private ref: ChangeDetectorRef
  ) {
    super(i18n);
  }

  get _loading() { return !this._initialized || isLoading(this.state); }
  get _error() {
    if (!this.state.changesOverviewError) {
      return null;
    }
    return (this.state.changesOverviewError.details.code === 403
        ? this.i18n._t('Authentication failed')
        : this.i18n._t('Failed to add round. Was this hand already added by someone else?')
    );
  }

  ngOnInit() {
    this.dispatch({ type: GET_CHANGES_OVERVIEW_INIT, payload: this.state });
    setTimeout(() => {
      this._initialized = true;
      this.ref.markForCheck();
    }, 0);
  }

  confirm() { this.dispatch({ type: ADD_ROUND_INIT, payload: this.state }); }
  okay() { this.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: this.state.currentSessionHash }); }
}
