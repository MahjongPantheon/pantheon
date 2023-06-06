/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import debounce from 'lodash.debounce';

export class Analytics {
  public static readonly NOT_INITIALIZED = 'not_initialized';
  public static readonly LOGOUT = 'logout';
  public static readonly LANG_CHANGED = 'lang_changed';
  public static readonly THEME_CHANGED = 'theme_changed';
  public static readonly SINGLE_DEVICE_MODE_CHANGED = 'single_device_mode_changed';
  public static readonly REMOTE_ERROR = 'remote_error';
  public static readonly SCREEN_ENTER = 'screen_enter';
  public static readonly CONFIG_RECEIVED = 'config_received';
  public static readonly LOAD_STARTED = 'load_started';
  public static readonly LOAD_SUCCESS = 'load_success';
  public static readonly LOAD_ERROR = 'load_error';
  private _eventId: number | null = null;
  private _userId: number | null = null;
  private readonly _statDomain: string | null = null;
  private readonly _siteId: string | null = null;
  private readonly _track: typeof Analytics.prototype.track | null = null;
  private readonly _trackView: typeof Analytics.prototype.trackView | null = null;

  protected _trackViewEvent(url: string) {
    if (!this._statDomain || !url) {
      return;
    }
    const payload = {
      website: this._siteId,
      hostname: window.location.hostname,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      cache: null,
      title: window.document.title,
      url: url,
      referrer: '',
    };
    fetch('https://' + this._statDomain + '/api/send', {
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
      body: '{"type":"event","payload":' + JSON.stringify(payload) + '}',
      method: 'POST',
      mode: 'cors',
    });
  }

  protected _trackEvent(eventName: string, eventData: any, url: string) {
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
      event_name: eventName,
      event_data: eventData,
    };
    fetch('https://' + this._statDomain + '/api/send', {
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
    this._statDomain = import.meta.env.VITE_STAT_HOST;
    this._siteId = import.meta.env.VITE_STAT_SITE_ID;

    this._track = debounce(
      (action: string, params: { [key: string]: any } = {}, eventId?: number) => {
        this._trackEvent(
          action,
          {
            eventId:
              (eventId ? eventId.toString() : (this._eventId ?? '').toString()) ||
              Analytics.NOT_INITIALIZED,
            userId: (this._userId ?? '').toString() || Analytics.NOT_INITIALIZED,
            ...params,
          },
          window.location.hostname
        );
      }
    );

    this._trackView = debounce((url: string) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Location changed to: ', url);
      }
      this._trackViewEvent(url);
    });
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

  trackView(url: string) {
    if (!this._trackView) {
      return;
    }
    this._trackView?.(url);
  }
}
