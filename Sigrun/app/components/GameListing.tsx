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

import { GameResult, Player } from '../clients/proto/atoms.pb';
import { CSSProperties } from 'react';
import {
  Anchor,
  Badge,
  Button,
  Group,
  List,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PlayerAvatar } from './PlayerAvatar';
import * as React from 'react';
import { useLocation } from 'wouter';
import { useI18n } from '../hooks/i18n';
import { makeLog } from '../helpers/gameLog';
import { IconShare } from '@tabler/icons-react';
import { YakitoriIndicator } from './YakitoriIndicator';
import { calcDimmedBackground, calcDimmedText } from 'helpers/theme';
import { ActionIcon } from '@mantine/core';

type GameListingProps = {
  eventId: string;
  isOnline: boolean;
  isDimmed: boolean;
  withYakitori: boolean;
  game: GameResult;
  players: Record<number, Player>;
  rowStyle: CSSProperties;
  showShareLink: boolean;
};
export const GameListing: React.FC<GameListingProps> = ({
  eventId,
  isOnline,
  isDimmed,
  withYakitori,
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
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const outcomes = { ron: 0, tsumo: 0, draw: 0, chombo: 0, nagashi: 0 };
  const yakitori = withYakitori
    ? Object.keys(players).reduce(
        (acc, id) => {
          acc[parseInt(id.toString(), 10)] = true;
          return acc;
        },
        {} as Record<number, boolean>
      )
    : null;
  game.rounds.forEach((r) => {
    if (yakitori) {
      if (r.ron) {
        yakitori[r.ron.winnerId] = false;
      } else if (r.multiron) {
        r.multiron.wins.forEach((mr) => {
          yakitori[mr.winnerId] = false;
        });
      } else if (r.tsumo) {
        yakitori[r.tsumo.winnerId] = false;
      } else if (r.nagashi) {
        r.nagashi.nagashi.forEach((id) => {
          yakitori[id] = false;
        });
      }
    }

    if (r.ron ?? r.multiron) {
      outcomes.ron++;
    } else if (r.tsumo) {
      outcomes.tsumo++;
    } else if (r.draw ?? r.abort) {
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
            <ActionIcon size='md' variant='light'>
              <IconShare size={16} />
            </ActionIcon>
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
              color={calcDimmedBackground(isDimmed, isDark)}
              c={calcDimmedText(isDimmed, isDark)}
              radius='xl'
              style={{ fontSize: '16px' }}
              rightSection={
                players[result.playerId]?.title && (
                  <PlayerAvatar
                    size='sm'
                    p={{
                      title: players[result.playerId]?.title,
                      id: result.playerId,
                      hasAvatar: players[result.playerId]?.hasAvatar,
                      lastUpdate: players[result.playerId]?.lastUpdate,
                    }}
                  />
                )
              }
            >
              {winds[idx]}
            </Badge>
            <Group style={{ maxWidth: '230px' }}>
              <Stack gap={0}>
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
                <Group gap={2} mt={10}>
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
                  <Badge
                    w={65}
                    size='lg'
                    color={calcDimmedBackground(isDimmed, isDark)}
                    c={calcDimmedText(isDimmed, isDark)}
                    radius='sm'
                    style={{ padding: 0 }}
                  >
                    {result.score}
                  </Badge>
                  {yakitori && yakitori[result.playerId] && <YakitoriIndicator />}
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
        <Group gap={2}>
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
