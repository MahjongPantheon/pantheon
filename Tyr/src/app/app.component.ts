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

import { Component, NgZone, ApplicationRef } from '@angular/core';
import { AppState } from './primitives/appstate';
import { RiichiApiService } from './services/riichiApi';
import { MetrikaService } from './services/metrika';
import { I18nService } from './services/i18n';
import { environment } from '../environments/environment';
import { IDB } from './services/idb';
import { ThemeService } from './services/themes/service';

@Component({
  selector: 'riichi-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public state: AppState;
  constructor(
    private appRef: ApplicationRef,
    private zone: NgZone,
    private api: RiichiApiService,
    private metrika: MetrikaService,
    private i18n: I18nService,
    private storage: IDB,
    private themeService: ThemeService
  ) {

    // Yandex metrika init code; Don't touch :)
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () {
        (m[i].a = m[i].a || []).push(arguments)
      };
      m[i].l = 1 * +(new Date());
      k = e.createElement(t),
        a = e.getElementsByTagName(t)[0],
        k.async = 1,
        k.src = r,
        a.parentNode.insertBefore(k, a)
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(environment.metrikaId, "init", {
      id: environment.metrikaId,
      defer: true,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true
    });
    // End of Yandex metrika

    this.state = new AppState(
      this.zone,
      this.api,
      this.i18n,
      this.storage,
      this.metrika
    );

    this.metrika.track(MetrikaService.APP_INIT);

    const userTheme = this.storage.get('currentTheme');
    if (userTheme && this.themeService.themeExists(userTheme)) {
      this.themeService.setTheme(userTheme);
    }

    if (this.state.isIos) {
      document.addEventListener(
        'dblclick',
        (e: any) => {
          e.preventDefault()
          e.stopPropagation();
          return false;
        },
        {passive: false}
      );
    }

    window.__state = this.state; // for great debug
    this.i18n.init((localeName: string) => {
      this.metrika.track(MetrikaService.I18N_INIT, { localeName });
      this.state.init();
      this.storage.set('currentLanguage', localeName);
    }, (error: any) => console.error(error));
  }
}
