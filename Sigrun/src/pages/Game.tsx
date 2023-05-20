import * as React from 'react';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { Redirect } from 'wouter';
import { Container, Divider, Group, Space } from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useI18n } from '../hooks/i18n';
import { EventType, Player } from '../clients/proto/atoms.pb';
import { GameListing } from '../components/GameListing';
import { EventTopNavigation } from '../components/EventTopNavigation';

export const Game: React.FC<{
  params: {
    eventId: string;
    sessionHash: string;
  };
}> = ({ params: { eventId, sessionHash } }) => {
  const api = useApi();
  const i18n = useI18n();
  const [events] = useIsomorphicState(
    [],
    'EventInfo_event_' + eventId,
    () => api.getEventsById([parseInt(eventId, 10)]),
    [eventId]
  );
  const [game] = useIsomorphicState(
    null,
    'RecentGames_games_' + eventId,
    () => api.getGame(sessionHash),
    [eventId, sessionHash]
  );

  if (game === undefined || !events) {
    return <Redirect to='/' />;
  }
  const [event] = events;
  const players = game?.players?.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<number, Player>);

  // TODO: fix universal navigation markup for small/large screens

  return (
    game?.game &&
    event && (
      <Container>
        <Group position='apart' grow>
          <h2 style={{ display: 'flex', flexGrow: 1, gap: '20px', maxWidth: 'calc(100% - 200px)' }}>
            {event && <EventTypeIcon event={event} />}
            {event?.title} - {i18n._t('View game')}
          </h2>
          <EventTopNavigation eventId={eventId} />
        </Group>
        <Space h='md' />
        <Divider size='xs' />
        <Space h='md' />
        <GameListing
          showShareLink={false}
          isOnline={event.type === EventType.EVENT_TYPE_ONLINE}
          eventId={eventId}
          game={game.game}
          players={players}
          rowStyle={{
            padding: '16px',
          }}
        />
      </Container>
    )
  );
};
