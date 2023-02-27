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

import { environment } from '#config';
import debounce from 'lodash.debounce';

export class Analytics {
  public static readonly NOT_INITIALIZED = 'not_initialized';
  public static readonly APP_INIT = 'app_init';
  public static readonly LOGOUT = 'logout';
  public static readonly I18N_INIT = 'i18n_init';
  public static readonly LANG_CHANGED = 'lang_changed';
  public static readonly THEME_CHANGED = 'theme_changed';
  public static readonly SINGLE_DEVICE_MODE_CHANGED = 'single_device_mode_changed';
  public static readonly REMOTE_ERROR = 'remote_error';
  public static readonly LOCAL_ERROR = 'local_error';
  public static readonly SCREEN_ENTER = 'screen_enter';
  public static readonly CONFIG_RECEIVED = 'config_received';
  public static readonly UNIVERSAL_WATCHER_INITIALIZED = 'universal_watcher_initialized';
  public static readonly LOAD_STARTED = 'load_started';
  public static readonly LOAD_SUCCESS = 'load_success';
  public static readonly LOAD_ERROR = 'load_error';
  private _eventId: number | null = null;
  private _userId: number | null = null;
  private readonly _statDomain: string | null = null;
  private readonly _siteId: string | null = null;
  private readonly _track: typeof Analytics.prototype.track | null = null;

  public trackView(url: string) {
    if (!this._statDomain) {
      return;
    }
    const payload = {
      website: this._siteId,
      hostname: window.location.hostname,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      cache: null,
      url: url,
      referrer: '',
    };
    fetch('https://' + this._statDomain + '/api/collect', {
      credentials: 'omit',
      headers: {
        'User-Agent': navigator.userAgent,
        Accept: '*/*',
        'Accept-Language': window.navigator.language,
        'Content-Type': 'text/plain',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'max-age=0',
      },
      referrer: window.location.toString().substring(0, window.location.toString().indexOf('/', 9)),
      body: '{"type":"pageview","payload":' + JSON.stringify(payload) + '}',
      method: 'POST',
      mode: 'cors',
    });
  }

  protected _trackEvent(eventType: string, eventValue: any, url: string) {
    if (!this._statDomain) {
      return;
    }
    const payload = {
      website: this._siteId,
      hostname: window.location.hostname,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      cache: null,
      url: url,
      event_type: eventType,
      event_value: eventValue,
    };
    fetch('https://' + this._statDomain + '/api/collect', {
      credentials: 'omit',
      headers: {
        'User-Agent': navigator.userAgent,
        Accept: '*/*',
        'Accept-Language': window.navigator.language,
        'Content-Type': 'text/plain',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      referrer: window.location.toString().substring(0, window.location.toString().indexOf('/', 9)),
      body: '{"type":"event","payload":' + JSON.stringify(payload) + '}',
      method: 'POST',
      mode: 'cors',
    });
  }

  constructor() {
    this._statDomain = environment.statDomain;
    this._siteId = environment.siteId;
    if (!this._statDomain) {
      return;
    }

    this._track = debounce(
      (action: string, params: { [key: string]: any } = {}, eventId?: number) => {
        this._trackEvent(
          action,
          {
            props: {
              eventId:
                (eventId ? eventId.toString() : (this._eventId ?? '').toString()) ||
                Analytics.NOT_INITIALIZED,
              userId: (this._userId ?? '').toString() || Analytics.NOT_INITIALIZED,
              ...params,
            },
          },
          window.location.hostname
        );
      }
    );
  }

  setUserId(userId: number) {
    if (!this._statDomain) {
      return;
    }
    this._userId = userId;
  }

  setEventId(eventId: number) {
    if (!this._statDomain) {
      return;
    }
    this._eventId = eventId;
  }

  track(action: string, params: { [key: string]: any } = {}, eventId?: number) {
    if (!this._track) {
      return;
    }
    this._track?.(action, params, eventId);
  }
}
