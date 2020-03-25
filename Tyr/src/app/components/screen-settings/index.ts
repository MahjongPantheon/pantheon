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

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import { AppState } from '../../primitives/appstate';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { supportedLanguages } from '../../services/i18n';
import { MetrikaService } from '../../services/metrika';
import { IDB } from '../../services/idb';
import { ThemeService } from '../../services/themes/service';
import { Theme } from '../../themes/interface';

@Component({
  selector: 'screen-settings',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./style.css']
})
export class SettingsScreen extends I18nComponent {
  @Input() state: AppState;

  constructor(
    public i18n: I18nService,
    private storage: IDB,
    private metrika: MetrikaService,
    private themeService: ThemeService
  ) { super(i18n); }

  get supportedLanguages(): string[] {
    return supportedLanguages;
  }

  get supportedThemes(): Theme[] {
    return this.themeService.themes;
  }

  ngOnInit() {
    this.metrika.track(MetrikaService.SCREEN_ENTER, { screen: 'screen-settings' });
  }

  selectLanguage(lang: string) {
    this.storage.set('currentLanguage', lang);
    this.i18n.init((localeName: string) => {
      // make sure value is valid - set it again in callback
      this.storage.set('currentLanguage', localeName);
      this.metrika.track(MetrikaService.LANG_CHANGED, { localeName });
    }, (error: any) => console.error(error));
  }

  selectTheme(theme: string) {
    if (this.themeService.themeExists(theme)) {
      this.storage.set('currentTheme', theme);
      this.themeService.setTheme(theme);
    }
  }

  logout() {
    if (window.confirm(this.i18n._t("Are you sure you want to logout? You will have to get a new pin code to login again"))) {
      this.metrika.track(MetrikaService.LOGOUT, { screen: 'screen-settings' });
      this.state.logout();
    }
  }
}
