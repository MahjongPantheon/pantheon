import { Avatar, MantineNumberSize, Tooltip } from '@mantine/core';
import { IconFriends, IconNetwork, IconTournament } from '@tabler/icons-react';
import * as React from 'react';
import { EventType, Event } from '../clients/proto/atoms.pb';
import { useI18n } from '../hooks/i18n';

export const EventTypeIcon = ({
  event,
  iconSize,
  size,
}: {
  event: Event;
  iconSize?: number;
  size?: MantineNumberSize;
}) => {
  const i18n = useI18n();
  return (
    <>
      {event.type === EventType.EVENT_TYPE_LOCAL && (
        <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Local rating')}>
          <Avatar color='green' radius='xl' size={size}>
            <IconFriends size={iconSize} />
          </Avatar>
        </Tooltip>
      )}
      {event.type === EventType.EVENT_TYPE_TOURNAMENT && (
        <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Tournament')}>
          <Avatar color='red' radius='xl' size={size}>
            <IconTournament size={iconSize} />
          </Avatar>
        </Tooltip>
      )}
      {event.type === EventType.EVENT_TYPE_ONLINE && (
        <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Online event')}>
          <Avatar color='blue' radius='xl' size={size}>
            <IconNetwork size={iconSize} />
          </Avatar>
        </Tooltip>
      )}
    </>
  );
};