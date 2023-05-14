import { Avatar, Tooltip } from '@mantine/core';
import { IconFriends, IconNetwork, IconTournament } from '@tabler/icons-react';
import * as React from 'react';
import { EventType, Event } from '../clients/proto/atoms.pb';
import { useI18n } from '../hooks/i18n';

export const EventTypeIcon = ({ event }: { event: Event }) => {
  const i18n = useI18n();
  return (
    <>
      {event.type === EventType.EVENT_TYPE_LOCAL && (
        <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Local rating')}>
          <Avatar color='green' radius='xl'>
            <IconFriends />
          </Avatar>
        </Tooltip>
      )}
      {event.type === EventType.EVENT_TYPE_TOURNAMENT && (
        <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Tournament')}>
          <Avatar color='red' radius='xl'>
            <IconTournament />
          </Avatar>
        </Tooltip>
      )}
      {event.type === EventType.EVENT_TYPE_ONLINE && (
        <Tooltip openDelay={500} position='bottom' withArrow label={i18n._t('Online event')}>
          <Avatar color='blue' radius='xl'>
            <IconNetwork />
          </Avatar>
        </Tooltip>
      )}
    </>
  );
};
