import React from 'react';
import { useApi } from '../hooks/api';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { Button } from '@mantine/core';
import { useLocation } from 'wouter';

const PERPAGE = 20;
export const EventList: React.FC<{ params: { page?: string } }> = ({ params: { page } }) => {
  page = page ?? '1';
  const api = useApi();
  const [, navigate] = useLocation();
  const [events] = useIsomorphicState(
    [],
    'EventList_events_' + page,
    () => api.getEvents(10, (parseInt(page ?? '1', 10) - 1) * PERPAGE, true),
    [page]
  );
  return (
    <>
      {JSON.stringify(events)}
      <Button
        onClick={() => {
          navigate('/page/2');
        }}
      >
        Next!
      </Button>
      <Button
        onClick={() => {
          navigate('/');
        }}
      >
        Prev!
      </Button>
    </>
  );
};
