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
  Divider,
  Group,
  Text,
  Space,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
  Badge,
  Button,
  Alert,
  Loader,
  Center,
  LoadingOverlay,
  Box,
  Tooltip,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { EventType, PlayerInRating } from 'tsclients/proto/atoms.pb';
import { useMediaQuery } from '@mantine/hooks';
import { useI18n } from '../hooks/i18n';
import { useEvent } from '../hooks/useEvent';
import {
  IconCoins,
  IconDownload,
  IconExclamationCircle,
  IconSortAscending2,
  IconSortDescending2,
} from '@tabler/icons-react';
import { I18nService } from '../services/i18n';
import { useContext } from 'react';
import { globalsCtx } from '../hooks/globals';
import { TeamTable } from '../components/TeamTable';
import { Meta } from '../components/Meta';
import { authCtx } from '../hooks/auth';
import { useStorage } from 'hooks/storage';
import { calcDimmedBackground, calcDimmedText } from 'helpers/theme';

export const RatingTable: React.FC<{
  params: {
    eventId: string;
    orderBy?: 'name' | 'rating' | 'games_and_rating' | 'avg_place' | 'avg_score' | 'team' | 'chips';
    minGamesSelector?: 'all' | 'min';
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
  };
}> = ({ params: { eventId, orderBy, minGamesSelector, dateFrom, dateTo } }) => {
  orderBy = orderBy ?? 'rating';
  minGamesSelector = minGamesSelector ?? 'all';
  const order = {
    name: 'asc',
    rating: 'desc',
    games_and_rating: 'desc',
    avg_place: 'asc',
    avg_score: 'desc',
    team: 'desc',
    chips: 'desc',
  }[orderBy] as 'asc' | 'desc';
  const api = useApi();
  const storage = useStorage();
  const i18n = useI18n();
  const events = useEvent(eventId);
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const [, navigate] = useLocation();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const isDimmed = storage.getDimmed();
  const DataCmp = largeScreen ? Group : Stack;
  const auth = useContext(authCtx);
  const globals = useContext(globalsCtx);
  const eventIds = eventId.split('.').map((x) => parseInt(x));
  const [players, , playersLoading] = useIsomorphicState(
    [],
    `RatingTable_event_${eventId}_${order}_${orderBy}_${minGamesSelector}_f${dateFrom}_t${dateTo}`,
    () => {
      if (eventIds.length === 1) {
        api.setEventId(eventIds[0]);
      }
      return api.getRatingTable(
        eventIds,
        order ?? 'desc',
        orderBy === 'team' ? 'rating' : (orderBy ?? 'rating'),
        minGamesSelector === 'min',
        dateFrom != null ? decodeURIComponent(dateFrom) : undefined,
        dateTo != null ? decodeURIComponent(dateTo) : undefined
      );
    },
    [eventId, order, orderBy, minGamesSelector, dateFrom, dateTo]
  );

  if (!players || !events) {
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

  if (
    events &&
    !globals.data.loading &&
    globals.data.ratingHidden &&
    !auth.ownEvents.includes(events?.[0].id) &&
    !auth.isSuperadmin
  ) {
    return (
      <Container>
        <h2 style={{ display: 'flex', gap: '20px' }}>
          {events?.[0] && <EventTypeIcon event={events?.[0]} />}
          {events?.[0]?.title} - {i18n._t('Rating table')}
        </h2>
        <Alert icon={<IconExclamationCircle />} color='yellow'>
          {i18n._t('Rating table is hidden by tournament administrator')}
        </Alert>
      </Container>
    );
  }

  function getUrl(
    _orderBy: 'name' | 'rating' | 'games_and_rating' | 'avg_place' | 'avg_score' | 'team' | 'chips',
    _minGamesSelector: 'all' | 'min'
  ): string {
    let href = `/event/${eventId}/order/${_orderBy}`;
    if (_minGamesSelector === 'min') {
      href += '/filter/min';
    }
    if (dateFrom != null) {
      href += '/from/' + dateFrom;
    }
    if (dateTo != null) {
      href += '/to/' + dateTo;
    }
    return href;
  }

  return (
    events && (
      <Container>
        <Meta
          title={
            events?.length === 1
              ? `${i18n._t('Rating table')} - ${events?.[0].title} - Sigrun`
              : (events?.length ?? 0) > 1
                ? `${i18n._t('Rating table')} - ${i18n._t('Aggregated event')} - Sigrun`
                : `Sigrun`
          }
          description={i18n._t('Rating table of the event "%1" provided by Mahjong Pantheon', [
            events?.[0].title,
          ])}
        />
        {events?.map((event, eid) => (
          <DataCmp justify='space-between' key={`ev_${eid}`}>
            <h2 style={{ display: 'flex', gap: '20px' }}>
              {event && <EventTypeIcon event={event} />}
              {event?.title} - {i18n._t('Rating table')}
            </h2>
            {orderBy !== 'team' && events.length === 1 && (
              <Button
                variant='light'
                size='xs'
                leftSection={<IconDownload size='1.1rem' />}
                onClick={() => {
                  downloadCsv(
                    i18n,
                    events?.[0]?.isTeam,
                    events?.[0]?.withChips,
                    players,
                    `Rating_${events?.[0]?.id}.csv`
                  );
                }}
              >
                {i18n._t('Save as CSV')}
              </Button>
            )}
          </DataCmp>
        ))}
        <Space h='md' />
        <Divider size='xs' />
        <Space h='md' />
        <DataCmp grow={largeScreen ? true : undefined}>
          <Stack>
            <DataCmp justify='flex-end' gap='md'>
              <Group gap='md' grow={!largeScreen}>
                {globals.data.isTeam && (
                  <Badge
                    size='lg'
                    color='grape'
                    radius='sm'
                    variant={orderBy === 'team' ? 'filled' : 'light'}
                    component={'a'}
                    pl={5}
                    pr={5}
                    leftSection={
                      <Box mt={7}>
                        <IconSortDescending2 size='1rem' />
                      </Box>
                    }
                    href={getUrl('team', 'all')}
                    onClick={(e) => {
                      navigate(getUrl('team', 'all'));
                      e.preventDefault();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {i18n._t('Team')}
                  </Badge>
                )}
                <Badge
                  size='lg'
                  color='lime'
                  radius='sm'
                  variant={orderBy === 'rating' ? 'filled' : 'light'}
                  component={'a'}
                  pl={5}
                  pr={5}
                  leftSection={
                    <Box mt={7}>
                      <IconSortDescending2 size='1rem' />
                    </Box>
                  }
                  href={getUrl('rating', minGamesSelector)}
                  onClick={(e) => {
                    navigate(getUrl('rating', minGamesSelector));
                    e.preventDefault();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {i18n._t('Rating')}
                </Badge>
                <Badge
                  size='lg'
                  color='purple'
                  radius='sm'
                  variant={orderBy === 'games_and_rating' ? 'filled' : 'light'}
                  component={'a'}
                  pl={5}
                  pr={5}
                  leftSection={
                    <Box mt={7}>
                      <IconSortDescending2 size='1rem' />
                    </Box>
                  }
                  href={getUrl('games_and_rating', minGamesSelector)}
                  onClick={(e) => {
                    navigate(getUrl('games_and_rating', minGamesSelector));
                    e.preventDefault();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {i18n._t('Games+Rating')}
                </Badge>
                {events?.[0]?.withChips && (
                  <Badge
                    size='lg'
                    color='orange'
                    radius='sm'
                    variant={orderBy === 'chips' ? 'filled' : 'light'}
                    component={'a'}
                    pl={5}
                    pr={5}
                    leftSection={
                      <Box mt={7}>
                        <IconSortDescending2 size='1rem' />
                      </Box>
                    }
                    href={getUrl('chips', minGamesSelector)}
                    onClick={(e) => {
                      navigate(getUrl('chips', minGamesSelector));
                      e.preventDefault();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {i18n._t('Chips')}
                  </Badge>
                )}
              </Group>
              <Group gap='md' grow={!largeScreen}>
                <Badge
                  size='lg'
                  color='green'
                  radius='sm'
                  variant={orderBy === 'avg_score' ? 'filled' : 'light'}
                  component={'a'}
                  pl={5}
                  pr={5}
                  leftSection={
                    <Box mt={7}>
                      <IconSortDescending2 size='1rem' />
                    </Box>
                  }
                  href={getUrl('avg_score', minGamesSelector)}
                  onClick={(e) => {
                    navigate(getUrl('avg_score', minGamesSelector));
                    e.preventDefault();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {i18n._t('Average score')}
                </Badge>
                <Badge
                  size='lg'
                  radius='sm'
                  color={calcDimmedBackground(isDimmed, isDark)}
                  c={calcDimmedText(isDimmed, isDark)}
                  variant={orderBy === 'avg_place' ? 'filled' : 'light'}
                  component={'a'}
                  pl={5}
                  pr={5}
                  leftSection={
                    <Box mt={7}>
                      <IconSortAscending2 size='1rem' />
                    </Box>
                  }
                  href={getUrl('avg_place', minGamesSelector)}
                  onClick={(e) => {
                    navigate(getUrl('avg_place', minGamesSelector));
                    e.preventDefault();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {i18n._t('Average place')}
                </Badge>
              </Group>
            </DataCmp>
          </Stack>
        </DataCmp>
        {globals.data.minGamesCount > 0 && orderBy !== 'team' && (
          <>
            <Space h='md' />
            <Divider size='xs' />
            <Space h='md' />
            <DataCmp grow={largeScreen ? true : undefined}>
              <Stack>
                <DataCmp justify='flex-end' gap='md'>
                  <Group gap='md' grow={!largeScreen}>
                    <Badge
                      size='lg'
                      color='lime'
                      radius='sm'
                      variant={minGamesSelector === 'all' ? 'filled' : 'light'}
                      component={'a'}
                      pl={5}
                      pr={5}
                      href={getUrl(orderBy, 'all')}
                      onClick={(e) => {
                        navigate(getUrl(orderBy, 'all'));
                        e.preventDefault();
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {i18n._t('All players')}
                    </Badge>
                    <Badge
                      size='lg'
                      color='orange'
                      radius='sm'
                      variant={minGamesSelector === 'min' ? 'filled' : 'light'}
                      component={'a'}
                      pl={5}
                      pr={5}
                      title={i18n._t('Players having a required minimum of games')}
                      href={getUrl(orderBy, 'min')}
                      onClick={(e) => {
                        navigate(getUrl(orderBy, 'min'));
                        e.preventDefault();
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {i18n._t('With min games')}
                    </Badge>
                  </Group>
                </DataCmp>
              </Stack>
            </DataCmp>
          </>
        )}
        <Space h='md' />
        <Divider size='xs' />
        <Space h='md' />
        <Box pos='relative'>
          <LoadingOverlay visible={playersLoading} overlayProps={{ blur: 2 }} />
          {orderBy === 'team' && (
            <Stack justify='flex-start' gap='0'>
              <TeamTable players={players} events={events} />
            </Stack>
          )}
          {orderBy !== 'team' && (
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
                      <Badge
                        w={50}
                        size='xl'
                        color={calcDimmedBackground(isDimmed, isDark, '#e7f5ff')}
                        c={calcDimmedText(isDimmed, isDark)}
                        radius='sm'
                        style={{ padding: 0 }}
                      >
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
                        {events?.[0]?.type === EventType.EVENT_TYPE_ONLINE && (
                          <Text c='dimmed'>{player.tenhouId}</Text>
                        )}
                        {events?.[0]?.isTeam && player.teamName && <Text>{player.teamName}</Text>}
                      </Stack>
                      {player.penaltiesCount > 0 && (
                        <Tooltip
                          events={{ hover: true, touch: true, focus: true }}
                          openDelay={200}
                          position='bottom'
                          withArrow
                          label={i18n._t('Penalties count: %1; total penalties amount: %2', [
                            player.penaltiesCount,
                            player.penaltiesAmount,
                          ])}
                        >
                          <IconExclamationCircle
                            color={isDark ? theme.colors.dark[4] : theme.colors.gray[4]}
                          />
                        </Tooltip>
                      )}
                    </Group>
                    <Group gap={2} grow={!largeScreen}>
                      <Badge
                        w={75}
                        size='lg'
                        variant={
                          orderBy === 'rating' || orderBy === 'games_and_rating'
                            ? 'filled'
                            : 'light'
                        }
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
                        color={calcDimmedBackground(isDimmed, isDark)}
                        c={calcDimmedText(isDimmed, isDark)}
                        variant={orderBy === 'avg_place' ? 'filled' : 'light'}
                        radius='sm'
                        style={{ padding: 0 }}
                      >
                        {player.avgPlace.toFixed(2)}
                      </Badge>
                      <Badge
                        title={i18n._t('Games played')}
                        w={45}
                        size='lg'
                        color={
                          orderBy == 'games_and_rating'
                            ? 'purple'
                            : calcDimmedBackground(isDimmed, isDark, '#f8f9fa')
                        }
                        c={
                          orderBy == 'games_and_rating'
                            ? 'white'
                            : calcDimmedText(isDimmed, isDark, '#868e96')
                        }
                        radius='sm'
                        style={{ padding: 0 }}
                      >
                        {player.gamesPlayed.toFixed(0)}
                      </Badge>
                      {events?.[0]?.withChips && (
                        <Badge
                          title={i18n._t('Chips')}
                          w={45}
                          leftSection={<IconCoins size='0.8rem' style={{ marginTop: '8px' }} />}
                          size='lg'
                          color='yellow'
                          radius='sm'
                          style={{ padding: 0 }}
                        >
                          {player.chips.toFixed(0)}
                        </Badge>
                      )}
                    </Group>
                  </DataCmp>
                );
              })}
            </Stack>
          )}
        </Box>
      </Container>
    )
  );
};

function downloadCsv(
  i18n: I18nService,
  isTeam: boolean,
  withChips: boolean,
  content: PlayerInRating[],
  fileName: string,
  mimeType?: string
) {
  const quoteValue = (val: any) => {
    const innerValue: string = val === null ? '' : val.toString();
    let result = innerValue.replace(/"/g, '""');
    if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
    return result;
  };

  const finalVal: string[] = [
    [
      i18n._t('Place'),
      i18n._t('Player ID'),
      i18n._t('Player name'),
      ...(isTeam ? [i18n._t('Team')] : []),
      ...(withChips ? [i18n._t('Chips')] : []),
      i18n._t('Rating points'),
      i18n._t('Average place'),
      i18n._t('Average points'),
      i18n._t('Games played'),
    ]
      .map(quoteValue)
      .join(','),
  ];

  for (let i = 0; i < content.length; i++) {
    finalVal.push(
      [
        i + 1,
        content[i].id,
        content[i].title,
        ...(isTeam ? [content[i].teamName] : []),
        ...(withChips ? [content[i].chips] : []),
        content[i].rating,
        content[i].avgPlace,
        content[i].avgScore,
        content[i].gamesPlayed,
      ]
        .map(quoteValue)
        .join(',')
    );
  }

  const a = document.createElement('a');
  mimeType = mimeType ?? 'application/octet-stream';

  if (URL && 'download' in a) {
    // html5 A[download]
    a.href = URL.createObjectURL(
      new Blob([finalVal.join('\n')], {
        type: mimeType,
      })
    );
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    // only this mime type is supported
    location.href = 'data:application/octet-stream,' + encodeURIComponent(finalVal.join('\n'));
  }
}
