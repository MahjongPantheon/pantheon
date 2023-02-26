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
import Plausible from 'plausible-tracker';

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
  private readonly _plausible: ReturnType<typeof Plausible> | null = null;

  constructor() {
    this._statDomain = environment.statDomain;
    if (!this._statDomain) {
      return;
    }
    this._plausible = Plausible({
      domain: window.location.hostname,
      apiHost: this._statDomain,
    });
  }

  setUserId(userId: number) {
    if (!this._plausible) {
      return;
    }
    this._userId = userId;
  }

  setEventId(eventId: number) {
    if (!this._plausible) {
      return;
    }
    this._eventId = eventId;
  }

  track(action: string, params: { [key: string]: any } = {}, eventId?: number) {
    if (!this._plausible) {
      return;
    }

    this._plausible.trackEvent(action, {
      props: {
        eventId:
          (eventId ? eventId.toString() : (this._eventId ?? '').toString()) ||
          Analytics.NOT_INITIALIZED,
        userId: (this._userId ?? '').toString() || Analytics.NOT_INITIALIZED,
        ...params,
      },
    });
  }
}
