/*  Sigrun: rating tables and statistics frontend
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
  LoadingOverlay,
  Box,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useI18n } from '../hooks/i18n';
import { EventType, Player } from '../clients/proto/atoms.pb';
import { GameListing } from '../components/GameListing';
import { Fragment } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useEvent } from '../hooks/useEvent';
import { Meta } from '../components/Meta';

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
  const events = useEvent(eventId);
  const [games, , gamesLoading] = useIsomorphicState(
    [],
    'RecentGames_games_' + eventId + '_' + page,
    () =>
      api.getRecentGames(parseInt(eventId, 10), PERPAGE, (parseInt(page ?? '1', 10) - 1) * PERPAGE),
    [eventId, page]
  );

  if (!games || !events) {
    return null;
  }
  const players = games?.players?.reduce(
    (acc, p) => {
      acc[p.id] = p;
      return acc;
    },
    {} as Record<number, Player>
  );

  return (
    events && (
      <Container>
        <Meta
          title={
            events?.length === 1
              ? `${i18n._t('Last games')} - ${events?.[0].title} - Sigrun`
              : (events?.length ?? 0) > 1
                ? `${i18n._t('Last games')} - ${i18n._t('Aggregated event')} - Sigrun`
                : `Sigrun`
          }
          description={i18n._t(
            'Last games of the event "%1", page %2, provided by Mahjong Pantheon',
            [events?.[0].title, page]
          )}
        />
        {events?.map((event, eid) => (
          <h2 style={{ display: 'flex', gap: '20px' }} key={`ev_${eid}`}>
            {events && <EventTypeIcon event={event} />}
            {event?.title} - {i18n._t('Last games')}
          </h2>
        ))}
        <Space h='md' />
        <Divider size='xs' />
        <Space h='md' />
        <Box pos='relative'>
          <LoadingOverlay visible={gamesLoading} overlayBlur={2} />
          <Stack spacing={0}>
            {games?.games?.map((game, idx) => (
              <Fragment key={`gm_${idx}`}>
                <GameListing
                  showShareLink={true}
                  isOnline={events?.[0]?.type === EventType.EVENT_TYPE_ONLINE}
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
        </Box>
        <Divider size='xs' />
        <Space h='md' />
        <Center>
          <Pagination
            size={largeScreen ? 'md' : 'sm'}
            value={parseInt(page, 10)}
            onChange={(p) => {
              navigate(`/event/${eventId}/games/page/${p}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={Math.ceil((games?.totalGames ?? 0) / PERPAGE)}
          />
        </Center>
      </Container>
    )
  );
};
