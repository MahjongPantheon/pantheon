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

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { I18nComponent, I18nService } from '../auxiliary-i18n';
import { supportedLanguages } from '../../services/i18n';
import { ThemeService } from '../../services/themes/service';
import { Theme } from '../../themes/interface';
import { IAppState } from '../../services/store/interfaces';
import { Dispatch } from 'redux';
import {
  AppActionTypes,
  FORCE_LOGOUT,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME, TRACK_SCREEN_ENTER
} from '../../services/store/actions/interfaces';

@Component({
  selector: 'screen-settings',
  templateUrl: './template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./style.css']
})
export class SettingsScreenComponent extends I18nComponent implements OnInit {
  @Input() state: IAppState;
  @Input() dispatch: Dispatch<AppActionTypes>;

  constructor(
    public i18n: I18nService,
    private themeService: ThemeService
  ) { super(i18n); }

  get supportedLanguages(): string[] {
    return supportedLanguages;
  }

  get supportedThemes(): Theme[] {
    return this.themeService.themes;
  }

  ngOnInit() { this.dispatch({ type: TRACK_SCREEN_ENTER, payload: 'screen-settings' }); }

  selectLanguage(lang: string) {
    this.dispatch({ type: SETTINGS_SAVE_LANG, payload: lang });
    this.i18n.init((localeName: string) => { // TODO: move to middleware or something
      // make sure value is valid - set it again in callback
      this.dispatch({ type: SETTINGS_SAVE_LANG, payload: localeName });
    }, (error: any) => console.error(error));
  }

  selectTheme(theme: string) {
    if (this.themeService.themeExists(theme)) { // TODO: move to middleware or something
      this.dispatch({ type: SETTINGS_SAVE_THEME, payload: theme });
      this.themeService.setTheme(theme);
    }
  }

  logout() {
    if (window.confirm(this.i18n._t('Are you sure you want to logout? You will have to get a new pin code to login again'))) {
      this.dispatch({ type: FORCE_LOGOUT });
    }
  }
}
