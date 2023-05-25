import * as React from 'react';
import { Anchor, Container, Divider, Group, Space, Text } from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { Remark } from 'react-remark';
import { useEvent } from '../hooks/useEvent';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { PlayerIcon } from '../components/PlayerIcon';
import { useLocation } from 'wouter';

export const EventInfo: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  const event = useEvent(eventId);
  const api = useApi();
  const i18n = useI18n();
  const [, navigate] = useLocation();
  const [admins] = useIsomorphicState(
    [],
    'EventInfo_admins_' + eventId,
    () => api.getEventAdmins(parseInt(eventId, 10)),
    [eventId]
  );
  if (!event) {
    return null;
  }

  return (
    <Container>
      <h2 style={{ display: 'flex', gap: '20px' }}>
        {event && <EventTypeIcon event={event} />}
        {event?.title}
      </h2>
      <Divider size='xs' />
      <Space h='md' />
      <Remark>{event?.description}</Remark>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      <Group style={{ fontSize: 'small' }}>
        <Text c='dimmed'>{i18n._t('Event administrators: ')}</Text>
        {admins?.map((admin, idx) => (
          <Group key={`adm_${idx}`}>
            <PlayerIcon size='xs' p={{ title: admin.personName, id: admin.personId }} />
            <Anchor
              href={`/event/${eventId}/player/${admin.personId}`}
              onClick={(e) => {
                navigate(`/event/${eventId}/player/${admin.personId}`);
                e.preventDefault();
              }}
            >
              {admin.personName}
            </Anchor>
          </Group>
        ))}
      </Group>
    </Container>
  );
};
