import { GHOST_PLAYER_ID } from '../../../Common/constants';
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
  Skeleton,
  Space,
  Stack,
  Text,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { Suspense, useState } from 'react';
import { Player, SessionHistoryResultTable } from 'tsclients/proto/atoms.pb';
import { PlayersGetPlayerStatsResponse } from 'tsclients/proto/mimir.pb';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useMediaQuery } from '@mantine/hooks';
import { PlayerStatsListing } from '../components/PlayerStatsListing';
import { useI18n } from '../hooks/i18n';
import { IconChevronLeft, IconChevronRight, IconInfoCircle, IconX } from '@tabler/icons-react';
import { useEvent } from '../hooks/useEvent';
import { Meta } from '../components/Meta';
import { useStorage } from '../hooks/storage';
import { calcDimmedBackground, calcDimmedText } from '../helpers/theme';

const HandsGraph = React.lazy(() => import('../components/HandsGraph'));
const YakuGraph = React.lazy(() => import('../components/YakuGraph'));
const RatingGraph = React.lazy(() => import('../components/RatingGraph'));

type PlayerStatsProps = {
  params: {
    eventId: string;
    playerId: string;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
  };
};

const PlayerStatsContent: React.FC<PlayerStatsProps & { events: ReturnType<typeof useEvent> }> = ({
  params: { eventId, playerId, dateFrom, dateTo },
  events,
}) => {
  const api = useApi();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const DataCmp = largeScreen ? Group : Stack;

  const [lastSelectionX, setLastSelectionX] = useState<number | null>(null);
  const [lastSelectionHash, setLastSelectionHash] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<SessionHistoryResultTable | null>(null);

  const [player, , playerLoading] = useIsomorphicState(
    null,
    'PlayerStats_player_' + eventId + playerId,
    () => api.getPlayer(parseInt(playerId, 10)),
    [eventId, playerId]
  );

  const [playerStats, , playerStatsLoading] = useIsomorphicState(
    null,
    `PlayerStats_playerstats_${eventId}_${playerId}_f${dateFrom}_t${dateTo}`,
    () =>
      api.getPlayerStat(
        eventId.split('.').map((e) => parseInt(e, 10)),
        parseInt(playerId, 10),
        dateFrom != null ? decodeURIComponent(dateFrom) : undefined,
        dateTo != null ? decodeURIComponent(dateTo) : undefined
      ),
    [eventId, playerId, dateFrom, dateTo]
  );

  const statsLoading = playerStatsLoading || !playerStats;
  const titleLoading = playerLoading || !player;

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
    <Container data-testid='sigrun-player-stats-page' aria-busy={titleLoading || statsLoading}>
      <PlayerStatsHeader
        player={player}
        loading={titleLoading}
        playerStats={playerStats}
        events={events}
      />
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
      <Suspense fallback={<Skeleton height={400} />}>
        <div data-testid='sigrun-player-stats-rating-graph'>
          {statsLoading ? (
            <Skeleton height={400} data-testid='sigrun-player-stats-rating-skeleton' />
          ) : (
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
        </div>
      </Suspense>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      {selectedGame && (
        <SelectedGamePreview
          eventId={eventId}
          playerId={parseInt(playerId, 10)}
          selectedGame={selectedGame}
          playerStats={playerStats}
          lastSelectionX={statsLoading ? null : lastSelectionX}
          setLastSelectionX={setLastSelectionX}
          setLastSelectionHash={setLastSelectionHash}
          setSelectedGame={setSelectedGame}
          getPlayerUrl={getPlayerUrl}
        />
      )}
      <DataCmp gap={0} grow={largeScreen ? true : undefined}>
        {statsLoading ? (
          <Skeleton height={300} data-testid='sigrun-player-stats-summary-skeleton' />
        ) : (
          <PlayerStatsListing playerStats={playerStats} playerId={playerId} />
        )}
      </DataCmp>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      <Suspense fallback={<Skeleton height={350} />}>
        {statsLoading ? (
          <Skeleton height={350} data-testid='sigrun-player-stats-hands-skeleton' />
        ) : (
          <HandsGraph handValueStat={playerStats.handsValueSummary} />
        )}
      </Suspense>
      <Space h='md' />
      <Divider size='xs' />
      <Space h='md' />
      <Suspense fallback={<Skeleton height={112} />}>
        {statsLoading ? (
          <Skeleton height={112} data-testid='sigrun-player-stats-yaku-skeleton' />
        ) : (
          <YakuGraph yakuStat={playerStats.yakuSummary} />
        )}
      </Suspense>
    </Container>
  );
};

export const PlayerStats: React.FC<PlayerStatsProps> = (props) => {
  const events = useEvent(props.params.eventId);
  return (
    <PlayerStatsContent
      key={`${props.params.eventId}_${props.params.dateFrom}_${props.params.dateTo}`}
      {...props}
      events={events}
    />
  );
};

function SelectedGamePreview({
  eventId,
  playerId,
  selectedGame,
  playerStats,
  lastSelectionX,
  setLastSelectionX,
  setLastSelectionHash,
  setSelectedGame,
  getPlayerUrl,
}: {
  eventId: string;
  playerId?: number;
  selectedGame: SessionHistoryResultTable;
  playerStats?: PlayersGetPlayerStatsResponse;
  lastSelectionX: number | null;
  setLastSelectionX: (value: number | null) => void;
  setLastSelectionHash: (value: string | null) => void;
  setSelectedGame: (value: SessionHistoryResultTable | null) => void;
  getPlayerUrl: (id: number) => string;
}) {
  const winds = ['東', '南', '西', '北'];
  const i18n = useI18n();
  const [, navigate] = useLocation();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const DataCmp = largeScreen ? Group : Stack;
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const isDimmed = useStorage().getDimmed();
  return (
    <>
      <Group justify='space-between'>
        <Anchor
          data-testid='sigrun-player-stats-selected-game-link'
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
            data-testid='sigrun-player-stats-previous-game'
            size='lg'
            color='blue'
            variant='filled'
            title={i18n._t('Previous game')}
            disabled={lastSelectionX === null || lastSelectionX < 2}
            onClick={() => {
              if (lastSelectionX !== null) {
                const newSelection = lastSelectionX - 1;
                const game = playerStats?.scoreHistory?.[newSelection - 1] ?? null;
                setLastSelectionX(newSelection);
                setLastSelectionHash(game?.tables[0]?.sessionHash ?? null);
                setSelectedGame(game);
              }
            }}
          >
            <IconChevronLeft size='1.5rem' />
          </ActionIcon>
          <ActionIcon
            data-testid='sigrun-player-stats-next-game'
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
                const newSelection = lastSelectionX + 1;
                const game = playerStats?.scoreHistory?.[newSelection - 1] ?? null;
                setLastSelectionX(newSelection);
                setLastSelectionHash(game?.tables[0]?.sessionHash ?? null);
                setSelectedGame(game);
              }
            }}
          >
            <IconChevronRight size='1.5rem' />
          </ActionIcon>
          <Space w='xl' />
          <ActionIcon
            data-testid='sigrun-player-stats-close-game-preview'
            size='lg'
            color='red'
            variant='filled'
            title={i18n._t('Close game preview')}
            onClick={() => {
              setLastSelectionX(null);
              setLastSelectionHash(null);
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
        {selectedGame.tables
          .filter((seat) => seat.playerId !== GHOST_PLAYER_ID)
          .map((seat, idx) => (
            <Group grow key={seat.playerId}>
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
                  {seat.playerId === playerId ? (
                    <Text fw={700}>{seat.title}</Text>
                  ) : (
                    <Anchor
                      data-testid={`sigrun-player-stats-preview-player-link-${seat.playerId}`}
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
                    miw='max-content'
                    maw='none'
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
                    miw='max-content'
                    maw='none'
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
  );
}

function PlayerStatsHeader({
  player,
  loading,
  playerStats,
  events,
}: {
  player?: Player;
  loading: boolean;
  playerStats?: PlayersGetPlayerStatsResponse;
  events: ReturnType<typeof useEvent>;
}) {
  const i18n = useI18n();
  const titleLoading = loading || !player;
  return (
    <>
      <Meta
        title={player ? `${player.title} - ${i18n._t('Player stats')} - Sigrun` : undefined}
        description={i18n._t(
          'Player statistics for %1 in the event "%2" provided by Mahjong Pantheon',
          [player?.title ?? '', events?.[0]?.title ?? '']
        )}
      />
      <Group justify='space-between'>
        <h2>
          <Group>
            {titleLoading ? (
              <Group data-testid='sigrun-player-stats-title-skeleton' aria-hidden='true'>
                <Skeleton circle height={38} />
                <Skeleton height={28} width={200} />
              </Group>
            ) : (
              <>
                <PlayerAvatar p={player} />
                {player.title}
              </>
            )}
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
    </>
  );
}
