import * as React from 'react';
import { ActionIcon, Anchor, Badge, Flex, Group, Paper, Text } from '@mantine/core';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { IconShare } from '@tabler/icons-react';
import { Link, useLocation } from 'wouter';

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
      <Flex gap='md' wrap='wrap' align='stretch'>
        {recent.games.map((game) => (
          <Paper
            component='article'
            key={game.sessionHash}
            withBorder
            radius='md'
            p='md'
            shadow='xs'
            style={{
              display: 'flex',
              flex: '1 1 260px',
              flexDirection: 'column',
              gap: 'var(--mantine-spacing-sm)',
              minWidth: 0,
            }}
            data-testid={`sigrun-game-row-${game.sessionHash}`}
          >
            <Group justify='space-between' gap='xs' wrap='nowrap'>
              <Anchor
                component={Link}
                data-testid={`sigrun-recent-game-event-${game.sessionHash}`}
                href={`/event/${game.eventId}/info`}
                fw={600}
                title={game.eventTitle}
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {game.eventTitle}
              </Anchor>
              <ActionIcon
                component='a'
                size='lg'
                radius='md'
                variant='light'
                style={{ flexShrink: 0 }}
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
            <Text size='sm' c='dimmed' data-testid='sigrun-recent-game-date'>
              {game.date.slice(0, -3)}
            </Text>
            <Flex direction='column' gap='xs'>
              {game.players.map((player) => (
                <Group
                  key={player.playerId}
                  gap='sm'
                  wrap='nowrap'
                  data-testid={`sigrun-recent-game-player-${game.sessionHash}-${player.playerId}`}
                >
                  <Badge
                    size='lg'
                    variant='filled'
                    color={player.score < game.startPoints ? 'red' : 'lime'}
                    radius='sm'
                    w={80}
                    miw='max-content'
                    maw='none'
                    style={{ flexShrink: 0 }}
                    data-testid='sigrun-recent-game-score'
                  >
                    {player.score}
                  </Badge>
                  <Text size='sm' truncate style={{ flex: 1, minWidth: 0 }} title={player.title}>
                    {player.title}
                  </Text>
                </Group>
              ))}
            </Flex>
          </Paper>
        ))}
      </Flex>
    </section>
  );
};
