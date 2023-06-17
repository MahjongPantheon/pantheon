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
import { Container, LoadingOverlay, MantineColor } from '@mantine/core';

import { useStorage } from '../hooks/storage';
import { HuginData } from '../clients/proto/hugin.pb';
import BarGraph from '../helpers/BarGraph';

const colors: MantineColor[] = [
  'gray',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'green',
  'lime',
  'yellow',
  'orange',
  'teal',
];

const opts = {
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
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

export const SystemStats: React.FC = () => {
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const api = useApi();
  const i18n = useI18n();
  const storage = useStorage();
  const personId = storage.getPersonId();
  const [stats, setStats] = useState<HuginData[] | null>();
  const [osStats, setOsStats] = useState<any>();
  const [browserStats, setBrowserStats] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
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

  // if (!isLoading && (!personId || !isSuperadmin)) {
  //   return <Redirect to='/' />;
  // }

  useEffect(() => {
    setBrowserStats(makeStat(stats, 'browser'));
    setOsStats(makeStat(stats, 'os'));
  }, [stats]);

  return (
    <Container>
      <LoadingOverlay visible={isLoading} overlayOpacity={1} />
      {browserStats && (
        <BarGraph
          data={browserStats}
          options={{
            ...opts,
            plugins: {
              ...opts.plugins,
              title: {
                ...opts.plugins.title,
                text: i18n._t('Visits: by browser'),
              },
            },
          }}
        />
      )}
      {osStats && (
        <BarGraph
          data={osStats}
          options={{
            ...opts,
            plugins: {
              ...opts.plugins,
              title: {
                ...opts.plugins.title,
                text: i18n._t('Visits: by OS'),
              },
            },
          }}
        />
      )}
    </Container>
  );
};

function makeStat(
  stats: HuginData[] | null | undefined,
  field: Exclude<Exclude<keyof HuginData, 'uniqCount'>, 'eventCount'>
) {
  if (stats) {
    const data = stats.map((item) => [item.datetime, JSON.parse(item[field])]);
    const allTimes = data.map((i) => i[0]);
    const allBrowsers: string[] = data.reduce((acc, [, browser]) => {
      acc = [...acc, ...Object.keys(browser)];
      return acc as string[];
    }, []);

    const datasets: Record<string, Record<string, number>> = Object.fromEntries(
      allBrowsers.map((n) => [n, Object.fromEntries(allTimes.map((t) => [t, 0]))])
    );
    data.forEach(([time, stat]) => {
      Object.entries(stat).forEach(([name, count]) => {
        datasets[name][time] = parseInt(count as string, 10);
      });
    });

    return {
      labels: allTimes,
      datasets: Object.entries(datasets).map(([name, vals], idx) => {
        return {
          label: name,
          data: Object.values(vals),
          backgroundColor: colors[idx],
        };
      }),
    };
  }
}
