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
import { useState } from 'react';
import { useApi } from '../../hooks/api';
import { useI18n } from '../../hooks/i18n';
import { Badge, Group, Stack, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { CancelConfirmation } from './CancelConfirmation';
import { Penalty, Player } from '../../clients/proto/atoms.pb';

type PenaltiesListProps = {
  penaltiesList: Penalty[];
  setPenaltiesList: (list: Penalty[]) => void;
  playersListFull: Record<number, Player>;
  refereesList: Record<number, Player>;
};

export const PenaltiesList: React.FC<PenaltiesListProps> = ({
  penaltiesList,
  setPenaltiesList,
  playersListFull,
  refereesList,
}) => {
  const api = useApi();
  const i18n = useI18n();
  const [cancelLoading, setCancelLoading] = useState<Record<number, boolean>>({});
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const cancelPenalty = (penaltyId: number, reason: string) => {
    setCancelLoading({ ...cancelLoading, [penaltyId]: true });
    const penaltyIdx = penaltiesList.findIndex((p) => p.id === penaltyId);
    api
      .cancelPenalty(penaltyId, reason)
      .then((r) => {
        if (r) {
          setPenaltiesList([
            ...penaltiesList.slice(0, penaltyIdx),
            { ...penaltiesList[penaltyIdx], isCancelled: true, cancellationReason: reason },
            ...penaltiesList.slice(penaltyIdx + 1),
          ]);
        }
      })
      .finally(() => {
        setCancelLoading({ ...cancelLoading, [penaltyId]: false });
      });
  };

  return (
    <>
      <Text style={{ fontWeight: 'bold' }}>{i18n._t('Current penalties')}</Text>
      {penaltiesList.length === 0 && <Text>{i18n._t('No penalties assigned yet')}</Text>}
      {penaltiesList.map((p, idx) => (
        <Group
          key={`ev_${p.id}`}
          style={{
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '10px',
            backgroundColor:
              idx % 2 ? (isDark ? theme.colors.dark[7] : theme.colors.gray[1]) : 'transparent',
          }}
        >
          <Stack spacing='4px' style={{ flex: 1 }}>
            <Group>
              <PlayerAvatar size='sm' p={playersListFull[p.who]} />
              <Text>{playersListFull[p.who].title}</Text>
              {!p.isCancelled && (
                <Badge color={p.amount > 0 ? 'red' : 'yellow'} variant='filled'>
                  {p.amount > 0 ? p.amount : i18n._t('Notice')}
                </Badge>
              )}
              <Text style={p.isCancelled ? { textDecoration: 'line-through' } : undefined}>
                {p.reason}
              </Text>
            </Group>
            <Group>
              <Text size='xs'>{i18n._t('Assigned by:')}</Text>
              <PlayerAvatar size='xs' p={refereesList[p.assignedBy]} />
              <Text size='xs'>{refereesList[p.assignedBy].title}</Text>
            </Group>
            {p.isCancelled && (
              <Text size='sm'>
                {i18n._t('Cancelled: ')}
                {p.cancellationReason}
              </Text>
            )}
          </Stack>
          <CancelConfirmation
            disabled={p.isCancelled}
            icon={<IconX />}
            title={i18n._t('Cancel penalty')}
            color='red'
            onConfirm={(reason) => cancelPenalty(p.id, reason)}
          />
        </Group>
      ))}
    </>
  );
};
