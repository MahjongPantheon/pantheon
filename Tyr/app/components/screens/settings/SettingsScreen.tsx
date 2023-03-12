import * as React from 'react';
import { SettingsScreenView } from '#/components/screens/settings/SettingsScreenView';
import { IComponentProps } from '#/components/IComponentProps';
import {
  FORCE_LOGOUT,
  GOTO_EVENT_SELECT,
  GOTO_PREV_SCREEN,
  RESET_LOGIN_ERROR,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_SINGLE_DEVICE_MODE,
  SETTINGS_SAVE_THEME,
} from '#/store/actions/interfaces';
import { I18nService, supportedLanguages } from '#/services/i18n';
import { themes } from '#/services/themes';
import { i18n } from '#/components/i18n';

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
