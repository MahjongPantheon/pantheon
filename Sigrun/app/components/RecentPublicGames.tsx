import * as React from 'react';
import { ActionIcon, Anchor, Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { IconShare } from '@tabler/icons-react';
import { useLocation } from 'wouter';

export const RecentPublicGames: React.FC = () => {
  const api = useApi();
  const i18n = useI18n();
  const [, navigate] = useLocation();
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
          <Paper
            key={game.sessionHash}
            withBorder
            radius='md'
            p='md'
            shadow='xs'
            data-testid={`sigrun-game-row-${game.sessionHash}`}
          >
            <Stack gap='sm'>
              <Group justify='space-between' gap='xs'>
                <Anchor
                  data-testid={`sigrun-recent-game-event-${game.sessionHash}`}
                  href={`/event/${game.eventId}/info`}
                  fw={600}
                >
                  {game.eventTitle}
                </Anchor>
                <Group gap='sm'>
                  <Text size='sm' c='dimmed' data-testid='sigrun-recent-game-date'>
                    {game.date.slice(0, -3)}
                  </Text>
                  <ActionIcon
                    component='a'
                    size='lg'
                    radius='md'
                    variant='light'
                    aria-label={i18n._t('View game')}
                    title={i18n._t('View game')}
                    data-testid={`sigrun-game-details-link-${game.sessionHash}`}
                    href={`/event/${game.eventId}/game/${game.sessionHash}`}
                    onClick={(ev) => {
                      navigate(`/event/${game.eventId}/game/${game.sessionHash}`);
                      ev.preventDefault();
                    }}
                  >
                    <IconShare size={16} />
                  </ActionIcon>
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
                    <Badge
                      size='lg'
                      variant='filled'
                      color={player.score < game.startPoints ? 'red' : 'lime'}
                      radius='sm'
                      miw={70}
                      data-testid='sigrun-recent-game-score'
                    >
                      {player.score}
                    </Badge>
                  </Group>
                ))}
              </Group>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </section>
  );
};
