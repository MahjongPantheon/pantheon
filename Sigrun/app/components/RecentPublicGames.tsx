import * as React from 'react';
import { Anchor, Divider, Group, Stack, Text } from '@mantine/core';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';

export const RecentPublicGames: React.FC = () => {
  const api = useApi();
  const i18n = useI18n();
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
      <h2>{i18n._t('Last games')}</h2>
      <Stack gap='xs'>
        {recent.games.map((game) => (
          <Stack
            key={game.sessionHash}
            gap='xs'
            p='sm'
            data-testid={`sigrun-game-row-${game.sessionHash}`}
          >
            <Group justify='space-between' gap='xs'>
              <Anchor
                data-testid={`sigrun-recent-game-event-${game.sessionHash}`}
                href={`/event/${game.eventId}/info`}
              >
                {game.eventTitle}
              </Anchor>
              <Group gap='sm'>
                <Text size='sm' c='dimmed' data-testid='sigrun-recent-game-date'>
                  {game.date.slice(0, -3)}
                </Text>
                <Anchor
                  data-testid={`sigrun-game-details-link-${game.sessionHash}`}
                  href={`/event/${game.eventId}/game/${game.sessionHash}`}
                >
                  {i18n._t('View game')}
                </Anchor>
              </Group>
            </Group>
            <Group gap='lg'>
              {game.players.map((player) => (
                <Group
                  key={player.playerId}
                  gap='xs'
                  data-testid={`sigrun-recent-game-player-${game.sessionHash}-${player.playerId}`}
                >
                  <Text size='sm'>{player.title}</Text>
                  <Text size='sm' fw={600} data-testid='sigrun-recent-game-score'>
                    {player.score}
                  </Text>
                </Group>
              ))}
            </Group>
            <Divider size='xs' />
          </Stack>
        ))}
      </Stack>
    </section>
  );
};
