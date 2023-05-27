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

import { Event, EventType, PlayerInRating } from '../clients/proto/atoms.pb';
import {
  Anchor,
  Badge,
  Group,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { PlayerIcon } from './PlayerIcon';
import * as React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useLocation } from 'wouter';

export const TeamTable = ({ players, events }: { players: PlayerInRating[]; events: Event[] }) => {
  const [, navigate] = useLocation();
  const largeScreen = useMediaQuery('(min-width: 768px)');
  const DataCmp = largeScreen ? Group : Stack;
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const teams = new Map<string, { players: PlayerInRating[]; rating: number }>();
  for (const player of players) {
    if (!player.teamName) continue;
    if (!teams.has(player.teamName)) {
      teams.set(player.teamName, { players: [], rating: 0 });
    }

    const team = teams.get(player.teamName);
    if (team) {
      team.players.push(player);
      team.rating += player.rating;
    }
  }

  const teamsIterable = [...teams.entries()]
    .map(([name, data]) => ({ name, data }))
    .sort((a, b) => b.data.rating - a.data.rating);

  return (
    <>
      {teamsIterable.map((team, idx) => {
        return (
          <DataCmp
            key={`pl_${idx}`}
            spacing='xs'
            style={{
              padding: '10px',
              backgroundColor:
                idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
            }}
          >
            <Group style={{ flex: 1 }} position='apart'>
              <Badge w={50} size='xl' color='blue' radius='sm' style={{ padding: 0 }}>
                {idx + 1}
              </Badge>
              <Text weight='bold'>{team.name}</Text>
              <Badge
                w={75}
                size='lg'
                variant='filled'
                color={team.data.rating > 0 ? 'lime' : 'red'}
                radius='sm'
                style={{ padding: 0 }}
              >
                {team.data.rating}
              </Badge>
              <Stack>
                {team.data.players.map((player, pidx) => (
                  <Group key={`pl_${pidx}`} position='apart'>
                    <PlayerIcon p={player} />
                    <Stack spacing={2}>
                      <Anchor
                        href={`/event/${events.map((e) => e.id).join('.')}/player/${player.id}`}
                        onClick={(e) => {
                          navigate(
                            `/event/${events.map((e) => e.id).join('.')}/player/${player.id}`
                          );
                          e.preventDefault();
                        }}
                      >
                        {player.title}
                      </Anchor>
                      {events?.[0]?.type === EventType.EVENT_TYPE_ONLINE && (
                        <Text c='dimmed'>{player.tenhouId}</Text>
                      )}
                    </Stack>
                    <Badge
                      w={75}
                      size='lg'
                      variant='filled'
                      color={player.winnerZone ? 'lime' : 'red'}
                      radius='sm'
                      style={{ padding: 0 }}
                    >
                      {player.rating}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Group>
          </DataCmp>
        );
      })}
    </>
  );
};
