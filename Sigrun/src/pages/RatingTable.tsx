import * as React from 'react';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { Redirect, useLocation } from 'wouter';
import {
  Anchor,
  Container,
  Divider,
  Group,
  Text,
  Space,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
  Select,
} from '@mantine/core';
import { EventTypeIcon } from '../helpers/EventTypeIcon';
import { PlayerIcon } from '../helpers/PlayerIcon';
import { EventType } from '../clients/proto/atoms.pb';
import { useMediaQuery } from '@mantine/hooks';
import { RatingBadge, RatingBadgeLegend } from '../helpers/RatingBadge';
import { useI18n } from '../hooks/i18n';

// TODO: superadmin flag to show prefinished results
// TODO: hide or show table depending on corresponding flag
// TODO: csv export on mimir side

export const RatingTable: React.FC<{
  params: {
    eventId: string;
    orderBy?: 'name' | 'rating' | 'avg_place' | 'avg_score';
  };
}> = ({ params: { eventId, orderBy } }) => {
  orderBy = orderBy ?? 'rating';
  const order = {
    name: 'asc',
    rating: 'desc',
    avg_place: 'asc',
    avg_score: 'desc',
  }[orderBy] as 'asc' | 'desc';
  const api = useApi();
  const i18n = useI18n();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [players] = useIsomorphicState(
    [],
    'RatingTable_event_' + eventId + order + orderBy,
    () => api.getRatingTable(parseInt(eventId, 10), order ?? 'desc', orderBy ?? 'rating', false),
    [eventId, order, orderBy]
  );
  const [events] = useIsomorphicState(
    [],
    'EventInfo_event_' + eventId,
    () => api.getEventsById([parseInt(eventId, 10)]),
    [eventId]
  );

  if (!players || !events) {
    return <Redirect to='/' />;
  }
  const [event] = events;
  const DataCmp = largeScreen ? Group : Stack;

  return (
    <Container>
      <h2 style={{ display: 'flex', gap: '20px' }}>
        {event && <EventTypeIcon event={event} />}
        {event?.title}
      </h2>
      <DataCmp grow={largeScreen ? true : undefined}>
        <RatingBadgeLegend sortBy={orderBy} />
        <Select
          value={orderBy}
          onChange={(target) => navigate(`/event/${eventId}/${target}`)}
          data={[
            { value: 'rating', label: i18n._t('Sort by rating') },
            { value: 'avg_place', label: i18n._t('Sort by average place in games') },
            { value: 'avg_score', label: i18n._t('Sort by average score in games') },
            { value: 'name', label: i18n._t('Sort by player title') },
          ]}
        />
      </DataCmp>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      <Stack justify='flex-start' spacing='0'>
        {(players ?? []).map((player, idx) => {
          return (
            <DataCmp
              key={`pl_${idx}`}
              spacing='xs'
              style={{
                padding: '10px',
                backgroundColor:
                  idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
              }}
            >
              <RatingBadge
                place={idx + 1}
                sortBy={orderBy}
                rating={player.rating}
                gamesPlayed={player.gamesPlayed}
                avgPlace={player.avgPlace}
                avgScore={player.avgScore}
                winnerZone={player.winnerZone}
              />

              <Group style={{ flex: 1, marginLeft: largeScreen ? 'auto' : '55px' }}>
                <PlayerIcon p={player} />
                <Stack spacing={2}>
                  <Anchor
                    href={`/event/${event.id}/player/${player.id}`}
                    onClick={() => navigate(`/event/${event.id}/player/${player.id}`)}
                  >
                    {player.title}
                  </Anchor>
                  {event.type === EventType.EVENT_TYPE_ONLINE && (
                    <Text c='dimmed'>{player.tenhouId}</Text>
                  )}
                  {event.isTeam && player.teamName && (
                    <Text>
                      {i18n._t('Team name:')} {player.teamName}
                    </Text>
                  )}
                </Stack>
              </Group>
            </DataCmp>
          );
        })}
      </Stack>
    </Container>
  );
};
