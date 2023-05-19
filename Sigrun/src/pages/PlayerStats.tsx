import * as React from 'react';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { Redirect, useLocation } from 'wouter';
import {
  Anchor,
  Badge,
  Container,
  Divider,
  Group,
  Space,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { RatingGraph } from '../components/RatingGraph';
import { useState } from 'react';
import { SessionHistoryResultTable } from '../clients/proto/atoms.pb';
import { PlayerIcon } from '../components/PlayerIcon';
import { useMediaQuery } from '@mantine/hooks';
import { PlayerStatsListing } from '../components/PlayerStatsListing';
import { HandsGraph } from '../components/HandsGraph';
import { YakuGraph } from '../components/YakuGraph';

// TODO: aggregated events

export const PlayerStats: React.FC<{ params: { eventId: string; playerId: string } }> = ({
  params: { eventId, playerId },
}) => {
  const winds = ['東', '南', '西', '北'];
  const api = useApi();
  const [, navigate] = useLocation();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const DataCmp = largeScreen ? Group : Stack;
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [selectedGame, setSelectedGame] = useState<SessionHistoryResultTable | null>(null);
  const [events] = useIsomorphicState(
    [],
    'PlayerStats_event_' + eventId,
    () => api.getEventsById([parseInt(eventId, 10)]),
    [eventId]
  );

  const [player] = useIsomorphicState(
    [],
    'PlayerStats_player_' + playerId,
    () => api.getPlayer(parseInt(playerId, 10)),
    [eventId, playerId]
  );

  const [playerStats] = useIsomorphicState(
    [],
    'PlayerStats_playerstats_' + playerId,
    () => api.getPlayerStat([parseInt(eventId, 10)], parseInt(playerId, 10)),
    [eventId, playerId]
  );

  if (!events || !player) {
    return <Redirect to='/' />;
  }
  const [event] = events;

  return (
    <Container>
      <h2>{player.title}</h2>
      <h4 style={{ display: 'flex', gap: '20px' }}>
        {event && <EventTypeIcon size='sm' iconSize={14} event={event} />}
        {event?.title}
      </h4>
      <Divider size='xs' />
      <Space h='md' />
      {!import.meta.env.SSR && (
        <RatingGraph
          playerStats={playerStats}
          onSelectGame={setSelectedGame}
          playerId={parseInt(playerId, 10)}
        />
      )}
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      {selectedGame && (
        <>
          <Stack spacing={0}>
            {selectedGame.tables
              // .sort((a, b) => a.place - b.place)
              .map((seat, idx) => (
                <Group grow key={`pl_${idx}`}>
                  <DataCmp
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
                      <Badge
                        w={50}
                        size='xl'
                        color='blue'
                        radius='sm'
                        style={{ padding: 0, fontSize: '22px' }}
                      >
                        {winds[idx]}
                      </Badge>
                      <PlayerIcon p={{ title: seat.title, id: seat.playerId }} />
                      {seat.playerId === player.id ? (
                        <Text weight='bold'>{seat.title}</Text>
                      ) : (
                        <Anchor
                          href={`/event/${eventId}/player/${seat.playerId}`}
                          onClick={(e) => {
                            navigate(`/event/${eventId}/player/${seat.playerId}`);
                            e.preventDefault();
                          }}
                        >
                          {seat.title}
                        </Anchor>
                      )}
                    </Group>
                    <Group spacing={2} grow={!largeScreen}>
                      <Badge w={65} size='lg' color='cyan' radius='sm' style={{ padding: 0 }}>
                        {seat.score}
                      </Badge>
                      <Badge
                        w={75}
                        size='lg'
                        variant='filled'
                        color={seat.ratingDelta > 0 ? 'lime' : 'red'}
                        radius='sm'
                        style={{ padding: 0 }}
                      >
                        {seat.ratingDelta}
                      </Badge>
                    </Group>
                  </DataCmp>
                </Group>
              ))}
          </Stack>
          <Space h='md' />
          <Divider size='xs' />
          <Space h='md' />
        </>
      )}
      <DataCmp spacing={0} grow={largeScreen ? true : undefined}>
        <PlayerStatsListing playerStats={playerStats} playerId={playerId} />
      </DataCmp>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      {!import.meta.env.SSR && <HandsGraph handValueStat={playerStats?.handsValueSummary} />}
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      {!import.meta.env.SSR && <YakuGraph yakuStat={playerStats?.yakuSummary} />}
    </Container>
  );
};
