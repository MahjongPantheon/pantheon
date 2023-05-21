import { GameResult, Player } from '../clients/proto/atoms.pb';
import { CSSProperties } from 'react';
import { Anchor, Badge, Button, Group, List, rem, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PlayerIcon } from './PlayerIcon';
import * as React from 'react';
import { useLocation } from 'wouter';
import { useI18n } from '../hooks/i18n';
import { makeLog } from '../helpers/gameLog';
import { IconShare } from '@tabler/icons-react';

type GameListingProps = {
  eventId: string;
  isOnline: boolean;
  game: GameResult;
  players: Record<number, Player>;
  rowStyle: CSSProperties;
  showShareLink: boolean;
};
export const GameListing: React.FC<GameListingProps> = ({
  eventId,
  isOnline,
  game,
  players,
  rowStyle,
  showShareLink,
}) => {
  const [, navigate] = useLocation();
  const i18n = useI18n();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const DataCmp = largeScreen ? Group : Stack;
  const winds = ['東', '南', '西', '北'];

  const outcomes = { ron: 0, tsumo: 0, draw: 0, chombo: 0, nagashi: 0 };
  game.rounds.forEach((r) => {
    if (r.ron || r.multiron) {
      outcomes.ron++;
    } else if (r.tsumo) {
      outcomes.tsumo++;
    } else if (r.draw || r.abort) {
      outcomes.draw++;
    } else if (r.chombo) {
      outcomes.chombo++;
    } else if (r.nagashi) {
      outcomes.nagashi++;
    }
  });

  return (
    <DataCmp
      grow={largeScreen ? true : undefined}
      style={{ ...rowStyle, alignItems: 'flex-start', position: 'relative' }}
    >
      <div style={{ position: 'absolute', right: '16px' }}>
        {showShareLink && (
          <Anchor
            href={`/event/${eventId}/game/${game.sessionHash}`}
            onClick={(e) => {
              navigate(`/event/${eventId}/game/${game.sessionHash}`);
              e.preventDefault();
            }}
          >
            <Button leftIcon={<IconShare size={rem(15)} />} size='xs' variant='light'>
              {i18n._t('Game link')}
            </Button>
          </Anchor>
        )}
      </div>
      {/* Players list */}
      <Stack style={{ flexGrow: 0, minWidth: '300px' }}>
        <Text>{game.date}</Text>
        {game.finalResults.map((result, idx) => (
          <Group key={`pl_${idx}`} style={{ alignItems: 'flex-start' }}>
            <Badge
              w={54}
              pr={0}
              pl={5}
              size='lg'
              color='blue'
              radius='xl'
              style={{ fontSize: '16px' }}
              rightSection={
                players[result.playerId]?.title && (
                  <PlayerIcon
                    size='sm'
                    p={{ title: players[result.playerId]?.title, id: result.playerId }}
                  />
                )
              }
            >
              {winds[idx]}
            </Badge>
            <Group style={{ maxWidth: '230px' }}>
              <Stack spacing={0}>
                <Anchor
                  href={`/event/${eventId}/player/${result.playerId}`}
                  onClick={(e) => {
                    navigate(`/event/${eventId}/player/${result.playerId}`);
                    e.preventDefault();
                  }}
                >
                  {players[result.playerId]?.title}
                </Anchor>
                {isOnline && <Text c='dimmed'>{players[result.playerId]?.tenhouId}</Text>}
                <Group spacing={2} mt={10}>
                  <Badge
                    w={75}
                    size='lg'
                    variant='filled'
                    color={result.ratingDelta > 0 ? 'lime' : 'red'}
                    radius='sm'
                    style={{ padding: 0 }}
                  >
                    {result.ratingDelta}
                  </Badge>
                  <Badge w={65} size='lg' color='cyan' radius='sm' style={{ padding: 0 }}>
                    {result.score}
                  </Badge>
                </Group>
              </Stack>
            </Group>
          </Group>
        ))}
      </Stack>

      {/* Game data */}
      <Stack style={{ flex: 1, maxWidth: 'unset' }}>
        {isOnline && (
          <>
            <a href={game.replayLink} target='_blank'>
              View replay
            </a>
          </>
        )}
        <Group spacing={2} style={{ marginRight: largeScreen ? '200px' : 0 }}>
          <Badge h={30} size='md' color='red' radius='sm' variant='outline'>
            {i18n._t('Ron: %1', [outcomes.ron || '0'])}
          </Badge>
          <Badge h={30} size='md' color='grape' radius='sm' variant='outline'>
            {i18n._t('Tsumo: %1', [outcomes.tsumo || '0'])}
          </Badge>
          <Badge h={30} size='md' color='cyan' radius='sm' variant='outline'>
            {i18n._t('Draw: %1', [outcomes.draw || '0'])}
          </Badge>
          {outcomes.chombo > 0 && (
            <Badge h={30} size='md' color='dark' radius='sm' variant='outline'>
              {i18n._t('Chombo: %1', [outcomes.chombo])}
            </Badge>
          )}
          {outcomes.nagashi > 0 && (
            <Badge h={30} size='md' color='indigo' radius='sm' variant='outline'>
              {i18n._t('Nagashi: %1', [outcomes.nagashi])}
            </Badge>
          )}
        </Group>
        <List>
          {makeLog(game.rounds, players, i18n).map((item, idxLog) => (
            <li
              style={{
                listStyleType: 'none',
                textIndent: '-34px',
                marginLeft: '34px',
              }}
              key={`log_${idxLog}`}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </List>
      </Stack>
    </DataCmp>
  );
};
