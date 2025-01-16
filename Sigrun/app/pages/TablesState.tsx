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

import * as React from 'react';
import {
  Alert,
  Badge,
  Container,
  Divider,
  Group,
  MantineColor,
  Space,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useEvent } from '../hooks/useEvent';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { useEffect, useState } from 'react';
import { SessionStatus, TableState } from '../clients/proto/atoms.pb';
import { useI18n } from '../hooks/i18n';
import { Meta } from '../components/Meta';
import { EventsGetTablesStateResponse } from '../clients/proto/mimir.pb';
import { IconCheck } from '@tabler/icons-react';

export const TablesState: React.FC<{ params: { eventId: string } }> = ({ params: { eventId } }) => {
  const events = useEvent(eventId);
  const i18n = useI18n();

  const api = useApi();
  const [ruleset] = useIsomorphicState(
    null,
    'RulesOverview_' + eventId,
    () => api.getGameConfig(parseInt(eventId, 10)),
    [eventId]
  );
  const [tableState, setTableState] = useState<EventsGetTablesStateResponse | null>(null);

  // Initial fetch of tables state
  useEffect(() => {
    api.getTablesState(parseInt(eventId, 10)).then(setTableState);
  }, []);

  // Update state once in 30s
  useEffect(() => {
    const timer = setInterval(() => {
      api.getTablesState(parseInt(eventId, 10)).then(setTableState);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!events || !tableState) {
    return null;
  }

  if (events?.length > 1) {
    return (
      <Container>
        <Alert color='red'>{i18n._t('Tables state is not available for aggregated events')}</Alert>
      </Container>
    );
  }

  const tables = new Map<number, TableState>();
  const tablesTotal = tables.size;
  let tablesPlaying = 0;
  let tablesFinished = 0;

  for (const t of tableState.tables ?? []) {
    if (!t.tableIndex) {
      continue;
    }

    if (!tables.has(t.tableIndex)) {
      tables.set(t.tableIndex, t);
    }

    if (t.status === SessionStatus.SESSION_STATUS_INPROGRESS) {
      tablesPlaying++;
    } else {
      tablesFinished++;
    }
  }

  const tablesIterable = [...tables.entries()]
    .map(([index, table]) => ({ index, table }))
    .sort((a, b) => a.index - b.index);

  return (
    <Container w='100%' m={10} maw='100%'>
      <Meta
        title={`${i18n._t('Tables state')} - ${events?.[0].title} - Sigrun`}
        description={i18n._t(
          'Current tables state for the event "%1" provided by Mahjong Pantheon',
          [events?.[0].title]
        )}
      />
      <h2 style={{ display: 'flex', gap: '20px' }}>
        {events[0] && <EventTypeIcon event={events[0]} />}
        {events[0]?.title}
      </h2>
      <Divider size='xs' />
      <h3>
        {i18n._t('Total: %1 / Still playing: %2 / Finished: %3', [
          tablesTotal,
          tablesPlaying,
          tablesFinished,
        ])}
      </h3>
      <Divider size='xs' />
      <Space h='md' />

      <Group style={{ alignItems: 'flex-start' }}>
        {tablesIterable.map((table, tidx) => (
          <Table
            key={`tbl_${tidx}`}
            table={table.table}
            basePoints={ruleset?.rulesetConfig.startPoints ?? 0}
            index={table.index}
          />
        ))}
      </Group>
    </Container>
  );
};

const roundsMap: { [key: number]: string } = {
  1: '東1',
  2: '東2',
  3: '東3',
  4: '東4',
  5: '南1',
  6: '南2',
  7: '南3',
  8: '南4',
  9: '西1',
  10: '西2',
  11: '西3',
  12: '西4',
};
const winds = ['東', '南', '西', '北'];
const colors: MantineColor[] = ['red', 'yellow', 'green', 'blue'];
function Table({
  index,
  table,
  basePoints,
}: {
  index: number;
  table: TableState;
  basePoints: number;
}) {
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const theme = useMantineTheme();
  return (
    <Group
      align='flex-start'
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[4],
        borderRadius: '7px',
        padding: '5px',
        backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.gray[2],
      }}
    >
      <Stack gap={10}>
        <Badge variant='filled' size='xl' radius='sm' pl={8} pr={8}>
          {index}
        </Badge>
        {table.status === SessionStatus.SESSION_STATUS_FINISHED ||
        table.status === SessionStatus.SESSION_STATUS_PREFINISHED ? (
          <Badge variant='filled' color='green' size='xl' radius='sm' pl={8} pr={8}>
            <IconCheck style={{ marginTop: '6px' }} />
          </Badge>
        ) : (
          <Badge variant='filled' color='grape' size='xl' radius='sm' pl={8} pr={8}>
            {roundsMap[table.currentRoundIndex]}
          </Badge>
        )}
      </Stack>
      <Stack gap={0}>
        {table.players.map((seat, idx) => (
          <Group key={`st_${idx}`} justify='space-between' style={{ alignItems: 'flex-start' }}>
            <Badge size='xl' radius='sm' p={5} color={colors[idx]}>
              {winds[idx]}
            </Badge>
            <Text pt={3} style={{ width: '160px', fontWeight: 'bold' }}>
              {seat.title}
            </Text>
            <Badge
              w={60}
              radius='sm'
              pl={5}
              pr={5}
              mt={5}
              color={
                (table.scores.find((s) => s.playerId === seat.id)?.score ?? 0) >= basePoints
                  ? 'green'
                  : 'red'
              }
              variant='filled'
            >
              {table.scores.find((s) => s.playerId === seat.id)?.score ?? 0}
            </Badge>
          </Group>
        ))}
      </Stack>
    </Group>
  );
}
