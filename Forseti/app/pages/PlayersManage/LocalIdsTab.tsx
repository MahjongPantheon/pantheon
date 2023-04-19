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
import { useApi } from '#/hooks/api';
import { useI18n } from '#/hooks/i18n';
import { RegisteredPlayer } from '#/clients/atoms.pb';
import {
  Avatar,
  Text,
  Container,
  Group,
  NumberInput,
  Space,
  Stack,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { IconCircleCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { makeColor, makeInitials } from '#/helpers/playersList';
import { useCallback, useState } from 'react';
import { TopActionButton } from '#/helpers/TopActionButton';
import { notifications } from '@mantine/notifications';
import { Filler } from '#/helpers/filler';

export const LocalIdsTab: React.FC<{
  eventId: number;
  players: RegisteredPlayer[];
}> = ({ eventId, players }) => {
  const api = useApi();
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [localIds, setLocalIds] = useState<Record<number, number>>(
    players.reduce((acc, val) => {
      acc[val.id] = val.localId ?? 0;
      return acc;
    }, {} as Record<number, number>)
  );

  const updateLocalIds = useCallback(() => {
    setIsSaving(true);
    setIsSaved(false);
    api
      .updateLocalIds(eventId, localIds)
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
  }, [players, eventId, localIds]);

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
              <Group sx={{ flex: 1, minWidth: '300px' }}>
                <Avatar color={makeColor(p.title)} radius='xl'>
                  {makeInitials(p.title)}
                </Avatar>
                {p.title}
              </Group>
              <Group>
                <Text>{i18n._t('Local ID')}</Text>
                <NumberInput
                  value={localIds[p.id]}
                  onChange={(v) => setLocalIds({ ...localIds, [p.id]: v || 0 })}
                />
              </Group>
            </Group>
          ))}
        </Stack>
        <Filler h='150px' />
        <TopActionButton
          title={isSaved ? i18n._t('Changes saved!') : i18n._t('Save changes')}
          loading={isSaving}
          disabled={isSaved}
          icon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
          onClick={updateLocalIds}
        />
      </Container>
    </>
  );
};
