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

import { IComponentProps } from '../../IComponentProps';
import {
  GET_OTHER_TABLES_LIST_INIT,
  GO_TO_CURRENT_GAME,
  GO_TO_DONATE,
  GO_TO_PENALTIES,
  OPEN_SETTINGS,
  SHOW_LAST_RESULTS,
  START_NEW_GAME,
  UPDATE_CURRENT_GAMES_INIT,
} from '../../../store/actions/interfaces';
import { Home as HomePage } from '../../pages/Home/Home';
import { useContext, useEffect, useState } from 'react';
import { i18n } from '../../i18n';
import { Loader } from '../../base/Loader/Loader';

export const Home = (props: IComponentProps) => {
  const loc = useContext(i18n);
  const [componentReady, setComponentReady] = useState(false);
  useEffect(() => {
    if (props.state.currentEventId) {
      props.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    }
  }, [props.state.currentEventId]);

  useEffect(() => {
    setComponentReady(true);
  }, []);

  if (
    !componentReady ||
    !props.state.gameConfig ||
    props.state.loading.overview ||
    props.state.loading.addRound ||
    props.state.loading.games
  ) {
    return <Loader />;
  }

  const onSettingClick = () => {
    props.dispatch({ type: OPEN_SETTINGS });
  };

  const onRefreshClick = () => {
    props.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
  };

  const onOtherTablesClick = () => {
    props.dispatch({ type: GET_OTHER_TABLES_LIST_INIT });
  };

  const onPrevGameClick = () => {
    props.dispatch({ type: SHOW_LAST_RESULTS });
  };

  const onNewGameClick = () => {
    props.dispatch({ type: START_NEW_GAME });
  };

  const onCurrentGameClick = () => {
    props.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    props.dispatch({ type: GO_TO_CURRENT_GAME });
  };

  const onStatClick = () => {
    const { gameConfig } = props.state;
    if (gameConfig) {
      window.open(
        `${(gameConfig.eventStatHost.startsWith('https://') ||
        gameConfig.eventStatHost.includes('.pantheon.local')
          ? gameConfig.eventStatHost
          : 'https://' + gameConfig.eventStatHost
        ).replace(/\/info$/, '/order/rating')}`
      );
    }
  };

  const onDonateClick = () => {
    props.dispatch({ type: GO_TO_DONATE });
  };

  const onPenaltiesClick = () => {
    props.dispatch({ type: GO_TO_PENALTIES });
  };

  const playerName = props.state.gameConfig?.eventTitle ?? loc._t('Event title');

  // Show donate button only for russian locale.
  // TODO: make this configurable
  const showDonate =
    props.state.settings.currentLang === 'ru' && window.location.host.startsWith('localhost');

  const showPenalties = props.state.gameConfig?.syncStart; // only show for tournaments

  return (
    <HomePage
      eventName={playerName}
      canStartGame={
        !props.state.gameConfig?.autoSeating &&
        !props.state.currentSessionHash &&
        !props.state.gameConfig?.isPrescripted
      }
      hasStartedGame={!!props.state.currentSessionHash && props.state.gameOverviewReady}
      // Show button always, if there is no prev game - empty screen with "No games found" text will be shown
      hasPrevGame={true}
      canSeeOtherTables={
        props.state.gameConfig?.allowViewOtherTables || !props.state.currentSessionHash
      }
      showDonate={showDonate}
      showPenalties={showPenalties}
      hasStat={!!props.state.gameConfig?.eventStatHost}
      onDonateClick={onDonateClick}
      onPenaltiesClick={onPenaltiesClick}
      onSettingClick={onSettingClick}
      onRefreshClick={onRefreshClick}
      onOtherTablesClick={onOtherTablesClick}
      onPrevGameClick={onPrevGameClick}
      onNewGameClick={onNewGameClick}
      onCurrentGameClick={onCurrentGameClick}
      onStatClick={onStatClick}
    />
  );
};
