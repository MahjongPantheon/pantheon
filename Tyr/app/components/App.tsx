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

import * as React from 'react';
import { useEffect } from 'react';
import '../styles/base.css';
import '../styles/themes.css';
import '../styles/variables.css';
import { IAppState } from '../store/interfaces';
import {
  AppActionTypes,
  HISTORY_INIT,
  INIT_STATE,
  SELECT_EVENT,
  SETTINGS_SAVE_LANG,
  STARTUP_WITH_AUTH,
} from '../store/actions/interfaces';
import { Dispatch } from 'redux';
import { IComponentProps } from './IComponentProps';
import { HomeScreen } from './screens/home/HomeScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { NewGameScreen } from './screens/new-game/NewGameScreen';
import { SearchPlayerScreen } from './screens/search-players/SearchPlayerScreen';
import { TableScreen } from './screens/table/TableScreen';
import { SelectHandScreen } from './screens/select-hand/SelectHandScreen';
import { I18nService } from '../services/i18n';
import { GameResultScreen } from './screens/game-result/GameResultScreen';
import { LoginScreen } from './screens/login/LoginScreen';
import { LogScreen } from './screens/log/LogScreen';
import { DonateScreen } from './screens/donate/DonateScreen';
import { EventSelectScreen } from './screens/event-select/EventSelectScreen';
import { OtherTablesList } from './screens/other-tables-list/OtherTablesListScreen';
import { i18n } from './i18n';
import { IStorage } from '../../../Common/storage';
import { v4 } from 'uuid';

interface IProps {
  state: IAppState;
  dispatch: Dispatch<AppActionTypes>;
  storage: IStorage;
  i18nService: I18nService;
}

const CurrentScreen: React.FC<IComponentProps> = (props) => {
  const { state } = props;

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
      return <NewGameScreen {...props} />;
    case 'searchPlayer':
      return <SearchPlayerScreen {...props} />;
    case 'currentGame':
    case 'outcomeSelect':
    case 'playersSelect':
    case 'confirmation':
    case 'nagashiSelect':
    case 'paoSelect':
    case 'otherTable':
      return <TableScreen {...props} />;
    case 'handSelect':
      return <SelectHandScreen {...props} />;
    case 'lastResults':
      return <GameResultScreen {...props} />;
    case 'gameLog':
      return <LogScreen {...props} />;
    case 'otherTablesList':
      return <OtherTablesList {...props} />;
    case 'donate':
      return <DonateScreen {...props} />;
  }

  return null;
};

export const App: React.FC<IProps> = (props: IProps) => {
  const { state, dispatch, storage, i18nService } = props;
  const currentThemeName = state.settings.currentTheme ?? 'day';

  useEffect(() => {
    dispatch({ type: INIT_STATE });
    i18nService.init(
      (localeName) => {
        dispatch({ type: SETTINGS_SAVE_LANG, payload: localeName });
        if (localeName === 'jp' || localeName === 'ko') {
          const fontLink = window.document.getElementById('font-' + localeName);
          if (!fontLink) {
            const newLink = window.document.createElement('link');
            newLink.setAttribute('id', 'font-' + localeName);
            newLink.setAttribute('rel', 'stylesheet');
            newLink.setAttribute('href', '/public/font-' + localeName + '.css');
            window.document.head.appendChild(newLink);
          }
        }
      },
      (err) => console.error(err)
    );
    dispatch({ type: HISTORY_INIT });
    const event = storage.getEventId();
    if (event) {
      dispatch({ type: SELECT_EVENT, payload: event });
    }
    const sid = storage.getSessionId() ?? v4();
    storage.setSessionId(sid);
    dispatch({
      type: STARTUP_WITH_AUTH,
      payload: {
        token: storage.getAuthToken() ?? '',
        personId: storage.getPersonId() ?? 0,
        sessionId: sid,
      },
    });
  }, []);

  const curDate = new Date();
  const haveNySpecs =
    (curDate.getMonth() === 11 && curDate.getDate() > 20) ||
    (curDate.getMonth() === 0 && curDate.getDate() < 10);

  const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;

  return (
    <div id='screen' className={`App theme-${currentThemeName}${haveNySpecs ? ' newyear' : ''}`}>
      <div className={`AppWrap ${isInStandaloneMode ? 'pwafix' : ''}`}>
        <i18n.Provider value={i18nService}>
          <CurrentScreen state={state} dispatch={dispatch} />
        </i18n.Provider>
      </div>
    </div>
  );
};
