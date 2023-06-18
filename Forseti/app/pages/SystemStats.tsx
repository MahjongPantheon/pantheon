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
import { useEffect, useState } from 'react';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { usePageTitle } from '../hooks/pageTitle';
import {
  Container,
  Group,
  LoadingOverlay,
  Radio,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';

import { useStorage } from '../hooks/storage';
import { HuginData } from '../clients/proto/hugin.pb';
import LineGraph from '../helpers/LineGraph';
import { Redirect } from 'wouter';

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

type HuginKeys = Exclude<Exclude<keyof HuginData, 'uniqCount'>, 'eventCount'>;

export const SystemStats: React.FC = () => {
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const personId = storage.getPersonId();
  const [stats, setStats] = useState<HuginData[] | null>(null);
  const [selectedItem, setSelectedItem] = useState<HuginKeys>('browser');
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const shade1 = isDark ? 9 : 4;
  const shade2 = isDark ? 8 : 2;
  const colors = [
    theme.colors.red[shade1],
    theme.colors.pink[shade1],
    theme.colors.grape[shade1],
    theme.colors.violet[shade1],
    theme.colors.indigo[shade1],
    theme.colors.blue[shade1],
    theme.colors.cyan[shade1],
    theme.colors.green[shade1],
    theme.colors.lime[shade1],
    theme.colors.yellow[shade1],
    theme.colors.orange[shade1],
    theme.colors.teal[shade1],
    theme.colors.red[shade2],
    theme.colors.pink[shade2],
    theme.colors.grape[shade2],
    theme.colors.violet[shade2],
    theme.colors.indigo[shade2],
    theme.colors.blue[shade2],
    theme.colors.cyan[shade2],
    theme.colors.green[shade2],
    theme.colors.lime[shade2],
    theme.colors.yellow[shade2],
    theme.colors.orange[shade2],
    theme.colors.teal[shade2],
  ];

  const keys: HuginKeys[] = [
    'browser',
    'country',
    'city',
    'eventType',
    'os',
    'device',
    'language',
    'screen',
  ];
  const [selectedStats, setSelectedStats] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  usePageTitle(i18n._t('System stats'));

  useEffect(() => {
    setIsLoading(true);
    if (!personId) {
      setIsLoading(false);
      return;
    }
    api.getSuperadminFlag(personId).then((flag) => {
      setIsSuperadmin(flag);
      if (!flag) {
        setIsLoading(false);
      } else {
        api.getLastDayStats().then((st) => {
          setStats(st);
          setIsLoading(false);
        });
      }
    });
  }, [personId]);

  if (!isLoading && (!personId || !isSuperadmin)) {
    return <Redirect to='/' />;
  }

  useEffect(() => {
    setSelectedStats(makeStat(stats, selectedItem, colors));
  }, [stats, selectedItem, isDark]);

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayOpacity={1} />
      <Radio.Group
        value={selectedItem}
        name='dataType'
        label={i18n._t('Select data slice')}
        onChange={(val) => setSelectedItem(val as HuginKeys)}
      >
        <Group mt='xs'>
          {keys.map((k) => (
            <Radio value={k} label={k} />
          ))}
        </Group>
      </Radio.Group>
      {selectedStats &&
        Object.entries(selectedStats).map(([site, data]) => (
          <LineGraph
            data={data as any}
            options={{
              ...opts,
              plugins: {
                ...opts.plugins,
                title: { ...opts.plugins.title, text: i18n._t('Visits - %1', [site]) },
                legend: {
                  ...opts.plugins.legend,
                  labels: { color: theme.colors.dark[1] },
                },
              },
            }}
          />
        ))}
    </Container>
  );
};

function makeStat(stats: HuginData[] | null | undefined, field: HuginKeys, colors: string[]) {
  if (stats) {
    const data = stats.reduce((acc, item) => {
      acc[item.siteId] = [...(acc[item.siteId] ?? []), [item.datetime, JSON.parse(item[field])]];
      return acc;
    }, {} as Record<string, [string, any][]>);

    const allTimes = Object.fromEntries(
      Object.entries(data).map(([site, item]) => [
        site,
        Object.entries(item).map(([idx, [date]]) => date),
      ])
    );

    const allItemKeys: Record<string, string[]> = Object.fromEntries(
      Object.entries(data).map(([site, d]) => {
        return [
          site,
          d.reduce((acc, [, item]) => {
            acc = [...acc, ...Object.keys(item)];
            return acc;
          }, [] as string[]),
        ];
      })
    );

    const datasets: Record<string, Record<string, Record<string, number>>> = Object.fromEntries(
      Object.entries(allItemKeys).map(([siteId, itemKeys]) => {
        return [
          siteId,
          Object.fromEntries(
            itemKeys.map((n) => [n, Object.fromEntries(allTimes[siteId].map((t) => [t, 0]))])
          ),
        ];
      })
    );

    Object.entries(data).forEach(([site, items]) => {
      items.forEach(([time, stat]) => {
        Object.entries(stat).forEach(([name, count]) => {
          datasets[site][name][time] = parseInt(count as string, 10);
        });
      });
    });

    return Object.fromEntries(
      Object.entries(datasets).map(([site, item]) => {
        return [
          site,
          {
            labels: allTimes[site],
            datasets: Object.entries(item).map(([name, vals], idx) => {
              return {
                label: name,
                fill: true,
                tension: 0.2,
                data: Object.values(vals),
                backgroundColor: colors[idx % colors.length],
                borderColor: colors[idx % colors.length],
              };
            }),
          },
        ];
      })
    );
  }
}
