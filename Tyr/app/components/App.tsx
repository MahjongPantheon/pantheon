import * as React from 'react';
import {useEffect} from 'react';
import '../styles/base.css'
import '../styles/themes.css'
import '../styles/variables.css'
import {Features, IAppState} from '#/store/interfaces';
import {
  AppActionTypes, ENABLE_FEATURE,
  HISTORY_INIT,
  INIT_STATE,
  INIT_WORKER_HANDLERS,
  SELECT_EVENT,
  SETTINGS_SAVE_LANG,
  STARTUP_WITH_AUTH
} from '#/store/actions/interfaces';
import {Dispatch} from "redux";
import {IComponentProps} from '#/components/IComponentProps';
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
import {LogScreen} from '#/components/screens/log/LogScreen';
import {environment} from '#config';
import {EventSelectScreen} from "#/components/screens/event-select/EventSelectScreen";
import {OtherTablesList} from "#/components/screens/other-tables-list/OtherTablesListScreen";
import {i18n} from './i18n';

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
    case 'eventSelector':
      return <EventSelectScreen {...props} />;
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
    case 'otherTable':
      return <TableScreen {...props} />
    case 'handSelect':
      return <SelectHandScreen {...props} />
    case 'lastResults':
      return <GameResultScreen {...props} />
    case 'gameLog':
      return <LogScreen {...props} />
    case 'otherTablesList':
      return <OtherTablesList {...props} />
  }

  return null
}

export const App: React.FC<IProps> = (props: IProps) => {
  const {state, dispatch, storage, i18nService} = props;
  const currentThemeName = state.settings.currentTheme ?? 'day'

  useEffect(() => {
    dispatch({type: INIT_STATE});
    dispatch({type: INIT_WORKER_HANDLERS});
    const settings = storage.get(environment.idbSettingsKey, 'string');
    if (settings) {
      const settingsParsed: Features = JSON.parse(settings);
      if (settingsParsed.wsClient) {
        dispatch({ type: ENABLE_FEATURE, payload: { feature: 'wsClient', enable: true } });
      }
    }
    i18nService.init((localeName) => {
      dispatch({type: SETTINGS_SAVE_LANG, payload: localeName});
    }, (err) => console.error(err));
    dispatch({type: HISTORY_INIT});
    const event = storage.get(environment.idbEventKey, 'int');
    if (event) {
      dispatch({type: SELECT_EVENT, payload: event });
    }
    dispatch({type: STARTUP_WITH_AUTH, payload: {
      token: storage.get(environment.idbTokenKey, 'string') || '',
      personId: storage.get(environment.idbIdKey, 'int')
    }});
  }, [])

  return (
    <div id="screen" className={`App theme-${currentThemeName}`}>
      <i18n.Provider value={i18nService}>
        <CurrentScreen state={state} dispatch={dispatch} />
      </i18n.Provider>
    </div>
  )
}
