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

import { useEffect, useState } from 'react';
import styles from './App.module.css';
import themes from './themes.module.css';
import { IAppState } from '../store/interfaces';
import {
  AppActionTypes,
  GO_TO_CURRENT_GAME,
  HISTORY_INIT,
  INIT_STATE,
  SELECT_EVENT,
  SETTINGS_SAVE_LANG,
  STARTUP_WITH_AUTH,
  TOGGLE_RIICHI_NOTIFICATION,
  UPDATE_CURRENT_GAMES_INIT,
} from '../store/actions/interfaces';
import { Dispatch } from 'redux';
import { IComponentProps } from './IComponentProps';
import { Home } from './screens/Home/Home';
import { Settings } from './screens/Settings/Settings';
import { NewGame } from './screens/NewGame/NewGame';
import { SearchPlayerScreen } from './screens/SearchPlayers/SearchPlayerScreen';
import { SelectHand } from './screens/SelectHand/SelectHand';
import { I18nService } from '../services/i18n';
import { GameResultScreen } from './screens/GameResult/GameResultScreen';
import { Login } from './screens/Login/Login';
import { Log } from './screens/Log/Log';
import { Donate } from './screens/Donate/Donate';
import { EventSelect } from './screens/EventSelect/EventSelect';
import { OtherTablesList } from './screens/OtherTablesList/OtherTablesList';
import { i18n } from './i18n';
import { IStorage } from '../../../Common/storage';
import { v4 } from 'uuid';
import { fontLoader } from '../helpers/fontLoader';
import { ModalDialog } from './base/ModalDialog/ModalDialog';
import clsx from 'classnames';
import { TableCurrentGame } from './screens/TableCurrentGame/TableCurrentGame';
import { TableSelectPlayers } from './screens/TableSelectPlayers/TableSelectPlayers';
import { TableNagashiSelect } from './screens/TableNagashiSelect/TableNagashiSelect';
import { OtherTableView } from './screens/OtherTableView/OtherTableView';
import { TableRoundPreview } from './screens/TableRoundPreview/TableRoundPreview';
import { Penalties } from './screens/Penalties/Penalties';
import { Congrats } from './screens/Congrats/Congrats';

interface IProps {
  state: IAppState;
  dispatch: Dispatch<AppActionTypes>;
  storage: IStorage;
  i18nService: I18nService;
}

const CurrentScreen = (props: IComponentProps) => {
  const { state } = props;

  switch (state.currentScreen) {
    case 'login':
      return <Login {...props} />;
    case 'eventSelector':
      return <EventSelect {...props} />;
    case 'overview':
      return <Home {...props} />;
    case 'settings':
      return <Settings {...props} />;
    case 'newGame':
      return <NewGame {...props} />;
    case 'searchPlayer':
      return <SearchPlayerScreen {...props} />;
    case 'currentGame':
      return <TableCurrentGame {...props} />;
    case 'playersSelect':
      return <TableSelectPlayers {...props} />;
    case 'nagashiSelect':
      return <TableNagashiSelect {...props} />;
    case 'confirmation':
      return <TableRoundPreview {...props} />;
    case 'otherTable':
      return <OtherTableView {...props} />;
    case 'handSelect':
      return <SelectHand {...props} />;
    case 'lastResults':
      return <GameResultScreen {...props} />;
    case 'gameLog':
      return <Log {...props} />;
    case 'otherTablesList':
      return <OtherTablesList {...props} />;
    case 'donate':
      return <Donate {...props} />;
    case 'congrats':
      return <Congrats {...props} />;
    case 'penalties':
      return <Penalties {...props} />;
  }

  return null;
};

export const App = (props: IProps) => {
  const { state, dispatch, storage, i18nService } = props;
  const currentThemeName = state.settings.currentTheme ?? 'day';
  const [firstStart, setFirstStart] = useState(true);

  useEffect(() => {
    dispatch({ type: INIT_STATE });
    i18nService.init(
      (localeName) => {
        dispatch({ type: SETTINGS_SAVE_LANG, payload: localeName });
        fontLoader(localeName);
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

    // goto game screen if there is one
    props.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
  }, []);

  useEffect(() => {
    if (state.currentSessionHash && firstStart) {
      props.dispatch({ type: GO_TO_CURRENT_GAME });
      setFirstStart(false);
    }
  }, [state.currentSessionHash, firstStart]);

  const curDate = new Date();
  const haveNySpecs =
    (curDate.getMonth() === 11 && curDate.getDate() > 20) ||
    (curDate.getMonth() === 0 && curDate.getDate() < 10);

  const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;

  const themeStyle = [
    currentThemeName === 'day' ? themes.themeDay : null,
    currentThemeName === 'night' ? themes.themeNight : null,
    currentThemeName === 'junkmat' ? themes.themeJunkmat : null,
    currentThemeName === 'oled' ? themes.themeOled : null,
  ];

  return (
    <div
      id='screen'
      className={clsx(
        styles.App,
        themes.common,
        ...themeStyle,
        haveNySpecs ? styles.newyear : null
      )}
    >
      <div className={clsx(styles.AppWrap, isInStandaloneMode ? styles.pwafix : null)}>
        <i18n.Provider value={i18nService}>
          <CurrentScreen state={state} dispatch={dispatch} newyear={haveNySpecs} />
          {state.riichiNotificationShown && (
            <ModalDialog
              onClose={() => {
                dispatch({ type: TOGGLE_RIICHI_NOTIFICATION, payload: false });
              }}
              actionPrimary={() => {
                dispatch({ type: TOGGLE_RIICHI_NOTIFICATION, payload: false });
              }}
              actionPrimaryLabel={i18nService._t('OK')}
            >
              {i18nService._t('Please return back and press riichi button for the winner')}
            </ModalDialog>
          )}
        </i18n.Provider>
      </div>
    </div>
  );
};
