import * as React from 'react';
import {SettingsScreenView} from '#/components/screens/settings/SettingsScreenView';
import {IComponentProps} from '#/components/IComponentProps';
import {
  FORCE_LOGOUT,
  GOTO_EVENT_SELECT,
  GOTO_PREV_SCREEN,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME
} from '#/store/actions/interfaces';
import {I18nService, supportedLanguages} from '#/services/i18n';
import {themes} from '#/services/themes';
import {i18n} from "#/components/i18n";

export class SettingsScreen extends React.PureComponent<IComponentProps>{
  static contextType = i18n;
  private onBackClick() {
    const {dispatch} = this.props;
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onLogout() {
    const {dispatch} = this.props;
    dispatch({ type: FORCE_LOGOUT });
  }

  private onSingleDeviceModeChange() {
    const {dispatch} = this.props;
    //todo
  }

  private onLangChange(lang: string) {
    const {dispatch} = this.props;
    dispatch({ type: SETTINGS_SAVE_LANG, payload: lang });
  }

  private onThemeSelect(theme: string) {
    const {dispatch} = this.props;
    dispatch({ type: SETTINGS_SAVE_THEME, payload: theme })
  }

  private onEventSelect() {
    const {dispatch} = this.props;
    dispatch({ type: GOTO_EVENT_SELECT });
  }

  render() {
    const {state} = this.props;
    const loc = this.context as I18nService;

    const playerName = state.currentPlayerDisplayName || loc._t('Player name');

    return (
      <SettingsScreenView
        playerName={playerName}
        supportedLanguages={supportedLanguages}
        currentLanguage={state.settings.currentLang || 'en'}
        supportedThemes={themes}
        currentTheme={state.settings.currentTheme || 'day'}
        singleDeviceMode={false} //todo
        onBackClick={this.onBackClick.bind(this)}
        onLogout={this.onLogout.bind(this)}
        onSingleDeviceModeChange={this.onSingleDeviceModeChange.bind(this)}
        onLangChange={this.onLangChange.bind(this)}
        onThemeSelect={this.onThemeSelect.bind(this)}
        onEventSelect={this.onEventSelect.bind(this)}
      />
    )
  }
}
