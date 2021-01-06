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
import {TableIdle} from '#/components/screens/table/TableIdle';
import {SelectHandScreen} from '#/components/screens/select-hand/SelectHandScreen';
import {I18nService} from '#/services/i18n';

interface IProps {
  state: IAppState;
  dispatch: Dispatch<AppActionTypes>;
  storage: IDB;
  i18nService: I18nService;
}

export const App = React.memo(function (props: IProps) {
  const {state, dispatch, i18nService} = props;
  return (
    <div id="screen" className={`App theme-${state.settings.currentTheme}`}>
      <CurrentScreen state={state} dispatch={dispatch} i18nService={i18nService} />
    </div>
  )
})


const CurrentScreen = React.memo(function (props: IComponentProps) {
  const {state} = props;

  switch (state.currentScreen) {
    case 'login':
      return <EnterPinScreen {...props} />;

      // return <LoginErrorScreen />
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
      return <TableIdle {...props} />
    case 'yakuSelect':
    case 'totalHandSelect':
      return <SelectHandScreen {...props} />
    case 'paoSelect':
    case 'nagashiSelect':
    case 'lastResults':
    case 'lastRound':
    case 'confirmation':
      break;
  }

  return null
})
