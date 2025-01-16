/*  Sigrun: rating tables and statistics frontend
 *  Copyright (C) 2023  o.klimenko aka ctizen
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

import { Avatar, MantineSize, Tooltip } from '@mantine/core';
import { IconFriends, IconNetwork, IconTournament } from '@tabler/icons-react';
import { EventType, Event } from '../clients/proto/atoms.pb';
import { useI18n } from '../hooks/i18n';

export const EventTypeIcon = ({
  event,
  iconSize,
  size,
}: {
  event: Event;
  iconSize?: number;
  size?: MantineSize;
}) => {
  const i18n = useI18n();
  return (
    <>
      {event.type === EventType.EVENT_TYPE_LOCAL && (
        <Tooltip
          events={{ hover: true, touch: true, focus: true }}
          openDelay={500}
          position='bottom'
          withArrow
          label={i18n._t('Local rating')}
        >
          <Avatar color='green' radius='xl' size={size}>
            <IconFriends size={iconSize} />
          </Avatar>
        </Tooltip>
      )}
      {event.type === EventType.EVENT_TYPE_TOURNAMENT && (
        <Tooltip
          events={{ hover: true, touch: true, focus: true }}
          openDelay={500}
          position='bottom'
          withArrow
          label={i18n._t('Tournament')}
        >
          <Avatar color='red' radius='xl' size={size}>
            <IconTournament size={iconSize} />
          </Avatar>
        </Tooltip>
      )}
      {event.type === EventType.EVENT_TYPE_ONLINE && (
        <Tooltip
          events={{ hover: true, touch: true, focus: true }}
          openDelay={500}
          position='bottom'
          withArrow
          label={i18n._t('Online event')}
        >
          <Avatar color='blue' radius='xl' size={size}>
            <IconNetwork size={iconSize} />
          </Avatar>
        </Tooltip>
      )}
    </>
  );
};
