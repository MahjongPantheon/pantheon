import * as React from 'react';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useLocation } from 'wouter';
import {
  Container,
  Divider,
  Space,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
  Center,
  Pagination,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useI18n } from '../hooks/i18n';
import { EventType, Player } from '../clients/proto/atoms.pb';
import { GameListing } from '../components/GameListing';
import { Fragment } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useEvent } from '../hooks/useEvent';

// TODO: aggregated events
const PERPAGE = 10;
export const RecentGames: React.FC<{
  params: {
    eventId: string;
    page?: string;
  };
}> = ({ params: { eventId, page } }) => {
  page = page ?? '1';
  const api = useApi();
  const i18n = useI18n();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const event = useEvent(eventId);
  const [games] = useIsomorphicState(
    [],
    'RecentGames_games_' + eventId,
    () =>
      api.getRecentGames(parseInt(eventId, 10), PERPAGE, (parseInt(page ?? '1', 10) - 1) * PERPAGE),
    [eventId, page]
  );

  if (!games || !event) {
    return null;
  }
  const players = games?.players?.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<number, Player>);

  return (
    event && (
      <Container>
        <h2 style={{ display: 'flex', gap: '20px' }}>
          {event && <EventTypeIcon event={event} />}
          {event?.title} - {i18n._t('Last games')}
        </h2>
        <Space h='md' />
        <Divider size='xs' />
        <Space h='md' />
        <Stack spacing={0}>
          {games?.games?.map((game, idx) => (
            <Fragment key={`gm_${idx}`}>
              <GameListing
                showShareLink={true}
                isOnline={event.type === EventType.EVENT_TYPE_ONLINE}
                eventId={eventId}
                game={game}
                players={players}
                rowStyle={{
                  padding: '16px',
                  backgroundColor:
                    idx % 2
                      ? isDark
                        ? theme.colors.dark[7]
                        : theme.colors.gray[1]
                      : 'transparent',
                }}
              />
              <Divider size='xs' />
            </Fragment>
          ))}
        </Stack>
        <Divider size='xs' />
        <Space h='md' />
        <Center>
          <Pagination
            size={largeScreen ? 'md' : 'sm'}
            value={parseInt(page, 10)}
            onChange={(p) => navigate(`/event/${eventId}/games/page/${p}`)}
            total={Math.ceil((games?.totalGames ?? 0) / PERPAGE)}
          />
        </Center>
      </Container>
    )
  );
};
