import * as React from 'react';
import {
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

export const SeriesRating: React.FC<{ params: { eventId: string } }> = ({
  params: { eventId },
}) => {
  const api = useApi();
  const [, navigate] = useLocation();
  const i18n = useI18n();
  const event = useEvent(eventId);
  const [seriesData] = useIsomorphicState(
    null,
    'SeriesRating_games_' + eventId,
    () => (event ? api.getGameSeries(parseInt(eventId, 10)) : Promise.resolve(null)),
    [eventId, event]
  );
  if (!event) {
    return null;
  }

  return (
    <Container>
      <h2 style={{ display: 'flex', gap: '20px' }}>
        {event && <EventTypeIcon event={event} />}
        {event?.title} - {i18n._t('Series rating')}
      </h2>
      <Divider size='xs' />
      <Space h='md' />
      {seriesData &&
        seriesData.results.map((item, idx) => (
          <>
            <Group style={{ flex: 1 }}>
              <Badge w={50} size='xl' color='blue' radius='sm' style={{ padding: 0 }}>
                {idx + 1}
              </Badge>
              <PlayerIcon p={item.player} />
              <Stack spacing={2}>
                <Anchor
                  href={`/event/${event.id}/player/${item.player.id}`}
                  onClick={(e) => {
                    navigate(`/event/${event.id}/player/${item.player.id}`);
                    e.preventDefault();
                  }}
                >
                  {item.player.title}
                </Anchor>
              </Stack>
              <Stack spacing='xs'>
                <Box>
                  <Badge color='blue' size='xs' radius={0}>
                    {i18n._t('Best series:')}
                  </Badge>
                  {item.bestSeries.map((bs, bsidx) => (
                    <Anchor
                      style={{ textDecoration: 'none' }}
                      key={`bs_${bsidx}`}
                      href={`/event/${eventId}/game/${bs.sessionHash}`}
                      onClick={(e) => {
                        navigate(`/event/${eventId}/game/${bs.sessionHash}`);
                        e.preventDefault();
                      }}
                    >
                      <Badge size='xs' variant='filled' radius={0} color={getColor(bs.place)}>
                        {bs.place}
                      </Badge>
                    </Anchor>
                  ))}
                </Box>
                <Box>
                  <Badge color='blue' size='xs' radius={0}>
                    {i18n._t('Last series:')}
                  </Badge>
                  {item.currentSeries.map((ls, lsidx) => (
                    <Anchor
                      style={{ textDecoration: 'none' }}
                      key={`bs_${lsidx}`}
                      href={`/event/${eventId}/game/${ls.sessionHash}`}
                      onClick={(e) => {
                        navigate(`/event/${eventId}/game/${ls.sessionHash}`);
                        e.preventDefault();
                      }}
                    >
                      <Badge size='xs' variant='filled' radius={0} color={getColor(ls.place)}>
                        {ls.place}
                      </Badge>
                    </Anchor>
                  ))}
                </Box>
                <Space h='lg' />
              </Stack>
            </Group>
          </>
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
