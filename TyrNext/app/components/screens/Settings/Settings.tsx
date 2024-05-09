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
import { supportedLanguages } from '../../../services/i18n';
import { themes } from '../../../services/themes';
import { i18n } from '../../i18n';
import { fontLoader } from '../../../helpers/fontLoader';
import { useContext } from 'react';
import { Settings as SettingsPage } from '../../pages/Settings/Settings';
import { env } from '../../../helpers/env';

export const Settings = (props: IComponentProps) => {
  const loc = useContext(i18n);

  const onBackClick = () => {
    props.dispatch({ type: GOTO_PREV_SCREEN });
  };

  const onLogout = () => {
    props.dispatch({ type: FORCE_LOGOUT, payload: undefined });
    props.dispatch({ type: RESET_LOGIN_ERROR }); // this resets error screen
  };

  const onSingleDeviceModeChange = (value: boolean) => {
    props.dispatch({ type: SETTINGS_SAVE_SINGLE_DEVICE_MODE, payload: value });
  };

  const onLangChange = (lang: string) => {
    props.dispatch({ type: SETTINGS_SAVE_LANG, payload: lang });
    loc.init(
      (localeName: string) => {
        // make sure value is valid - set it again in callback
        props.dispatch({ type: SETTINGS_SAVE_LANG, payload: localeName });
        fontLoader(localeName);
      },
      (error: any) => console.error(error)
    );
  };

  const onThemeSelect = (theme: string) => {
    props.dispatch({ type: SETTINGS_SAVE_THEME, payload: theme });
  };

  const onEventSelect = () => {
    props.dispatch({ type: GOTO_EVENT_SELECT });
  };

  const onGotoPersonalArea = () => {
    window.open(`${env.urls.forseti}/profile/manage`);
  };

  const { state } = props;

  const playerName = state.currentPlayerDisplayName ?? loc._t('Player name');

  return (
    <SettingsPage
      player={{
        playerName,
        id: state.currentPlayerId,
        hasAvatar: state.currentPlayerHasAvatar,
        lastUpdate: state.currentPlayerLastUpdate,
      }}
      supportedLanguages={supportedLanguages}
      currentLanguage={state.settings.currentLang || 'en'}
      supportedThemes={themes}
      currentTheme={state.settings.currentTheme || 'day'}
      singleDeviceMode={state.settings.singleDeviceMode || false}
      onBackClick={onBackClick}
      onLogout={onLogout}
      onSingleDeviceModeChange={onSingleDeviceModeChange}
      onLangChange={onLangChange}
      onThemeSelect={onThemeSelect}
      onEventSelect={onEventSelect}
      onClickGotoPersonalArea={onGotoPersonalArea}
    />
  );
};
