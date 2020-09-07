import * as React from 'react';
import {SettingsScreenView} from '#/components/screens/settings/SettingsScreenView';
import {IComponentProps} from '#/components/IComponentProps';
import {FORCE_LOGOUT, GOTO_PREV_SCREEN, SETTINGS_SAVE_LANG, SETTINGS_SAVE_THEME} from '#/store/actions/interfaces';
import {supportedLanguages} from '#/services/i18n';
import {themes} from '#/services/themes';

export class SettingsScreen extends React.PureComponent<IComponentProps>{
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


  render() {
    const {state} = this.props;

    const playerName = state.currentPlayerDisplayName || 'name';

    return (
      <SettingsScreenView
        playerName={playerName}
        supportedLanguages={supportedLanguages}
        currentLanguage={state.settings.currentLang}
        supportedThemes={themes}
        currentTheme={state.settings.currentTheme}
        singleDeviceMode={false} //todo
        onBackClick={this.onBackClick.bind(this)}
        onLogout={this.onLogout.bind(this)}
        onSingleDeviceModeChange={this.onSingleDeviceModeChange.bind(this)}
        onLangChange={this.onLangChange.bind(this)}
        onThemeSelect={this.onThemeSelect.bind(this)}
      />
    )
  }
}
