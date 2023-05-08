import React from 'react';
import { useApi } from '../hooks/api';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { Button } from '@mantine/core';

export const EventList: React.FC = () => {
  const api = useApi();
  const [events, setEvents] = useIsomorphicState([], 'EventList_events', () => {
    return api.getEvents(10, 0, true);
  });
  return (
    <>
      {JSON.stringify(events)}
      <Button
        onClick={() => {
          api.getEvents(10, 10, true).then((e) => setEvents(e));
        }}
      >
        Next!
      </Button>
    </>
  );
};
