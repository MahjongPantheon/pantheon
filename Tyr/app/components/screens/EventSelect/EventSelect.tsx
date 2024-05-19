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
  EVENTS_GET_LIST_INIT,
  GOTO_PREV_SCREEN,
  OPEN_SETTINGS,
  SELECT_EVENT,
} from '../../../store/actions/interfaces';
import { Loader } from '../../base/Loader/Loader';
import { EventSelect as EventSelectPage } from '../../pages/EventSelect/EventSelect';
import { useContext, useEffect } from 'react';
import { i18n } from '../../i18n';

export const EventSelect = (props: IComponentProps) => {
  const loc = useContext(i18n);
  useEffect(() => {
    props.dispatch({ type: EVENTS_GET_LIST_INIT });
  }, []);

  const onBackClick = () => {
    props.dispatch({ type: GOTO_PREV_SCREEN });
  };

  const onSettingsClick = () => {
    props.dispatch({ type: OPEN_SETTINGS });
  };

  const onSelectEvent = (eventId: number) => {
    props.dispatch({ type: SELECT_EVENT, payload: eventId });
  };

  const playerName = props.state.currentPlayerDisplayName ?? loc._t('name');

  if (props.state.loading.events || !props.state.currentPlayerId) {
    return <Loader />;
  }

  return (
    <EventSelectPage
      player={{
        playerName,
        id: props.state.currentPlayerId,
        hasAvatar: props.state.currentPlayerHasAvatar,
        lastUpdate: props.state.currentPlayerLastUpdate,
      }}
      events={props.state.eventsList}
      currentEvent={props.state.currentEventId}
      onBackClick={onBackClick}
      onSettingClick={onSettingsClick}
      onSelectEvent={onSelectEvent}
    />
  );
};
