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

import { ClientToSwEvents, SwToClientEvents } from "#/services/serviceWorkerConfig";

type Listeners = {
  [SwToClientEvents.REGISTER_RESULTS]?: any;
  [SwToClientEvents.ROUND_DATA]?: any;
  [SwToClientEvents.NOTIFICATION]?: any;
};

export class ServiceWorkerClient {
  private _listeners: Listeners = {};
  private _regPromise: Promise<any> | null = null;

  constructor() {
    if ('serviceWorker' in navigator) {
      this._regPromise = navigator.serviceWorker.register('/serviceWorker.js');
      navigator.serviceWorker.onmessage = (message) => {
        if (this._listeners[message.data.type as keyof Listeners]) {
          this._listeners[message.data.type as keyof Listeners](message.data.data);
        }
      };
    }
  }

  public updateClientRegistration(sessionHashcode: string, eventId: number) {
    this._regPromise?.then(() => navigator.serviceWorker?.controller?.postMessage({
      type: ClientToSwEvents.REGISTER,
      sessionHashcode,
      eventId
    }));
  }

  public updateLocale(locale: string) {
    this._regPromise?.then(() => navigator.serviceWorker?.controller?.postMessage({
      type: ClientToSwEvents.SET_LOCALE,
      locale
    }));
  }

  public onEvent(eventType: SwToClientEvents, cb: (data: any) => void) {
    this._listeners[eventType] = cb;
  }
}
