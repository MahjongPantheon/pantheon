import * as React from 'react';
import '../styles/base.css'
import '../styles/themes.css'
import '../styles/variables.css'
import {IAppState} from '#/store/interfaces';
import { AppActionTypes } from '#/store/actions/interfaces';
import { Dispatch } from "redux";
import {IComponentProps} from '#/components/IComponentProps';
import {EnterPinScreen} from '#/components/screens/login/EnterPinScreen';
import {HomeScreen} from '#/components/screens/home/HomeScreen';
import {SettingsScreen} from '#/components/screens/settings/SettingsScreen';
import {NewGameScreen} from '#/components/screens/new-game/NewGameScreen';
import {SearchPlayerScreen} from '#/components/screens/search-players/SearchPlayerScreen';
import {IDB} from '#/services/idb';

interface IProps {
  state: IAppState;
  dispatch: Dispatch<AppActionTypes>;
  storage: IDB;
}

export const App = React.memo(function (props: IProps) {
  const {state, dispatch} = props;
  return (
    <div className={`App theme-${state.settings.currentTheme}`}>
      <CurrentScreen state={state} dispatch={dispatch} />
    </div>
  )
})


const CurrentScreen = React.memo(function (props: IComponentProps) {
  const {state, dispatch} = props;

  switch (state.currentScreen) {
    case 'login':
      return <EnterPinScreen state={state} dispatch={dispatch} />;

      // return <LoginErrorScreen />
    case 'overview':
      return <HomeScreen state={state} dispatch={dispatch} />;
    case 'settings':
      return <SettingsScreen state={state} dispatch={dispatch} />;
    case 'newGame':
      return <NewGameScreen state={state} dispatch={dispatch} />
    case 'searchPlayer':
      return <SearchPlayerScreen state={state} dispatch={dispatch} />
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

  return null
})
