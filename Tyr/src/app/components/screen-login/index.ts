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

import {ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { AppState } from '../../primitives/appstate';
import { RiichiApiService } from '../../services/riichiApi';
import { MetrikaService } from '../../services/metrika';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { IDB } from '../../services/idb';
import jsQR from 'jsqr';
import {IAppState} from "../../services/store/interfaces";
import {Dispatch} from "redux";
import {AppActionTypes} from "../../services/store/actions/interfaces";
const crc32 = require('crc/crc32').default;

@Component({
  selector: 'screen-login',
  templateUrl: 'template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['style.css']
})
export class LoginScreen extends I18nComponent implements OnInit {
  public _error = false;

  public _qrMode = false;
  public _loadingQrMessageShown = true;
  public _qrdata = '';

  private _pinOrig = '';
  private _pinView = '';
  private _timer = null;
  private _video: HTMLVideoElement | null = null;

  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;
  @Input() loading: boolean;
  @ViewChild('cnv', {static: false}) canvas: ElementRef;

  constructor(
    public i18n: I18nService,
    private storage: IDB,
    private metrika: MetrikaService
  ) { super(i18n); }


  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-login' });
  }

  submit() {
    this.metrika.track(MetrikaService.LOAD_STARTED, { type: 'screen-login', request: 'confirmRegistration' });
    this.state.loginWithPin(this._pinOrig)
      .then(() => {
        this._error = false;
        this.metrika.track(MetrikaService.LOAD_SUCCESS, {
          type: 'screen-login',
          request: 'confirmRegistration'
        });
        this.state.reinit();
      }).catch((e) => {
        this._error = true;
        this.metrika.track(MetrikaService.LOAD_ERROR, {
          type: 'screen-login',
          request: 'confirmRegistration',
          message: e.toString()
        });
      });
  }

  reset() {
    this._error = false;
    this._pinOrig = this._pinView = '';
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

  scanQr() {
    if (this._qrMode) {
      this._stopVideo();
      this._video.pause();
      this._video = null;
      this._qrMode = false;
    } else {
      this._qrMode = true;
      setTimeout(this._scanQr.bind(this), 0);
    }
  }

  _stopVideo() {
    if (!this._video) {
      return;
    }

    (this._video.srcObject as MediaStream).getTracks().forEach(function(track) {
      track.stop();
    });
  }

  _scanQr() {
    this._video = document.createElement('video');
    let canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
    let canvas = canvasElement.getContext('2d');

    // Use facingMode: environment to attempt to get the front camera on phones
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        this._video.srcObject = stream;
        this._video.setAttribute('playsinline', 'true'); // required to tell iOS safari we don't want fullscreen
        this._video.play();
        requestAnimationFrame(tick);
      });

    const tick = () => {
      this._loadingQrMessageShown = true;
      if (this._video.readyState === this._video.HAVE_ENOUGH_DATA) {
        this._loadingQrMessageShown = false;
        canvasElement.hidden = false;
        canvasElement.height = this._video.videoHeight;
        canvasElement.width = this._video.videoWidth;
        canvas.drawImage(this._video, 0, 0, canvasElement.width, canvasElement.height);
        let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        let code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          let pincode = '';
          let data = code.data.match(/^https?:\/\/(.*?)\/(\d+)_([\da-f]+)$/i);
          if (data) {
            if (data[1].split(':')[0] === 'localhost') { // local debug
              pincode = data[2];
            } else {
              if (
                data[1].split(':')[0] === location.host &&
                  crc32(data[2]).toString(16).toLowerCase() === data[3].toLowerCase()
              ) {
                pincode = data[2];
              }
            }
          }

          if (pincode.length > 0) {
            this._pinOrig = pincode;
            this._pinView = '*'.repeat(this._pinOrig.length);
            this._qrMode = false;
            this._stopVideo();
            this._video.pause();
            this.submit();
            return;
          }
        } else {
          this._qrdata = '';
        }
      }
      requestAnimationFrame(tick);
    }
  }

}
