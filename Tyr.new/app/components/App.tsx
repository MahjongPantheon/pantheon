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
import {TableScreen} from '#/components/screens/table/TableScreen';
import {SelectHandScreen} from '#/components/screens/select-hand/SelectHandScreen';
import {I18nService} from '#/services/i18n';
import {GameResultScreen} from '#/components/screens/game-result/GameResultScreen';
import {LoginScreen} from '#/components/screens/login/LoginScreen';

interface IProps {
  state: IAppState;
  dispatch: Dispatch<AppActionTypes>;
  storage: IDB;
  i18nService: I18nService;
}

const CurrentScreen: React.FC<IComponentProps> = (props) => {
  const {state} = props;

  switch (state.currentScreen) {
    case 'login':
      return <LoginScreen {...props} />;
    case 'overview':
      return <HomeScreen {...props} />;
    case 'settings':
      return <SettingsScreen {...props} />;
    case 'newGame':
      return <NewGameScreen {...props} />
    case 'searchPlayer':
      return <SearchPlayerScreen {...props} />
    case 'currentGame':
    case 'outcomeSelect':
    case 'playersSelect':
    case 'confirmation':
    case 'nagashiSelect':
    case 'paoSelect':
      return <TableScreen {...props} />
    case 'handSelect':
      return <SelectHandScreen {...props} />
    case 'lastResults':
      return <GameResultScreen {...props} />
    case 'lastRound':
      break;
  }

  return null
}

export const App: React.FC<IProps> = (props: IProps) => {
  const {state, dispatch, i18nService} = props;
  const currentThemeName = state.settings.currentTheme ?? 'day'

  return (
    <div id="screen" className={`App theme-${currentThemeName}`}>
      <CurrentScreen state={state} dispatch={dispatch} i18nService={i18nService} />
    </div>
  )
}
