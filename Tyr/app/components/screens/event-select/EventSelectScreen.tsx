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
import { EventSelectScreenView } from './EventSelectScreenView';
import { IComponentProps } from '../../IComponentProps';
import {
  EVENTS_GET_LIST_INIT,
  GOTO_PREV_SCREEN,
  OPEN_SETTINGS,
  SELECT_EVENT,
} from '../../../store/actions/interfaces';
import { Preloader } from '../../general/preloader/Preloader';
import { i18n } from '../../i18n';
import { I18nService } from '../../../services/i18n';

export class EventSelectScreen extends React.PureComponent<IComponentProps> {
  static contextType = i18n;
  private onBackClick() {
    const { dispatch } = this.props;
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onSettingsClick() {
    const { dispatch } = this.props;
    dispatch({ type: OPEN_SETTINGS });
  }

  private onSelectEvent(eventId: number) {
    const { dispatch } = this.props;
    dispatch({ type: SELECT_EVENT, payload: eventId });
  }

  public componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: EVENTS_GET_LIST_INIT });
  }

  render() {
    const { state } = this.props;
    const loc = this.context as I18nService;
    const playerName = state.currentPlayerDisplayName ?? loc._t('name');

    return state.loading.events ? (
      <Preloader />
    ) : (
      <EventSelectScreenView
        playerName={playerName}
        events={state.eventsList}
        currentEvent={state.currentEventId}
        onBackClick={this.onBackClick.bind(this)}
        onSettingClick={this.onSettingsClick.bind(this)}
        onSelectEvent={this.onSelectEvent.bind(this)}
      />
    );
  }
}
