import * as React from 'react';
import { Container, Divider, Space } from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { Remark } from 'react-remark';
import { useEvent } from '../hooks/useEvent';

export const EventInfo: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  const event = useEvent(eventId);
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
    </Container>
  );
};
