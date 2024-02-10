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
import './event-select.css';
import classNames from 'classnames';
import { useContext } from 'react';
import { i18n } from '../../i18n';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import SettingsIcon from '../../../img/icons/settings.svg?react';
import { MyEvent } from '../../../clients/proto/atoms.pb';
import { PlayerAvatar } from '../../general/avatar/Avatar';

interface IProps {
  playerName: string;
  playerId?: number;
  playerHasAvatar?: boolean;
  playerLastUpdate: string;
  events: MyEvent[];
  currentEvent: number | undefined;
  onBackClick: () => void;
  onSettingClick: () => void;
  onSelectEvent: (eventId: number) => void;
}

export const EventSelectScreenView = React.memo(function (props: IProps) {
  const loc = useContext(i18n);
  const {
    playerName,
    playerId,
    playerHasAvatar,
    playerLastUpdate,
    events,
    onBackClick,
    onSettingClick,
    onSelectEvent,
    currentEvent,
  } = props;

  return (
    <div className='flex-container page-event-select'>
      <div className='flex-container__content'>
        <div className='top-panel top-panel--between'>
          {events.length > 0 ? (
            <div className='svg-button' onClick={onBackClick}>
              <BackIcon />
            </div>
          ) : null}
          <div className='svg-button svg-button--small' onClick={onSettingClick}>
            <SettingsIcon />
          </div>
        </div>
        <div className='page-event-select__name'>
          {playerId && (
            <PlayerAvatar
              size={48}
              p={{
                id: playerId,
                title: playerName,
                hasAvatar: playerHasAvatar,
                lastUpdate: playerLastUpdate,
              }}
            />
          )}
          {playerName}
        </div>
        <div className='page-event-select__section'>
          {events.length > 0 ? (
            <>
              <div className='page-event-select__section-title'>{loc._t('Select event')}</div>
              <div className='page-event-select__section-content'>
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={classNames('radio-menuitem', {
                      'radio-menuitem--active': event.id === currentEvent,
                    })}
                    onClick={() => onSelectEvent(event.id)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              {loc._t('There is no events you participate in right now')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
