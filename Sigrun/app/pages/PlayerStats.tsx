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
  ActionIcon,
  Anchor,
  Badge,
  Container,
  Divider,
  Group,
  Loader,
  Space,
  Stack,
  Text,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { Suspense, useState } from 'react';
import { SessionHistoryResultTable } from 'tsclients/proto/atoms.pb';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useMediaQuery } from '@mantine/hooks';
import { PlayerStatsListing } from '../components/PlayerStatsListing';
import { useI18n } from '../hooks/i18n';
import { IconChevronLeft, IconChevronRight, IconInfoCircle, IconX } from '@tabler/icons-react';
import { useEvent } from '../hooks/useEvent';
import { Meta } from '../components/Meta';
import { useStorage } from 'hooks/storage';
import { calcDimmedBackground, calcDimmedText } from 'helpers/theme';

const HandsGraph = React.lazy(() => import('../components/HandsGraph'));
const YakuGraph = React.lazy(() => import('../components/YakuGraph'));
const RatingGraph = React.lazy(() => import('../components/RatingGraph'));

export const PlayerStats: React.FC<{
  params: {
    eventId: string;
    playerId: string;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
  };
}> = ({ params: { eventId, playerId, dateFrom, dateTo } }) => {
  const winds = ['東', '南', '西', '北'];
  const api = useApi();
  const storage = useStorage();
  const i18n = useI18n();
  const [, navigate] = useLocation();
  const events = useEvent(eventId);
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const DataCmp = largeScreen ? Group : Stack;
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const isDimmed = storage.getDimmed();

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
    `PlayerStats_playerstats_${eventId}_${playerId}_f${dateFrom}_t${dateTo}`,
    () =>
      api.getPlayerStat(
        eventId.split('.').map((e) => parseInt(e, 10)),
        parseInt(playerId, 10),
        dateFrom != null ? decodeURIComponent(dateFrom) : undefined,
        dateTo != null ? decodeURIComponent(dateTo) : undefined
      ),
    [eventId, playerId]
  );

  if (!events || !player || !playerStats) {
    return null;
  }

  function getPlayerUrl(_playerId: number): string {
    let href = `/event/${eventId}/player/${_playerId}`;
    if (dateFrom != null) {
      href += '/from/' + dateFrom;
    }
    if (dateTo != null) {
      href += '/to/' + dateTo;
    }
    return href;
  }

  return (
    <Container>
      <Meta
        title={`${player.title} - ${i18n._t('Player stats')} - Sigrun`}
        description={i18n._t(
          'Player statistics for %1 in the event "%2" provided by Mahjong Pantheon',
          [player.title, events?.[0].title]
        )}
      />
      <Group justify='space-between'>
        <h2>
          <Group>
            <PlayerAvatar p={player} />
            {player.title}
          </Group>
        </h2>
        <Tooltip
          events={{ hover: true, focus: true, touch: true }}
          openDelay={500}
          position='bottom'
          withArrow
          label={i18n._t('Last update: %1', [playerStats?.lastUpdate])}
        >
          <ActionIcon size={24} color='gray' variant='light'>
            <IconInfoCircle />
          </ActionIcon>
        </Tooltip>
      </Group>
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
      <Suspense fallback={<Loader />}>
        <RatingGraph
          lastSelectionHash={lastSelectionHash}
          lastSelectionX={lastSelectionX}
          setLastSelectionHash={setLastSelectionHash}
          setLastSelectionX={setLastSelectionX}
          playerStats={playerStats}
          onSelectGame={setSelectedGame}
          playerId={parseInt(playerId, 10)}
        />
      </Suspense>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      {selectedGame && (
        <>
          <Group justify='space-between'>
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
          <Stack gap={0}>
            {selectedGame.tables.map((seat, idx) => (
              <Group grow key={`pl_${idx}`}>
                <DataCmp
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
                    <Badge
                      w={50}
                      size='xl'
                      color={calcDimmedBackground(isDimmed, isDark, '#e7f5ff')}
                      c={calcDimmedText(isDimmed, isDark)}
                      radius='sm'
                      style={{ padding: 0, fontSize: '22px' }}
                    >
                      {winds[idx]}
                    </Badge>
                    <PlayerAvatar
                      p={{
                        title: seat.title,
                        id: seat.playerId,
                        hasAvatar: seat.hasAvatar,
                        lastUpdate: seat.lastUpdate,
                      }}
                    />
                    {seat.playerId === player.id ? (
                      <Text fw={700}>{seat.title}</Text>
                    ) : (
                      <Anchor
                        href={getPlayerUrl(seat.playerId)}
                        onClick={(e) => {
                          navigate(getPlayerUrl(seat.playerId));
                          e.preventDefault();
                        }}
                      >
                        {seat.title}
                      </Anchor>
                    )}
                  </Group>
                  <Group gap={2} grow={!largeScreen}>
                    <Badge
                      w={65}
                      size='lg'
                      color={calcDimmedBackground(isDimmed, isDark)}
                      c={calcDimmedText(isDimmed, isDark)}
                      radius='sm'
                      style={{ padding: 0 }}
                    >
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
      <DataCmp gap={0} grow={largeScreen ? true : undefined}>
        <PlayerStatsListing playerStats={playerStats} playerId={playerId} />
      </DataCmp>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      <Suspense fallback={<Loader />}>
        <HandsGraph handValueStat={playerStats?.handsValueSummary} />
      </Suspense>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      <Suspense fallback={<Loader />}>
        <YakuGraph yakuStat={playerStats?.yakuSummary} />
      </Suspense>
    </Container>
  );
};
