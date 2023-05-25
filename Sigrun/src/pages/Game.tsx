import * as React from 'react';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { Container, Divider, Space } from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useI18n } from '../hooks/i18n';
import { EventType, Player } from '../clients/proto/atoms.pb';
import { GameListing } from '../components/GameListing';
import { useEvent } from '../hooks/useEvent';
import { Helmet } from 'react-helmet';

export const Game: React.FC<{
  params: {
    eventId: string;
    sessionHash: string;
  };
}> = ({ params: { eventId, sessionHash } }) => {
  const api = useApi();
  const i18n = useI18n();
  const events = useEvent(eventId);
  // Note: session is not checked against particular event;
  // Player can request any eventId but with proper hash the session will be retrieved correctly
  const [game] = useIsomorphicState(
    null,
    'RecentGames_games_' + eventId,
    () => api.getGame(sessionHash),
    [eventId, sessionHash]
  );

  if (game === undefined || !events) {
    return null;
  }
  const players = game?.players?.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<number, Player>);

  // TODO: finish helmet titles

  return (
    game?.game &&
    events && (
      <Container>
        <Helmet>
          <title>{i18n._t('Game preview')} - Sigrun</title>
        </Helmet>
        <h2 style={{ display: 'flex', gap: '20px' }}>
          {events?.[0] && <EventTypeIcon event={events[0]} />}
          {events?.[0]?.title} - {i18n._t('View game')}
        </h2>
        <Space h='md' />
        <Divider size='xs' />
        <Space h='md' />
        <GameListing
          showShareLink={false}
          isOnline={events?.[0]?.type === EventType.EVENT_TYPE_ONLINE}
          eventId={events?.[0]?.id.toString()}
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
