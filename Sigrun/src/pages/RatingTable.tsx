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
  Badge,
} from '@mantine/core';
import { EventTypeIcon } from '../helpers/EventTypeIcon';
import { PlayerIcon } from '../helpers/PlayerIcon';
import { EventType } from '../clients/proto/atoms.pb';
import { useMediaQuery } from '@mantine/hooks';
import { useI18n } from '../hooks/i18n';

// TODO: aggregated events
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
    event && (
      <Container>
        <h2 style={{ display: 'flex', gap: '20px' }}>
          {event && <EventTypeIcon event={event} />}
          {event?.title}
        </h2>
        <DataCmp grow={largeScreen ? true : undefined}>
          {/*<RatingBadgeLegend sortBy={orderBy} />*/}
          <Stack>
            <DataCmp position='right' spacing='md'>
              {largeScreen && (
                <Badge
                  size='lg'
                  color='blue'
                  radius='sm'
                  variant='light'
                  style={{ backgroundColor: 'transparent' }}
                >
                  {i18n._t('Player name')}
                </Badge>
              )}
              <Group spacing='md' grow={!largeScreen}>
                <Badge
                  size='lg'
                  color='lime'
                  radius='sm'
                  variant={orderBy === 'rating' ? 'filled' : 'light'}
                  component={'a'}
                  href={`/event/${event.id}/rating`}
                  onClick={(e) => {
                    navigate(`/event/${event.id}/rating`);
                    e.preventDefault();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {i18n._t('Rating')}
                </Badge>
                <Badge
                  size='lg'
                  color='green'
                  radius='sm'
                  variant={orderBy === 'avg_score' ? 'filled' : 'light'}
                  component={'a'}
                  href={`/event/${event.id}/avg_score`}
                  onClick={(e) => {
                    navigate(`/event/${event.id}/avg_score`);
                    e.preventDefault();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {i18n._t('Average score')}
                </Badge>
              </Group>
              <Group spacing='md' grow={!largeScreen}>
                <Badge
                  size='lg'
                  color='cyan'
                  radius='sm'
                  variant={orderBy === 'avg_place' ? 'filled' : 'light'}
                  component={'a'}
                  href={`/event/${event.id}/avg_place`}
                  onClick={(e) => {
                    navigate(`/event/${event.id}/avg_place`);
                    e.preventDefault();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {i18n._t('Average place')}
                </Badge>
                <Badge size='lg' color='gray' radius='sm'>
                  {i18n._t('Games played')}
                </Badge>
              </Group>
            </DataCmp>
          </Stack>
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
                    idx % 2
                      ? isDark
                        ? theme.colors.dark[7]
                        : theme.colors.gray[1]
                      : 'transparent',
                }}
              >
                <Group style={{ flex: 1 }}>
                  <Badge w={50} size='xl' color='blue' radius='sm' style={{ padding: 0 }}>
                    {idx + 1}
                  </Badge>
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
                <Group spacing={2} grow={!largeScreen}>
                  <Badge
                    w={75}
                    size='lg'
                    variant={orderBy === 'rating' ? 'filled' : 'light'}
                    color={player.winnerZone ? 'lime' : 'red'}
                    radius='sm'
                    style={{ padding: 0 }}
                  >
                    {player.rating}
                  </Badge>
                  <Badge
                    w={65}
                    size='lg'
                    variant={orderBy === 'avg_score' ? 'filled' : 'light'}
                    color={player.winnerZone ? 'green' : 'pink'}
                    radius='sm'
                    style={{ padding: 0 }}
                  >
                    {player.avgScore.toFixed(0)}
                  </Badge>
                  <Badge
                    w={45}
                    size='lg'
                    color='cyan'
                    variant={orderBy === 'avg_place' ? 'filled' : 'light'}
                    radius='sm'
                    style={{ padding: 0 }}
                  >
                    {player.avgPlace.toFixed(2)}
                  </Badge>
                  <Badge w={45} size='lg' color='gray' radius='sm' style={{ padding: 0 }}>
                    {player.gamesPlayed.toFixed(0)}
                  </Badge>
                </Group>
              </DataCmp>
            );
          })}
        </Stack>
      </Container>
    )
  );
};
