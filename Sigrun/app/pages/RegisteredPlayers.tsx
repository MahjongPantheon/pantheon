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
  Anchor,
  Container,
  Group,
  Text,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
  Badge,
  Loader,
  Center,
  LoadingOverlay,
  Box,
} from '@mantine/core';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { EventType } from '../clients/proto/atoms.pb';
import { useMediaQuery } from '@mantine/hooks';
import { useI18n } from '../hooks/i18n';
import { useEvent } from '../hooks/useEvent';
import { useContext } from 'react';
import { globalsCtx } from '../hooks/globals';
import { Meta } from '../components/Meta';
import { EventTypeIcon } from '../components/EventTypeIcon';

export const RegisteredPlayers: React.FC<{
  params: {
    eventId: string;
  };
}> = ({ params: { eventId } }) => {
  const api = useApi();
  const i18n = useI18n();
  const [event] = useEvent(eventId) ?? [undefined];
  const id = event?.id;
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const DataCmp = largeScreen ? Group : Stack;
  const globals = useContext(globalsCtx);
  const [players, , playersLoading] = useIsomorphicState(
    [],
    'RegisteredPlayers_event_' + id,
    () =>
      id
        ? api
            .getAllPlayers(id)
            .then((list) => list.toSorted((a, b) => a.title.localeCompare(b.title)))
        : Promise.resolve([]),
    [id]
  );

  if (!players || !event) {
    return null;
  }

  if (globals.data.loading) {
    return (
      <Container h='100%'>
        <Center h='100%'>
          <Loader size='xl' />
        </Center>
      </Container>
    );
  }

  return (
    <Container>
      <Meta
        title={`${i18n._t('Registered players')} - ${event.title} - Sigrun`}
        description={i18n._t('Registered players of the event "%1" provided by Mahjong Pantheon', [
          event.title,
        ])}
      />
      <h2 style={{ display: 'flex', gap: '20px' }}>
        {event && <EventTypeIcon event={event} />}
        {event?.title} - {i18n._t('Registered players')}
      </h2>
      <Box pos='relative'>
        <LoadingOverlay visible={playersLoading} overlayProps={{ blur: 2 }} />
        <Stack justify='flex-start' gap='0'>
          {(players ?? []).map((player, idx) => {
            return (
              <DataCmp
                key={`pl_${idx}`}
                gap='xs'
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
                  <PlayerAvatar p={player} />
                  <Stack gap={2}>
                    <Anchor
                      href={`/event/${eventId}/player/${player.id}`}
                      onClick={(e) => {
                        navigate(`/event/${eventId}/player/${player.id}`);
                        e.preventDefault();
                      }}
                    >
                      {player.title}
                    </Anchor>
                    {event.type === EventType.EVENT_TYPE_ONLINE && (
                      <Text c='dimmed'>{player.tenhouId}</Text>
                    )}
                    {event.isTeam && player.teamName && <Text>{player.teamName}</Text>}
                  </Stack>
                </Group>
              </DataCmp>
            );
          })}
        </Stack>
      </Box>
    </Container>
  );
};
