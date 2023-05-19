import { GameResult, Player } from '../clients/proto/atoms.pb';
import { CSSProperties } from 'react';
import { Anchor, Badge, Group, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PlayerIcon } from './PlayerIcon';
import * as React from 'react';
import { useLocation } from 'wouter';

type GameListingProps = {
  eventId: string;
  isOnline: boolean;
  game: GameResult;
  players: Record<number, Player>;
  rowStyle: CSSProperties;
};
export const GameListing: React.FC<GameListingProps> = ({
  eventId,
  isOnline,
  game,
  players,
  rowStyle,
}) => {
  const [, navigate] = useLocation();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const DataCmp = largeScreen ? Group : Stack;
  const winds = ['東', '南', '西', '北'];
  return (
    <Stack style={rowStyle}>
      {game.finalResults.map((result, idx) => (
        <Group grow key={`pl_${idx}`}>
          <DataCmp spacing='xs'>
            <Group style={{ flex: 1 }}>
              <Badge
                w={50}
                size='xl'
                color='blue'
                radius='sm'
                style={{ padding: 0, fontSize: '22px' }}
              >
                {winds[idx]}
              </Badge>
              <Group>
                <PlayerIcon p={{ title: players[result.playerId].title, id: result.playerId }} />
                <Stack spacing={0}>
                  <Anchor
                    href={`/event/${eventId}/player/${result.playerId}`}
                    onClick={(e) => {
                      navigate(`/event/${eventId}/player/${result.playerId}`);
                      e.preventDefault();
                    }}
                  >
                    {players[result.playerId].title}
                  </Anchor>
                  {isOnline && <Text c='dimmed'>{players[result.playerId].tenhouId}</Text>}
                </Stack>
              </Group>
            </Group>
            <Group spacing={2} grow={!largeScreen}>
              <Badge w={65} size='lg' color='cyan' radius='sm' style={{ padding: 0 }}>
                {result.score}
              </Badge>
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
            </Group>
          </DataCmp>
        </Group>
      ))}
    </Stack>
  );
};
