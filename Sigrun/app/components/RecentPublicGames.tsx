import * as React from 'react';
import { Anchor, Divider, Space, Stack } from '@mantine/core';
import { EventType, PersonEx } from 'tsclients/proto/atoms.pb';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { useStorage } from '../hooks/storage';
import { GameListing } from './GameListing';

export const RecentPublicGames: React.FC = () => {
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const [recent] = useIsomorphicState(
    { games: [] },
    'RecentPublicGames',
    () => api.getRecentPublicGames(),
    []
  );

  if (!recent?.games.length) {
    return null;
  }

  return (
    <section data-testid='sigrun-public-recent-games'>
      <Space h='xl' />
      <h2>{i18n._t('Last games')}</h2>
      <Divider size='xs' />
      <Stack gap='md'>
        {recent.games.map(({ event, game }) => (
          <div key={game.sessionHash}>
            <Space h='md' />
            <Anchor
              data-testid={`sigrun-recent-game-event-${game.sessionHash}`}
              href={`/event/${event.id}/info`}
            >
              {event.title}
            </Anchor>
            <GameListing
              eventId={event.id.toString()}
              isOnline={event.type === EventType.EVENT_TYPE_ONLINE}
              isDimmed={storage.getDimmed()}
              withYakitori={event.withYakitori}
              game={game}
              players={
                Object.fromEntries(game.players.map((player) => [player.id, player])) as Record<
                  number,
                  PersonEx
                >
              }
              rowStyle={{ padding: '16px' }}
              showShareLink={true}
            />
            <Divider size='xs' />
          </div>
        ))}
      </Stack>
    </section>
  );
};
