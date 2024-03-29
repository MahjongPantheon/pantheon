/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
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

import * as React from 'react';
import { SettingsScreenView } from './SettingsScreenView';
import { IComponentProps } from '../../IComponentProps';
import {
  FORCE_LOGOUT,
  GOTO_EVENT_SELECT,
  GOTO_PREV_SCREEN,
  RESET_LOGIN_ERROR,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_SINGLE_DEVICE_MODE,
  SETTINGS_SAVE_THEME,
} from '../../../store/actions/interfaces';
import { I18nService, supportedLanguages } from '../../../services/i18n';
import { themes } from '../../../services/themes';
import { i18n } from '../../i18n';

export class SettingsScreen extends React.PureComponent<IComponentProps> {
  static contextType = i18n;
  private onBackClick() {
    const { dispatch } = this.props;
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onLogout() {
    const { dispatch } = this.props;
    dispatch({ type: FORCE_LOGOUT, payload: undefined });
    dispatch({ type: RESET_LOGIN_ERROR }); // this resets error screen
  }

  private onSingleDeviceModeChange(value: boolean) {
    const { dispatch } = this.props;
    dispatch({ type: SETTINGS_SAVE_SINGLE_DEVICE_MODE, payload: value });
  }

  private onLangChange(lang: string) {
    const { dispatch } = this.props;
    const loc = this.context as I18nService;
    dispatch({ type: SETTINGS_SAVE_LANG, payload: lang });
    loc.init(
      (localeName: string) => {
        // make sure value is valid - set it again in callback
        dispatch({ type: SETTINGS_SAVE_LANG, payload: localeName });
        if (localeName === 'jp' || localeName === 'ko') {
          const fontLink = window.document.getElementById('font-' + localeName);
          if (!fontLink) {
            const newLink = window.document.createElement('link');
            newLink.setAttribute('id', 'font-' + localeName);
            newLink.setAttribute('rel', 'stylesheet');
            newLink.setAttribute('href', '/public/font-' + localeName + '.css');
            window.document.head.appendChild(newLink);
          }
        }
      },
      (error: any) => console.error(error)
    );
  }

  private onThemeSelect(theme: string) {
    const { dispatch } = this.props;
    dispatch({ type: SETTINGS_SAVE_THEME, payload: theme });
  }

  private onEventSelect() {
    const { dispatch } = this.props;
    dispatch({ type: GOTO_EVENT_SELECT });
  }

  render() {
    const { state } = this.props;
    const loc = this.context as I18nService;

    const playerName = state.currentPlayerDisplayName ?? loc._t('Player name');

    return (
      <SettingsScreenView
        playerName={playerName}
        playerId={state.currentPlayerId}
        playerHasAvatar={state.currentPlayerHasAvatar}
        playerLastUpdate={state.currentPlayerLastUpdate}
        supportedLanguages={supportedLanguages}
        currentLanguage={state.settings.currentLang || 'en'}
        supportedThemes={themes}
        currentTheme={state.settings.currentTheme || 'day'}
        singleDeviceMode={state.settings.singleDeviceMode || false}
        onBackClick={this.onBackClick.bind(this)}
        onLogout={this.onLogout.bind(this)}
        onSingleDeviceModeChange={this.onSingleDeviceModeChange.bind(this)}
        onLangChange={this.onLangChange.bind(this)}
        onThemeSelect={this.onThemeSelect.bind(this)}
        onEventSelect={this.onEventSelect.bind(this)}
      />
    );
  }
}
