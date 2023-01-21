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

import jsQR from 'jsqr';
const crc32 = require('crc/crc32').default;

export class QrService {
  private _video: HTMLVideoElement | null = null;
  private _onReadyStateChange = (loading: boolean) => {};
  private _onPinReceived = (pin: string) => {};

  onReadyStateChange(cb: (loading: boolean) => void) {
    this._onReadyStateChange = cb;
  }

  onPinReceived(cb: (pin: string) => void) {
    this._onPinReceived = cb;
  }

  forceStop() {
    this._stopVideo();
    if (!this._video) {
      return;
    }
    this._video.pause();
    this._video = null;
  }

  scanQr(canvasElement: HTMLCanvasElement) {
    this._video = document.createElement('video');
    const canvas = canvasElement.getContext('2d');

    // Use facingMode: environment to attempt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
      if (!this._video) {
        return;
      }
      this._video.srcObject = stream;
      this._video.setAttribute('playsinline', 'true'); // required to tell iOS safari we don't want fullscreen
      this._video.play();
      requestAnimationFrame(tick);
    });

    const tick = () => {
      this._onReadyStateChange(true);
      if (this._video && canvas && this._video.readyState === this._video.HAVE_ENOUGH_DATA) {
        this._onReadyStateChange(false);
        canvasElement.hidden = false;
        canvasElement.height = this._video.videoHeight;
        canvasElement.width = this._video.videoWidth;
        canvas.drawImage(this._video, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          let pincode = '';
          const data = code.data.match(/^https?:\/\/(.*?)\/(\d+)_([\da-f]+)$/i);
          if (data) {
            if (data[1].split(':')[0] === 'localhost') {
              // local debug
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
            this._stopVideo();
            this._video.pause();
            this._onPinReceived(pincode);
            return;
          }
        }
      }

      requestAnimationFrame(tick);
    };
  }

  _stopVideo() {
    if (!this._video) {
      return;
    }

    (this._video.srcObject as MediaStream).getTracks().forEach(function (track) {
      track.stop();
    });
  }
}
