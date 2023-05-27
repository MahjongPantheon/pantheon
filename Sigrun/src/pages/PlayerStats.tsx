import * as React from 'react';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useLocation } from 'wouter';
import {
  ActionIcon,
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
import { useI18n } from '../hooks/i18n';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import { useEvent } from '../hooks/useEvent';
import { Helmet } from 'react-helmet';

export const PlayerStats: React.FC<{ params: { eventId: string; playerId: string } }> = ({
  params: { eventId, playerId },
}) => {
  const winds = ['東', '南', '西', '北'];
  const api = useApi();
  const i18n = useI18n();
  const [, navigate] = useLocation();
  const events = useEvent(eventId);
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const DataCmp = largeScreen ? Group : Stack;
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const [lastSelectionX, setLastSelectionX] = useState<number | null>(null);
  const [lastSelectionHash, setLastSelectionHash] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<SessionHistoryResultTable | null>(null);

  const [player] = useIsomorphicState(
    [],
    'PlayerStats_player_' + eventId + playerId,
    () => api.getPlayer(parseInt(playerId, 10)),
    [eventId, playerId]
  );

  const [playerStats] = useIsomorphicState(
    [],
    'PlayerStats_playerstats_' + eventId + playerId,
    () => api.getPlayerStat(events?.map((e) => e.id) ?? [], parseInt(playerId, 10)),
    [events, playerId]
  );

  if (!events || !player) {
    return null;
  }

  return (
    <Container>
      <Helmet>
        <title>
          {player.title} - {i18n._t('Player stats')} - Sigrun
        </title>
      </Helmet>
      <h2>{player.title}</h2>
      {events?.map((event, eid) => {
        return (
          <Group key={`ev_${eid}`}>
            <h4 style={{ display: 'flex', gap: '20px' }}>
              {event && <EventTypeIcon size='sm' iconSize={14} event={event} />}
              {event?.title}
            </h4>
          </Group>
        );
      })}
      <Divider size='xs' />
      <Space h='md' />
      {!import.meta.env.SSR && (
        <RatingGraph
          lastSelectionHash={lastSelectionHash}
          lastSelectionX={lastSelectionX}
          setLastSelectionHash={setLastSelectionHash}
          setLastSelectionX={setLastSelectionX}
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
          <Group position='apart'>
            <Anchor
              href={`/event/${eventId}/game/${selectedGame.tables[0].sessionHash}`}
              onClick={(e) => {
                navigate(`/event/${eventId}/game/${selectedGame.tables[0].sessionHash}`);
                e.preventDefault();
              }}
            >
              {i18n._t('View selected game details')}
            </Anchor>
            <Group>
              <ActionIcon
                size='lg'
                color='blue'
                variant='filled'
                title={i18n._t('Previous game')}
                disabled={lastSelectionX === null || lastSelectionX < 2}
                onClick={() => {
                  if (lastSelectionX !== null) {
                    setLastSelectionX((x) => {
                      const newSelection = x ? x - 1 : 1;
                      setSelectedGame(playerStats?.scoreHistory?.[newSelection - 1] ?? null);
                      return newSelection;
                    });
                  }
                }}
              >
                <IconChevronLeft size='1.5rem' />
              </ActionIcon>
              <ActionIcon
                size='lg'
                color='blue'
                variant='filled'
                title={i18n._t('Next game')}
                disabled={
                  lastSelectionX === null ||
                  (playerStats?.scoreHistory && lastSelectionX >= playerStats?.scoreHistory?.length)
                }
                onClick={() => {
                  if (lastSelectionX !== null) {
                    setLastSelectionX((x) => {
                      const newSelection = x ? x + 1 : 1;
                      setSelectedGame(playerStats?.scoreHistory?.[newSelection - 1] ?? null);
                      return newSelection;
                    });
                  }
                }}
              >
                <IconChevronRight size='1.5rem' />
              </ActionIcon>
              <Space w='xl' />
              <ActionIcon
                size='lg'
                color='red'
                variant='filled'
                title={i18n._t('Close game preview')}
                onClick={() => {
                  setLastSelectionX(null);
                  setSelectedGame(null);
                }}
              >
                <IconX size='1.5rem' />
              </ActionIcon>
            </Group>
          </Group>
          <Space h='md' />
          <Divider size='xs' />
          <Space h='md' />
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
