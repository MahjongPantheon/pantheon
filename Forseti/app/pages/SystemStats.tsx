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

import { useStorage } from '../hooks/storage';
import { HuginData } from 'tsclients/proto/hugin.pb';
import { Link, Redirect } from 'wouter';
import LineGraph from '../components/LineGraph';
import { authCtx, PrivilegesLevel } from '../hooks/auth';

const opts = {
  type: 'line',
  plugins: {
    title: {
      display: true,
      text: '',
    },
    legend: {
      display: true,
      labels: {
        color: 'rgb(0, 0, 0)',
      },
    },
  },
  responsive: true,
  scales: {
    x: {},
    y: {
      stacked: true,
    },
  },
};

type HuginKeys = Exclude<keyof HuginData, 'eventCount'>;
type Subsystems = 'all' | 'Forseti' | 'Tyr' | 'Sigrun' | 'Bragi';
type Dataset<Data> = {
  label: string;
  fill: boolean;
  tension: number;
  backgroundColor: string;
  borderColor: string;
  data: Data;
};
type Stats = {
  labels?: string[]; // dates
  datasets: Dataset<{ /*date*/ x: string; y: number }[]>[];
};

const TableTotalView = ({
  elements,
  selectedField,
}: {
  elements: Stats;
  selectedField: HuginKeys;
}) => {
  const sums = elements.datasets
    .map((item) => {
      return {
        ...item,
        data: item.data.reduce((acc, i) => acc + i.y, 0),
      };
    }, [])
    .sort((a, b) => b.data - a.data);
  const rows = sums.map((element, idx) => (
    <tr key={`table_${idx}`}>
      <td>{element.label}</td>
      <td>{element.data}</td>
    </tr>
  ));

  const total = sums.reduce((acc, v) => acc + v.data, 0);

  return (
    <>
      <h3>
        Total by {selectedField}: {total}
      </h3>
      <Table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </>
  );
};

const keys: HuginKeys[] = ['uniqCount', 'browser', 'country', 'city', 'os', 'device', 'language'];
const subsystems: Subsystems[] = ['all', 'Sigrun', 'Bragi', 'Forseti', 'Tyr'];

export const SystemStats: React.FC<{ params: { period?: string } }> = ({ params: { period } }) => {
  period = period ?? 'lastday';
  const { privilegesLevel } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const personId = storage.getPersonId();
  const [stats, setStats] = useState<HuginData[] | null>(null);
  const [selectedItem, setSelectedItem] = useState<HuginKeys>('uniqCount');
  const [selectedSubsystem, setSelectedSubsystem] = useState<Subsystems>('all');
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const shade1 = isDark ? 7 : 3;
  const shade2 = isDark ? 7 : 3;
  const colors = [
    theme.colors.red[shade1],
    theme.colors.grape[shade1],
    theme.colors.violet[shade1],
    theme.colors.blue[shade1],
    theme.colors.cyan[shade1],
    theme.colors.green[shade1],
    theme.colors.lime[shade1],
    theme.colors.yellow[shade1],
    theme.colors.orange[shade1],
    theme.colors.teal[shade1],
    theme.colors.red[shade2],
    theme.colors.grape[shade2],
    theme.colors.violet[shade2],
    theme.colors.blue[shade2],
    theme.colors.cyan[shade2],
    theme.colors.green[shade2],
    theme.colors.lime[shade2],
    theme.colors.yellow[shade2],
    theme.colors.orange[shade2],
    theme.colors.teal[shade2],
  ];

  const [selectedStats, setSelectedStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  usePageTitle(i18n._t('System stats'));

  useEffect(() => {
    setIsLoading(true);
    if (!personId) {
      setIsLoading(false);
      return;
    }

    if (privilegesLevel !== PrivilegesLevel.SUPERADMIN) {
      setIsLoading(false);
    } else {
      (period === 'lastyear'
        ? api.getLastYearStats()
        : period === 'lastmonth'
          ? api.getLastMonthStats()
          : api.getLastDayStats()
      ).then((st) => {
        setStats(st);
        setIsLoading(false);
      });
    }
  }, [personId, period]);

  if (!isLoading && (!personId || privilegesLevel !== PrivilegesLevel.SUPERADMIN)) {
    return <Redirect to='/' />;
  }

  useEffect(() => {
    setSelectedStats(
      makeStat(
        stats,
        selectedItem,
        selectedSubsystem,
        colors,
        period as 'lastday' | 'lastmonth' | 'lastyear'
      )
    );
  }, [stats, selectedItem, selectedSubsystem, isDark]);

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayOpacity={1} />
      <Group position='apart'>
        <Group>
          <Link to='/stats/lastday'>
            <Button variant='filled'>{i18n._t('Last 24h')}</Button>
          </Link>
          <Link to='/stats/lastmonth'>
            <Button variant='filled'>{i18n._t('Last 30d')}</Button>
          </Link>
          <Link to='/stats/lastyear'>
            <Button variant='filled'>{i18n._t('Last 12mon')}</Button>
          </Link>
        </Group>
        <Select
          label={i18n._t('Data slice')}
          value={selectedItem}
          onChange={(val) => setSelectedItem(val as HuginKeys)}
          data={keys.map((i) => ({ value: i, label: i }))}
        />
        <Select
          label={i18n._t('Subsystem')}
          value={selectedSubsystem}
          onChange={(val) => setSelectedSubsystem(val as Subsystems)}
          data={subsystems.map((i) => ({ value: i, label: i }))}
        />
      </Group>
      <Space h='xl' />
      {selectedStats && (
        <>
          <LineGraph
            data={selectedStats}
            options={{
              ...opts,
              plugins: {
                ...opts.plugins,
                title: { ...opts.plugins.title, text: selectedSubsystem },
                legend: {
                  ...opts.plugins.legend,
                  labels: { color: theme.colors.dark[1] },
                },
              },
            }}
          />
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

function makeStat(
  stats: HuginData[] | null | undefined,
  field: HuginKeys,
  subsystem: Subsystems,
  colors: string[],
  type: 'lastday' | 'lastmonth' | 'lastyear'
): Stats | null {
  if (!stats) {
    return null;
  }

  const subStats = stats.filter((item) => item.siteId === subsystem || subsystem === 'all');
  const allDates = Array.from(new Set(subStats.map((item) => item.datetime)));
  const allDatasets = Array.from(
    new Set(subStats.flatMap((item) => Object.keys(JSON.parse(item[field].toString()))))
  );

  const datasetValues: Record<string, Record<string, { x: string; y: number }>> = {};

  for (const date of allDates) {
    for (const logItem of subStats) {
      if (logItem.datetime !== date) {
        continue;
      }
      if (field === 'uniqCount') {
        if (!datasetValues['uniqCount']) {
          datasetValues['uniqCount'] = {};
        }
        if (!datasetValues['uniqCount'][logItem.datetime]) {
          datasetValues['uniqCount'][logItem.datetime] = {
            x: logItem.datetime,
            y: 0,
          };
        }
        datasetValues['uniqCount'][logItem.datetime].y += logItem.uniqCount ?? 0;
      } else {
        const data = JSON.parse(logItem[field].toString());
        for (const datasetItem of allDatasets) {
          const value = parseInt(data[datasetItem] ?? '0', 10) ?? 0;
          if (!datasetValues[datasetItem]) {
            datasetValues[datasetItem] = {};
          }
          if (!datasetValues[datasetItem][logItem.datetime]) {
            datasetValues[datasetItem][logItem.datetime] = { x: logItem.datetime, y: 0 };
          }
          datasetValues[datasetItem][logItem.datetime].y += value;
        }
      }
    }
  }

  const datasetValuesMod = Object.entries(datasetValues).map(([label, data], idx) => ({
    data: sortBy(type, Object.values(data)),
    label: label,
    fill: true,
    tension: 0.2,
    backgroundColor: colors[idx % colors.length],
    borderColor: colors[idx % colors.length],
  }));

  return {
    labels: sortDates(type, allDates),
    datasets: datasetValuesMod,
  };
}

function sortBy(type: 'lastday' | 'lastmonth' | 'lastyear', data: Array<{ x: string; y: number }>) {
  data = data.sort((a, b) => a.x.localeCompare(b.x));
  let compareTo: number;
  switch (type) {
    case 'lastday':
      compareTo = new Date().getHours() + 1;
      break;
    case 'lastmonth':
      compareTo = new Date().getDate() + 1;
      break;
    case 'lastyear':
      compareTo = new Date().getMonth() + 1;
      break;
  }
  return [
    ...data.filter((v) => parseInt(v.x, 10) > compareTo),
    ...data.filter((v) => parseInt(v.x, 10) <= compareTo),
  ];
}

function sortDates(type: 'lastday' | 'lastmonth' | 'lastyear', data: string[]) {
  data = data.sort((a, b) => a.localeCompare(b));
  let compareTo: number;
  switch (type) {
    case 'lastday':
      compareTo = new Date().getHours() + 1;
      break;
    case 'lastmonth':
      compareTo = new Date().getDate() + 1;
      break;
    case 'lastyear':
      compareTo = new Date().getMonth() + 1;
      break;
  }
  return [
    ...data.filter((v) => parseInt(v, 10) > compareTo),
    ...data.filter((v) => parseInt(v, 10) <= compareTo),
  ];
}
