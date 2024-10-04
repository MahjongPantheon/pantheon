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
import { useI18n } from '../../hooks/i18n';
import { EventAdmin, EventReferee } from '../../clients/proto/atoms.pb';
import {
  ActionIcon,
  Text,
  Container,
  Group,
  Space,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
  Title,
} from '@mantine/core';
import { IconUserX } from '@tabler/icons-react';
import { PlayerSelector } from '../PlayersManage/PlayerSelector';
import { Filler } from '../../helpers/filler';
import { useStorage } from '../../hooks/storage';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { notifications } from '@mantine/notifications';

export const ManagementTab: React.FC<{
  eventId: number;
  eventAdmins: EventAdmin[];
  setEventAdmins: (eventAdmins: EventAdmin[]) => void;
  eventReferees: EventReferee[];
  setEventReferees: (eventAdmins: EventReferee[]) => void;
}> = ({ eventId, eventAdmins, setEventAdmins, eventReferees, setEventReferees }) => {
  const storage = useStorage();
  const personId = storage.getPersonId()!;
  const api = useApi();
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const removeAdmin = (ruleId: number) => {
    api
      .removeEventAdmin(ruleId)
      .then((success) => {
        if (success) {
          setEventAdmins(eventAdmins.filter((item) => item.ruleId !== ruleId));
        }
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      });
  };

  const removeReferee = (ruleId: number) => {
    api
      .removeEventReferee(ruleId)
      .then((success) => {
        if (success) {
          setEventReferees(eventReferees.filter((item) => item.ruleId !== ruleId));
        }
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      });
  };

  return (
    <>
      <Container pos='relative' sx={{ minHeight: '400px' }}>
        <Space h='xl' />
        <Title order={5}>{i18n._t('Event referees list')}</Title>
        <Space h='xl' />
        <Group grow>
          <PlayerSelector
            eventId={eventId}
            excludePlayers={eventReferees.map((p) => p.personId)}
            placeholder={i18n._t('Find and add referee by name...')}
            onPlayerSelect={(newPlayer) => {
              api
                .addEventReferee(newPlayer.id, eventId)
                .then((ruleId) => {
                  if (ruleId) {
                    setEventReferees([
                      {
                        ruleId,
                        personId: newPlayer.id,
                        personName: newPlayer.title,
                        hasAvatar: newPlayer.hasAvatar,
                        lastUpdate: newPlayer.lastUpdate,
                      },
                      ...eventReferees,
                    ]);
                  }
                })
                .catch((err: Error) => {
                  notifications.show({
                    title: i18n._t('Error has occurred'),
                    message: err.message,
                    color: 'red',
                  });
                });
            }}
          />
        </Group>
        <Space h='xl' />
        <Stack justify='flex-start' spacing='0'>
          {eventReferees.map((p, idx) => (
            <Group
              key={`ev_${p.personId}`}
              style={{
                padding: '10px',
                backgroundColor:
                  idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
              }}
            >
              <Group sx={{ flex: 1, minWidth: '300px' }}>
                <PlayerAvatar
                  p={{
                    title: p.personName,
                    id: p.personId,
                    hasAvatar: p.hasAvatar,
                    lastUpdate: p.lastUpdate,
                  }}
                />
                <Text>{p.personName}</Text>
              </Group>
              <Group>
                {p.personId !== personId && (
                  <ActionIcon
                    title={i18n._t('Remove referee from event')}
                    variant='filled'
                    size='lg'
                    color='red'
                    onClick={() => removeReferee(p.ruleId)}
                  >
                    <IconUserX />
                  </ActionIcon>
                )}
              </Group>
            </Group>
          ))}
        </Stack>
        <Space h='xl' />
        <Title order={5}>{i18n._t('Event administrators list')}</Title>
        <Space h='xl' />
        <Group grow>
          <PlayerSelector
            eventId={eventId}
            excludePlayers={eventAdmins.map((p) => p.personId)}
            placeholder={i18n._t('Find and add administrator by name...')}
            onPlayerSelect={(newPlayer) => {
              api
                .addEventAdmin(newPlayer.id, eventId)
                .then((ruleId) => {
                  if (ruleId) {
                    setEventAdmins([
                      {
                        ruleId,
                        personId: newPlayer.id,
                        personName: newPlayer.title,
                        hasAvatar: newPlayer.hasAvatar,
                        lastUpdate: newPlayer.lastUpdate,
                      },
                      ...eventAdmins,
                    ]);
                  }
                })
                .catch((err: Error) => {
                  notifications.show({
                    title: i18n._t('Error has occurred'),
                    message: err.message,
                    color: 'red',
                  });
                });
            }}
          />
        </Group>
        <Space h='xl' />
        <Stack justify='flex-start' spacing='0'>
          {eventAdmins.map((p, idx) => (
            <Group
              key={`ev_${p.personId}`}
              style={{
                padding: '10px',
                backgroundColor:
                  idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
              }}
            >
              <Group sx={{ flex: 1, minWidth: '300px' }}>
                <PlayerAvatar
                  p={{
                    title: p.personName,
                    id: p.personId,
                    hasAvatar: p.hasAvatar,
                    lastUpdate: p.lastUpdate,
                  }}
                />
                <Text>{p.personName}</Text>
              </Group>
              <Group>
                {p.personId !== personId && (
                  <ActionIcon
                    title={i18n._t('Remove administrator from event')}
                    variant='filled'
                    size='lg'
                    color='red'
                    onClick={() => removeAdmin(p.ruleId)}
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
