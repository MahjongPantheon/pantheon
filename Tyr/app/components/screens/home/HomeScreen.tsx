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
import { IComponentProps } from '../../IComponentProps';
import {
  GET_OTHER_TABLES_LIST_INIT,
  GO_TO_CURRENT_GAME,
  GO_TO_DONATE,
  OPEN_SETTINGS,
  SHOW_LAST_RESULTS,
  START_NEW_GAME,
  UPDATE_CURRENT_GAMES_INIT,
} from '../../../store/actions/interfaces';
import { HomeScreenView } from './HomeScreenView';
import { Preloader } from '../../general/preloader/Preloader';
import { isLoading } from '../../../store/selectors/screenConfirmationSelectors';
import { i18n } from '../../i18n';
import { I18nService } from '../../../services/i18n';

export class HomeScreen extends React.PureComponent<IComponentProps> {
  static contextType = i18n;
  private onSettingClick() {
    this.props.dispatch({ type: OPEN_SETTINGS });
  }

  private onRefreshClick() {
    this.props.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
  }

  private onOtherTablesClick() {
    this.props.dispatch({ type: GET_OTHER_TABLES_LIST_INIT });
  }

  private onPrevGameClick() {
    this.props.dispatch({ type: SHOW_LAST_RESULTS });
  }

  private onNewGameClick() {
    this.props.dispatch({ type: START_NEW_GAME });
  }

  private onCurrentGameClick() {
    const { dispatch } = this.props;
    dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    dispatch({ type: GO_TO_CURRENT_GAME });
  }

  private onStatClick() {
    const { gameConfig } = this.props.state;
    if (gameConfig) {
      window.open(
        `${(gameConfig.eventStatHost.startsWith('https://') ||
        gameConfig.eventStatHost.startsWith('http://localhost:')
          ? gameConfig.eventStatHost
          : 'https://' + gameConfig.eventStatHost
        ).replace(/\/info$/, '/order/rating')}`
      );
    }
  }

  private onDonateClick() {
    const { dispatch } = this.props;
    dispatch({ type: GO_TO_DONATE });
  }

  componentDidMount() {
    if (this.props.state.currentEventId) {
      const { dispatch } = this.props;
      dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    }
  }

  render() {
    const { state } = this.props;
    const loc = this.context as I18nService;
    if (!state.gameConfig || isLoading(state)) {
      return <Preloader />;
    }

    const playerName = state.gameConfig.eventTitle || loc._t('Event title');

    // Show donate button only for russian locale and only for primary instance.
    // TODO: make this configurable
    const showDonate =
      this.props.state.settings.currentLang === 'ru' &&
      (window.location.host.startsWith('localhost') ||
        window.location.host === 'assist.riichimahjong.org');

    return (
      <HomeScreenView
        eventName={playerName}
        canStartGame={
          !state.gameConfig.autoSeating &&
          !state.currentSessionHash &&
          !state.gameConfig.isPrescripted
        }
        hasStartedGame={!!state.currentSessionHash && state.gameOverviewReady}
        // Show button always, if there is no prev game - empty screen with "No games found" text will be shown
        hasPrevGame={true}
        canSeeOtherTables={true}
        showDonate={showDonate}
        hasStat={!!state.gameConfig.eventStatHost}
        onDonateClick={this.onDonateClick.bind(this)}
        onSettingClick={this.onSettingClick.bind(this)}
        onRefreshClick={this.onRefreshClick.bind(this)}
        onOtherTablesClick={this.onOtherTablesClick.bind(this)}
        onPrevGameClick={this.onPrevGameClick.bind(this)}
        onNewGameClick={this.onNewGameClick.bind(this)}
        onCurrentGameClick={this.onCurrentGameClick.bind(this)}
        onStatClick={this.onStatClick.bind(this)}
      />
    );
  }
}
