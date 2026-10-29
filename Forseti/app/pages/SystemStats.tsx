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
import { useContext, useEffect, useState } from 'react';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { usePageTitle } from '../hooks/pageTitle';
import {
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Select,
  Space,
  Table,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';

import { notifications } from '@mantine/notifications';
import { useStorage } from '../hooks/storage';
import { HuginData } from 'tsclients/proto/hugin.pb';
import { Link, Redirect } from 'wouter';
import LineGraph from '../components/LineGraph';
import { makeStat, type HuginKeys, type Stats, type Subsystems } from '../helpers/systemStats';
import { authCtx, PrivilegesLevel } from '../hooks/auth';

const TableTotalView = ({
  elements,
  selectedField,
}: {
  elements: Stats;
  selectedField: HuginKeys;
}) => {
  const sums = elements.series
    .map((item) => {
      return {
        ...item,
        data: elements.data.reduce((acc, row) => acc + Number(row[item.name]), 0),
      };
    })
    .sort((a, b) => b.data - a.data);
  const rows = sums.map((element) => (
    <Table.Tr key={element.label}>
      <Table.Td>{element.label}</Table.Td>
      <Table.Td>{element.data}</Table.Td>
    </Table.Tr>
  ));

  const total = sums.reduce((acc, v) => acc + v.data, 0);

  return (
    <>
      <h3>
        Total by {selectedField}: {total}
      </h3>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Item</Table.Th>
            <Table.Th>Value</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </>
  );
};

const keys: HuginKeys[] = ['uniqCount', 'browser', 'country', 'city', 'os', 'device', 'language'];
const subsystems: Subsystems[] = ['all', 'Sigrun', 'Bragi', 'Forseti', 'Tyr'];

export const SystemStats: React.FC<{ params: { period?: string } }> = ({ params: { period } }) => {
  period = period ?? 'lastday';
  const { privilegesLevel, privilegesLoading } = useContext(authCtx);
  const api = useApi();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const textColor = isDark ? theme.colors.gray[2] : theme.colors.dark[7];
  const gridColor = isDark ? theme.colors.gray[8] : theme.colors.gray[3];
  const i18n = useI18n();
  const storage = useStorage();
  const personId = storage.getPersonId();
  const [stats, setStats] = useState<HuginData[] | null>(null);
  const [selectedItem, setSelectedItem] = useState<HuginKeys>('uniqCount');
  const [selectedSubsystem, setSelectedSubsystem] = useState<Subsystems>('all');
  const [isLoading, setIsLoading] = useState(true);
  usePageTitle(i18n._t('System stats'));

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    if (privilegesLoading) return;
    if (!personId || privilegesLevel !== PrivilegesLevel.SUPERADMIN) {
      setStats(null);
      setIsLoading(false);
      return;
    }
    (period === 'lastyear'
      ? api.getLastYearStats()
      : period === 'lastmonth'
        ? api.getLastMonthStats()
        : api.getLastDayStats()
    )
      .then((st) => {
        if (!cancelled) setStats(st);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setStats(null);
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [personId, period, privilegesLevel, privilegesLoading, api, i18n]);

  if (!privilegesLoading && (!personId || privilegesLevel !== PrivilegesLevel.SUPERADMIN)) {
    return <Redirect to='/' />;
  }

  const selectedStats = makeStat(
    stats,
    selectedItem,
    selectedSubsystem,
    period as 'lastday' | 'lastmonth' | 'lastyear'
  );

  return (
    <Container data-testid='forseti-system-stats-page'>
      <LoadingOverlay visible={isLoading} overlayProps={{ opacity: 1 }} />
      <Group justify='space-between'>
        <Group>
          <Link to='/stats/lastday'>
            <Button data-testid='forseti-system-stats-last-day' variant='filled'>
              {i18n._t('Last 24h')}
            </Button>
          </Link>
          <Link to='/stats/lastmonth'>
            <Button data-testid='forseti-system-stats-last-month' variant='filled'>
              {i18n._t('Last 30d')}
            </Button>
          </Link>
          <Link to='/stats/lastyear'>
            <Button data-testid='forseti-system-stats-last-year' variant='filled'>
              {i18n._t('Last 12mon')}
            </Button>
          </Link>
        </Group>
        <Select
          data-testid='forseti-system-stats-data-slice'
          label={i18n._t('Data slice')}
          value={selectedItem}
          onChange={(val) => setSelectedItem(val as HuginKeys)}
          data={keys.map((i) => ({ value: i, label: i }))}
        />
        <Select
          data-testid='forseti-system-stats-subsystem'
          label={i18n._t('Subsystem')}
          value={selectedSubsystem}
          onChange={(val) => setSelectedSubsystem(val as Subsystems)}
          data={subsystems.map((i) => ({ value: i, label: i }))}
        />
      </Group>
      <Space h='xl' />
      {selectedStats && (
        <>
          <h3>{selectedSubsystem}</h3>
          <div style={{ position: 'relative', height: 400 }}>
            <LineGraph
              data={{
                labels: selectedStats.data.map((row) => String(row.date)),
                datasets: selectedStats.series.map((series) => ({
                  label: series.label,
                  data: selectedStats.data.map((row) => Number(row[series.name])),
                  backgroundColor: theme.colors[series.color][isDark ? 7 : 3],
                  borderColor: theme.colors[series.color][isDark ? 7 : 3],
                  fill: true,
                  tension: 0.3,
                })),
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                color: textColor,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: true, labels: { color: textColor } } },
                scales: {
                  x: { grid: { color: gridColor }, ticks: { color: textColor } },
                  y: {
                    stacked: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor, precision: 0 },
                  },
                },
              }}
            />
          </div>
          <Space h='xl' />
          <Divider my='sm' />
          <Space h='xl' />
          <TableTotalView elements={selectedStats} selectedField={selectedItem} />
          <Divider my='sm' />
          <Space h='xl' />
        </>
      )}
    </Container>
  );
};
