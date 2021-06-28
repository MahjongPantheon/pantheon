/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.dev>
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

import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { RiichiApiService } from './services/riichiApi';
import { MetrikaService } from './services/metrika';
import { I18nService } from './services/i18n';
import { IDB } from './services/idb';
import { ThemeService } from './services/themes/service';
import { Store } from './services/store';
import { HttpClient } from '@angular/common/http';
import {
  HISTORY_INIT,
  INIT_STATE, INIT_WITH_PINCODE,
  STARTUP_WITH_AUTH,
  UPDATE_STATE_SETTINGS
} from './services/store/actions/interfaces';
import { IAppState } from './services/store/interfaces';
import { registerFrontErrorHandler } from './helpers/logFrontError';

@Component({
  selector: 'riichi-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public store: Store;
  public state: IAppState;
  constructor(
    private ref: ChangeDetectorRef,
    private zone: NgZone,
    private api: RiichiApiService,
    private metrika: MetrikaService,
    private http: HttpClient,
    private i18n: I18nService,
    private storage: IDB,
    private themeService: ThemeService
  ) {
    registerFrontErrorHandler();
    this.store = new Store(this.http, this.i18n);
    this.state = this.store.redux.getState();
    this.metrika.track(MetrikaService.APP_INIT);

    const userTheme = this.storage.get('currentTheme');
    if (userTheme && this.themeService.themeExists(userTheme)) {
      this.themeService.setTheme(userTheme);
    }

    if (this.store.redux.getState().isIos) {
      document.addEventListener(
        'dblclick',
        (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        },
        {passive: false}
      );
    }

    this.store.subscribe((newState: IAppState) => {
      this.state = newState;
      this.ref.markForCheck(); // trigger full change detection
      (window as any).__debugInfo = { sh: newState.currentSessionHash, p: newState.currentPlayerId };
    });

    this.i18n.init((localeName: string) => {
      this.metrika.track(MetrikaService.I18N_INIT, { localeName });
      this.store.dispatch({ type: INIT_STATE });
      this.api.setCredentials(this.storage.get('authToken') || '');
      this.store.dispatch({ type: STARTUP_WITH_AUTH, payload: this.storage.get('authToken') || '' });
      this.storage.set('currentLanguage', localeName);
      let loc = window.location.pathname.replace(/^\//, '');
      if (loc.length > 0) {
        this.store.dispatch({ type: INIT_WITH_PINCODE, payload: loc });
      }
      this.store.dispatch({ type: HISTORY_INIT });
      this.store.dispatch({ type: UPDATE_STATE_SETTINGS });
    }, (error: any) => console.error(error));
  }

  get ny() {
    const mon = (new Date()).getMonth();
    const day = (new Date()).getDate();
    const isYearStart = mon === 0 && day < 10;
    const isYearEnd = mon === 11 && day > 20;
    return isYearStart || isYearEnd;
  }
}
