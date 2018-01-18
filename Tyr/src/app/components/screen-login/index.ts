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
import { Player } from '../../interfaces/common';
import { I18nComponent, I18nService } from '../auxiliary-i18n';

@Component({
  selector: 'screen-login',
  templateUrl: 'template.html',
  styleUrls: ['style.css']
})
export class LoginScreen extends I18nComponent {
  @Input() state: AppState;
  @Input() api: RiichiApiService;
  constructor(protected i18n: I18nService) { super(i18n); }

  public _loading: boolean = false;
  public _error: boolean = false;

  private _pinOrig: string = '';
  private _pinView: string = '';
  private _timer = null;

  submit() {
    this._loading = true;
    this.api.confirmRegistration(this._pinOrig)
      .then((authToken: string) => {
        this._loading = false;
        window.localStorage.setItem('authToken', authToken);
        this.state.reinit();
      })
      .catch(() => {
        this._loading = false;
        this._error = true;
      });
  }

  press(digit: string) {
    this._error = false;
    if (this._pinOrig.length > 10) {
      return;
    }

    this._pinOrig += digit;
    this._pinView = '*'.repeat(this._pinOrig.length - 1) + digit;
    this._hideSomePinView();
  }

  backspace() {
    this._pinOrig = this._pinOrig.slice(0, this._pinOrig.length - 1);
    this._pinView = '*'.repeat(this._pinOrig.length);
  }

  _hideSomePinView() {
    if (this._timer) {
      clearTimeout(this._timer);
    }

    this._timer = setTimeout(() => {
      this._pinView = '*'.repeat(this._pinOrig.length);
    }, 700);
  }
}
