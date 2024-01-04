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
import { Container, Divider, Space } from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useI18n } from '../hooks/i18n';
import { EventType, Player } from '../clients/proto/atoms.pb';
import { GameListing } from '../components/GameListing';
import { useEvent } from '../hooks/useEvent';
import { Meta } from '../components/Meta';

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
    'Game_game_' + eventId + sessionHash,
    () => api.getGame(sessionHash),
    [eventId, sessionHash]
  );

  if (game === undefined || !events) {
    return null;
  }
  const players = game?.players?.reduce(
    (acc, p) => {
      acc[p.id] = p;
      return acc;
    },
    {} as Record<number, Player>
  );

  return (
    game?.game &&
    events && (
      <Container>
        <Meta
          title={`${events?.[0].title} - ${i18n._t('Game preview')} - Sigrun`}
          description={i18n._t(
            'Single game preview for the event "%1" provided by Mahjong Pantheon',
            [events?.[0].title]
          )}
        />
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
