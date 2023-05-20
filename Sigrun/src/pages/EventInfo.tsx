import * as React from 'react';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { Redirect } from 'wouter';
import { Container, Divider, Group, Space } from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { Remark } from 'react-remark';
import { EventTopNavigation } from '../components/EventTopNavigation';

export const EventInfo: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  const api = useApi();
  const [events] = useIsomorphicState(
    [],
    'EventInfo_event_' + eventId,
    () => api.getEventsById([parseInt(eventId, 10)]),
    [eventId]
  );

  if (!events) {
    return <Redirect to='/' />;
  }
  const [event] = events;

  return (
    <Container>
      <Group position='apart'>
        <h2 style={{ display: 'flex', gap: '20px' }}>
          {event && <EventTypeIcon event={event} />}
          {event?.title}
        </h2>
        <EventTopNavigation eventId={eventId} />
      </Group>
      <Divider size='xs' />
      <Space h='md' />
      <Remark>{event?.description}</Remark>
    </Container>
  );
};
