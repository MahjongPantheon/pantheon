import * as React from 'react';
import {EnterPinScreen} from '#/components/screens/login/EnterPinScreen';
import '../styles/base.css'
import '../styles/themes.css'
import '../styles/variables.css'
import {
  CONFIRM_REGISTRATION_INIT,
} from '#/store/actions/interfaces';
import {IComponentProps} from '#/components/IComponentProps';
import {SettingsScreen} from '#/components/screens/settings/SettingsScreen';
import {HomeScreen} from '#/components/screens/home/HomeScreen';

export class Root extends React.Component<IComponentProps> {
  onPinSubmit(pin: string) {
    this.props.dispatch({ type: CONFIRM_REGISTRATION_INIT, payload: pin });
  }

  render() {
    const {state, dispatch} = this.props;

    let children = <>Hello world azaza</>;

    switch (state.currentScreen) {
      case 'login':
        children = <EnterPinScreen onSubmit={this.onPinSubmit.bind(this)} />;

        // children = <LoginErrorScreen />
        break;
      case 'overview':
        children = <HomeScreen state={state} dispatch={dispatch} />;
        break;
      case 'settings':
        children = <SettingsScreen state={state} dispatch={dispatch} />;
        break;
      case 'newGame':
        break;
      case 'outcomeSelect':
      case 'playersSelect':
      case 'yakuSelect':
      case 'paoSelect':
      case 'nagashiSelect':
      case 'lastResults':
      case 'lastRound':
      case 'confirmation':
        break;
    }

    return <div className={`App theme-${state.settings.currentTheme}`}>{children}</div>;
  }
}
