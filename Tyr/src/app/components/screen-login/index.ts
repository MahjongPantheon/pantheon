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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import {I18nComponent, I18nService} from '../auxiliary-i18n';
import {IDB} from '../../services/idb';
import {IAppState} from '../../services/store/interfaces';
import {Dispatch} from 'redux';
import {
  AppActionTypes,
  CONFIRM_REGISTRATION_INIT,
  RESET_REGISTRATION_ERROR,
  TRACK_SCREEN_ENTER
} from '../../services/store/actions/interfaces';
import {QrService} from '../../services/qr';

@Component({
  selector: 'screen-login',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class LoginScreenComponent extends I18nComponent implements OnInit {
  public _error = false;

  public _qrMode = false;
  public _loadingQrMessageShown = true;

  private _pinOrig = '';
  private _pinView = '';
  private _timer = null;

  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  @ViewChild('cnv', {static: false}) canvas: ElementRef;

  constructor(
    public i18n: I18nService,
    private storage: IDB,
    private qr: QrService,
    private ref: ChangeDetectorRef
  ) { super(i18n); }

  ngOnInit() {
    this.dispatch({ type: TRACK_SCREEN_ENTER, payload: 'screen-login' });
    this.qr.onReadyStateChange((loading) => {
      this._loadingQrMessageShown = loading;
      this.ref.markForCheck();
    });
    this.qr.onPinReceived((pin) => {
      this._pinOrig = pin;
      this._pinView = '*'.repeat(this._pinOrig.length);
      this._qrMode = false;
      this.submit();
    });
  }

  submit() { this.dispatch({ type: CONFIRM_REGISTRATION_INIT, payload: this._pinOrig }); }

  reset() {
    this._pinOrig = this._pinView = '';
    this.dispatch({ type: RESET_REGISTRATION_ERROR });
  }

  press(digit: string) {
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

  scanQr() {
    if (this._qrMode) {
      this.qr.forceStop();
      this._qrMode = false;
    } else {
      this._qrMode = true;
      setTimeout(() => this.qr.scanQr(this.canvas.nativeElement), 0);
    }
  }
}
