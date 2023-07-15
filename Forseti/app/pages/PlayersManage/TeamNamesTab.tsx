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
import { RegisteredPlayer } from '../../clients/proto/atoms.pb';
import {
  Text,
  Container,
  Group,
  Space,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
  TextInput,
} from '@mantine/core';
import { IconCircleCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { TopActionButton } from '../../helpers/TopActionButton';
import { notifications } from '@mantine/notifications';
import { Filler } from '../../helpers/filler';
import { PlayerAvatar } from '../../helpers/PlayerAvatar';

export const TeamNamesTab: React.FC<{
  eventId: number;
  players: RegisteredPlayer[];
}> = ({ eventId, players }) => {
  const api = useApi();
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [teamNames, setTeamNames] = useState<Record<number, string>>(
    players.reduce((acc, val) => {
      acc[val.id] = val.teamName ?? '';
      return acc;
    }, {} as Record<number, string>)
  );

  const updateLocalIds = useCallback(() => {
    setIsSaving(true);
    setIsSaved(false);
    api
      .updateTeamNames(eventId, teamNames)
      .then((success) => {
        if (success) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 5000);
        }
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => setIsSaving(false));
  }, [players, eventId, teamNames]);

  return (
    <>
      <Container pos='relative' sx={{ minHeight: '400px' }}>
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
              <Group sx={{ minWidth: '300px' }}>
                <PlayerAvatar p={p} />
                {p.title}
              </Group>
              <Group sx={{ flex: 1 }}>
                <Text>{i18n._t('Team:')}</Text>
                <TextInput
                  sx={{ flex: 1 }}
                  value={teamNames[p.id]}
                  onChange={(v) => setTeamNames({ ...teamNames, [p.id]: v.currentTarget.value })}
                />
              </Group>
            </Group>
          ))}
        </Stack>
        <Filler h='150px' />
        <TopActionButton
          title={isSaved ? i18n._t('Changes saved!') : i18n._t('Save changes')}
          loading={isSaving || isSaved}
          icon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
          onClick={updateLocalIds}
        />
      </Container>
    </>
  );
};
