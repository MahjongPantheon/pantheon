/*  Forseti: personal area & event control panel
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
import { useApi } from '../../hooks/api';
import { useState } from 'react';
import { useI18n } from '../../hooks/i18n';
import { GameConfig, RegisteredPlayer, Event, EventType } from '../../clients/proto/atoms.pb';
import {
  ActionIcon,
  Text,
  Badge,
  Container,
  Group,
  Modal,
  rem,
  Space,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import {
  IconArmchair,
  IconArmchairOff,
  IconUserX,
  IconBadgeOff,
  IconBadge,
  IconReplace,
  IconX,
} from '@tabler/icons-react';
import { PlayerSelector } from './PlayerSelector';
import { useDisclosure } from '@mantine/hooks';
import { Filler } from '../../helpers/filler';
import { useStorage } from '../../hooks/storage';
import { PlayerAvatar } from '../../helpers/PlayerAvatar';

export const ManagementTab: React.FC<{
  eventId: number;
  players: RegisteredPlayer[];
  setPlayers: (players: RegisteredPlayer[]) => void;
  eventAdmins: Record<number, number>;
  setEventAdmins: (eventAdmins: Record<number, number>) => void;
  config?: GameConfig;
  event?: Event;
}> = ({ eventId, players, setPlayers, eventAdmins, setEventAdmins, config, event }) => {
  const storage = useStorage();
  const personId = storage.getPersonId()!;
  const api = useApi();
  const i18n = useI18n();
  const [replacementDlgOpened, replacementDlgCtrl] = useDisclosure(false);
  const [replPlayerData, setReplPlayerData] = useState<RegisteredPlayer | null>(null);
  const [includeSeatingLoading, setIncludeSeatingLoading] = useState<Record<number, boolean>>({});
  const [adminsLoading, setAdminsLoading] = useState<Record<number, boolean>>({});
  const [unregisterLoading, setUnregisterLoading] = useState<Record<number, boolean>>({});
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const toggleIncludeSeating = (playerId: number) => {
    setIncludeSeatingLoading({ ...includeSeatingLoading, [playerId]: true });
    const playerIdx = players.findIndex((p) => p.id === playerId);
    api
      .updateSeatingFlag(playerId, eventId, !players[playerIdx]?.ignoreSeating)
      .then((r) => {
        if (r) {
          setPlayers([
            ...players.slice(0, playerIdx),
            { ...players[playerIdx], ignoreSeating: !players[playerIdx].ignoreSeating },
            ...players.slice(playerIdx + 1),
          ]);
        }
      })
      .finally(() => {
        setIncludeSeatingLoading({ ...includeSeatingLoading, [playerId]: false });
      });
  };

  const toggleAdmin = (playerId: number) => {
    setAdminsLoading({ ...adminsLoading, [playerId]: true });
    if (eventAdmins[playerId]) {
      api
        .removeEventAdmin(eventAdmins[playerId])
        .then((r) => {
          if (r) {
            setEventAdmins({
              ...eventAdmins,
              [playerId]: 0,
            });
          }
        })
        .finally(() => {
          setAdminsLoading({ ...adminsLoading, [playerId]: false });
        });
    } else {
      api
        .addEventAdmin(playerId, eventId)
        .then((ruleId) => {
          if (ruleId) {
            setEventAdmins({
              ...eventAdmins,
              [playerId]: ruleId,
            });
          }
        })
        .finally(() => {
          setAdminsLoading({ ...adminsLoading, [playerId]: false });
        });
    }
  };

  const unregisterPlayer = (playerId: number) => {
    setUnregisterLoading({ ...unregisterLoading, [playerId]: true });
    api.unregisterPlayer(playerId, eventId).then((r) => {
      if (r) {
        const playerIdx = players.findIndex((p) => p.id === playerId);
        setPlayers([...players.slice(0, playerIdx), ...players.slice(playerIdx + 1)]);
        setUnregisterLoading({ ...unregisterLoading, [playerId]: false });
      }
    });
  };

  const updateReplacement = (
    player: RegisteredPlayer | null,
    replacement: RegisteredPlayer | null
  ) => {
    if (!player) {
      return;
    }
    const playerIdx = players.findIndex((p) => p.id === player.id);
    api.updatePlayerReplacement(player.id, eventId, replacement ? replacement.id : -1).then((r) => {
      if (r) {
        setPlayers([
          ...players.slice(0, playerIdx),
          {
            ...players[playerIdx],
            replacedBy: replacement
              ? {
                  id: replacement.id,
                  title: replacement.title,
                }
              : null,
          },
          ...players.slice(playerIdx + 1),
        ]);
      }
    });
  };

  const showAddRemove = !event?.tournamentStarted;
  const showReplace = event?.type !== EventType.EVENT_TYPE_LOCAL;
  const mayUseSeatingIgnore = config?.syncStart && !config?.isPrescripted;

  return (
    <>
      <Modal
        centered
        opened={replacementDlgOpened}
        onClose={replacementDlgCtrl.close}
        title={i18n._t('Select replacement player for %1', [replPlayerData?.title])}
      >
        <PlayerSelector
          eventId={eventId}
          excludePlayers={players.map((p) => p.id)}
          placeholder={i18n._t('Find replacement player by name...')}
          onPlayerSelect={(newRepl) => {
            replacementDlgCtrl.close();
            updateReplacement(replPlayerData, newRepl);
          }}
        />
        <Filler h='200px' />
      </Modal>
      <Container pos='relative' sx={{ minHeight: '400px' }}>
        {showAddRemove && (
          <>
            <Space h='xl' />
            <Group grow>
              <PlayerSelector
                eventId={eventId}
                excludePlayers={players.map((p) => p.id)}
                placeholder={i18n._t('Find and add player by name...')}
                onPlayerSelect={(newPlayer) => {
                  api.registerPlayer(newPlayer.id, eventId).then((success) => {
                    if (success) {
                      setPlayers([newPlayer, ...players]);
                    }
                  });
                }}
              />
            </Group>
          </>
        )}
        <Space h='xl' />
        <Stack justify='flex-start' spacing='0'>
          {players.map((p, idx) => (
            <Group
              key={`ev_${p.id}`}
              style={{
                padding: '10px',
                backgroundColor:
                  idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
              }}
            >
              <Group sx={{ flex: 1, minWidth: '300px' }}>
                <PlayerAvatar p={p} />
                <Stack spacing='0'>
                  <Text>{p.title}</Text>
                  {config?.isOnline && <Text c='dimmed'>{p.tenhouId}</Text>}
                </Stack>
                {showReplace && !p.replacedBy && (
                  <ActionIcon
                    title={i18n._t('Replace player with someone else')}
                    variant='subtle'
                    size='lg'
                    color='indigo'
                    onClick={() => {
                      setReplPlayerData(p);
                      replacementDlgCtrl.open();
                    }}
                  >
                    <IconReplace />
                  </ActionIcon>
                )}
                {showReplace && !!p.replacedBy && (
                  <Badge
                    color='red'
                    variant='dot'
                    title={i18n._t('Replaced by %1', [p.replacedBy.title])}
                    pr={3}
                    rightSection={
                      <ActionIcon
                        size='xs'
                        radius='xl'
                        variant='transparent'
                        aria-label={i18n._t('Remove replacement')}
                        title={i18n._t('Remove replacement')}
                        onClick={() => {
                          updateReplacement(p, null);
                        }}
                      >
                        <IconX size={rem(16)} />
                      </ActionIcon>
                    }
                  >
                    {p.replacedBy.title}
                  </Badge>
                )}
              </Group>
              <Group>
                {personId !== p.id && (
                  <ActionIcon
                    title={
                      eventAdmins[p.id]
                        ? i18n._t('Player is event administrator. Click to revoke privileges.')
                        : i18n._t('Player is a regular user. Click to promote to event admin.')
                    }
                    loading={adminsLoading[p.id]}
                    variant={eventAdmins[p.id] ? 'filled' : 'outline'}
                    size='lg'
                    color={eventAdmins[p.id] ? 'pink' : 'gray'}
                    onClick={() => toggleAdmin(p.id)}
                  >
                    {eventAdmins[p.id] ? <IconBadge /> : <IconBadgeOff />}
                  </ActionIcon>
                )}
                {mayUseSeatingIgnore && (
                  <ActionIcon
                    title={
                      p.ignoreSeating
                        ? i18n._t('Player is excluded from next seating. Click to include')
                        : i18n._t('Player is included in next seating. Click to exclude')
                    }
                    loading={includeSeatingLoading[p.id]}
                    variant={p.ignoreSeating ? 'outline' : 'filled'}
                    size='lg'
                    color={p.ignoreSeating ? 'gray' : 'green'}
                    onClick={() => toggleIncludeSeating(p.id)}
                  >
                    {p.ignoreSeating ? <IconArmchairOff /> : <IconArmchair />}
                  </ActionIcon>
                )}
                {showAddRemove && (
                  <ActionIcon
                    title={i18n._t('Remove player from event')}
                    loading={unregisterLoading[p.id]}
                    variant='filled'
                    size='lg'
                    color='red'
                    onClick={() => unregisterPlayer(p.id)}
                  >
                    <IconUserX />
                  </ActionIcon>
                )}
              </Group>
            </Group>
          ))}
        </Stack>
        <Filler h='150px' />
      </Container>
    </>
  );
};
