import * as React from 'react';
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Container,
  Divider,
  Group,
  MantineColor,
  Space,
  Stack,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useEvent } from '../hooks/useEvent';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { PlayerIcon } from '../components/PlayerIcon';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';

export const SeriesRating: React.FC<{ params: { eventId: string } }> = ({
  params: { eventId },
}) => {
  const api = useApi();
  const [, navigate] = useLocation();
  const i18n = useI18n();
  const events = useEvent(eventId);
  const [seriesData] = useIsomorphicState(
    null,
    'SeriesRating_games_' + eventId,
    () => (events ? api.getGameSeries(parseInt(eventId, 10)) : Promise.resolve(null)),
    [eventId, events]
  );
  if (!events) {
    return null;
  }

  if (events?.length > 1) {
    return (
      <Container>
        <Alert color='red'>{i18n._t('Series rating is not available for aggregated events')}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Helmet>
        <title>
          {i18n._t('Series rating')} - {events[0]?.title} - Sigrun
        </title>
      </Helmet>
      <h2 style={{ display: 'flex', gap: '20px' }}>
        {events[0] && <EventTypeIcon event={events[0]} />}
        {events[0]?.title} - {i18n._t('Series rating')}
      </h2>
      <Divider size='xs' />
      <Space h='md' />
      {seriesData &&
        seriesData.map((item, idx) => (
          <Group style={{ flex: 1 }} key={`series_${idx}`}>
            <Badge w={50} size='xl' color='blue' radius='sm' style={{ padding: 0 }}>
              {idx + 1}
            </Badge>
            <PlayerIcon p={item.player} />
            <Group spacing={2}>
              <Anchor
                href={`/event/${events[0].id}/player/${item.player.id}`}
                onClick={(e) => {
                  navigate(`/event/${events[0].id}/player/${item.player.id}`);
                  e.preventDefault();
                }}
              >
                {item.player.title}
              </Anchor>
            </Group>
            <Stack spacing='xs' w='100%'>
              <Stack spacing={0}>
                <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Badge color='blue' size='sm' radius={0}>
                    {i18n._t('Best series')}
                  </Badge>
                  <Badge color='green' size='sm' radius={0}>
                    {i18n._t('Avg place:')} {item.bestSeriesAvgPlace} ({item.bestSeriesPlaces} /{' '}
                    {Math.round(item.bestSeriesPlaces / parseFloat(item.bestSeriesAvgPlace))})
                  </Badge>
                  <Badge color='grape' size='sm' radius={0}>
                    {i18n._t('Score:')} {item.bestSeriesScores}
                  </Badge>
                </Box>
                <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {item.bestSeries.map((bs, bsidx) => (
                    <Anchor
                      style={{ textDecoration: 'none', display: 'flex' }}
                      key={`bs_${bsidx}`}
                      href={`/event/${eventId}/game/${bs.sessionHash}`}
                      onClick={(e) => {
                        navigate(`/event/${eventId}/game/${bs.sessionHash}`);
                        e.preventDefault();
                      }}
                    >
                      <Badge size='sm' variant='filled' radius={0} color={getColor(bs.place)}>
                        {bs.place}
                      </Badge>
                    </Anchor>
                  ))}
                </Box>
              </Stack>
              <Stack spacing={0}>
                <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Badge color='blue' size='sm' radius={0}>
                    {i18n._t('Last series')}
                  </Badge>
                  <Badge color='green' size='sm' radius={0}>
                    {i18n._t('Avg place:')} {item.currentSeriesAvgPlace} ({item.currentSeriesPlaces}{' '}
                    /{' '}
                    {Math.round(item.currentSeriesPlaces / parseFloat(item.currentSeriesAvgPlace))})
                  </Badge>
                  <Badge color='grape' size='sm' radius={0}>
                    {i18n._t('Score:')} {item.currentSeriesScores}
                  </Badge>
                </Box>
                <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {item.currentSeries.map((ls, lsidx) => (
                    <Anchor
                      style={{ textDecoration: 'none', display: 'flex' }}
                      key={`bs_${lsidx}`}
                      href={`/event/${eventId}/game/${ls.sessionHash}`}
                      onClick={(e) => {
                        navigate(`/event/${eventId}/game/${ls.sessionHash}`);
                        e.preventDefault();
                      }}
                    >
                      <Badge size='sm' variant='filled' radius={0} color={getColor(ls.place)}>
                        {ls.place}
                      </Badge>
                    </Anchor>
                  ))}
                </Box>
              </Stack>
              <Space h='lg' />
            </Stack>
          </Group>
        ))}
    </Container>
  );
};

function getColor(place: number): MantineColor {
  switch (place) {
    case 1:
      return 'green';
    case 2:
      return 'yellow';
    case 3:
      return 'orange';
    case 4:
      return 'red';
    default:
      return 'dark';
  }
}
