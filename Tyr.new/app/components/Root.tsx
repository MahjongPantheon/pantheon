import * as React from 'react';
import {EnterPinScreen} from '#/components/screens/login/EnterPinScreen';
import '../styles/base.css'
import '../styles/themes.css'
import '../styles/variables.css'
import {IAppState} from '#/store/interfaces';
import {Dispatch} from 'redux';
import {
  CONFIRM_REGISTRATION_INIT,
  FORCE_LOGOUT,
  OPEN_SETTINGS,
} from '../../../Tyr/src/app/services/store/actions/interfaces';
import {HomeScreenView} from '#/components/screens/home/HomeScreenView';
import {SettingsScreen} from '#/components/screens/settings/SettingsScreen';

interface IProps {
  state: IAppState;
  dispatch: Dispatch;
}

export class Root extends React.Component<IProps> {
  onPinSubmit(pin: string) {
    this.props.dispatch({ type: CONFIRM_REGISTRATION_INIT, payload: pin });
  }

  render() {
    const {state, dispatch} = this.props

    let children = <>Hello world azaza</>

    switch (state.currentScreen) {
      case 'login':
        children = <EnterPinScreen onSubmit={this.onPinSubmit.bind(this)} />

        // children = <LoginErrorScreen />
        break;
      case 'overview':
        children = <HomeScreenView canStartGame={true} hasStartedGame={false} hasPrevGame={true} canSeeOtherTables={true} hasStat={true} onSettingClick={() => dispatch({ type: OPEN_SETTINGS })} />
        break;
      case 'settings':
        children = <SettingsScreen onLogOut={() => dispatch({ type: FORCE_LOGOUT })} />
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

    return <div className="App theme-day">{children}</div>;
  }
}
