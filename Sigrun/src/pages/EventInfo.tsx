import * as React from 'react';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { Redirect } from 'wouter';
import { Container, Divider, Space } from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { Remark } from 'react-remark';
import { useContext, useEffect } from 'react';
import { globalsCtx } from '../hooks/globals';

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
  const globals = useContext(globalsCtx);
  useEffect(() => {
    globals.setEventId(parseInt(eventId, 10));
  }, [eventId]);

  return (
    <Container>
      <h2 style={{ display: 'flex', gap: '20px' }}>
        {event && <EventTypeIcon event={event} />}
        {event?.title}
      </h2>
      <Divider size='xs' />
      <Space h='md' />
      <Remark>{event?.description}</Remark>
    </Container>
  );
};
