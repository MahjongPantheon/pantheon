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
import { useI18n } from '../hooks/i18n';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { YakuId, yakuList, yakuNameMap as yakuNameMapGen } from '../helpers/yaku';
import { YakuStat } from '../clients/proto/atoms.pb';
import { useMemo } from 'react';

const BarGraph = React.lazy(() => import('./BarGraph'));

export const YakuGraph = ({ yakuStat }: { yakuStat?: YakuStat[] }) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const yakuNameMap = useMemo(() => yakuNameMapGen(i18n), []);
  const yaku = Object.values(yakuList).reduce((acc, y) => {
    acc.set(y.id, 0);
    return acc;
  }, new Map<YakuId, number>());
  let totalYakuhai = 0;

  if (!yakuStat) {
    return null;
  }

  yakuStat.forEach((stat) => {
    yaku.set(stat.yakuId as YakuId, stat.count);
    switch (stat.yakuId) {
      case YakuId.YAKUHAI1:
        totalYakuhai += stat.count;
        break;
      case YakuId.YAKUHAI2:
        totalYakuhai += 2 * stat.count;
        break;
      case YakuId.YAKUHAI3:
        totalYakuhai += 3 * stat.count;
        break;
      case YakuId.YAKUHAI4:
        totalYakuhai += 4 * stat.count;
        break;
      default:
    }
  });

  const yakuStats = [...yaku.entries()]
    .map(([key, value]) => {
      return { x: value, y: yakuNameMap.get(key) + ` (${value})` };
    })
    .filter((v) => v.x > 0)
    .sort((a, b) => b.x - a.x);

  if (totalYakuhai > 0) {
    yakuStats.push({ x: totalYakuhai, y: i18n._t('Yakuhai: total') + ` (${totalYakuhai})` });
  }

  const yakuStatsHeight = 40 + 24 * yakuStats.length;
  return (
    <div style={{ position: 'relative', height: `${yakuStatsHeight}px` }}>
      <BarGraph
        data={{ datasets: [{ data: yakuStats }] }}
        options={{
          maintainAspectRatio: false,
          backgroundColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
          borderColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
          color: isDark ? theme.colors.gray[2] : theme.colors.dark[7],
          font: { size: 16, family: '"PT Sans Narrow", Arial' },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: false,
            },
          },
          events: [],
          indexAxis: 'y',
          // grouped: false,
          scales: {
            x: {
              grid: {
                color: isDark ? theme.colors.gray[8] : theme.colors.gray[3],
              },
              position: 'bottom',
              title: {
                display: true,
                text: i18n._t('Yaku collected over all time'),
              },
            },
            y: {
              ticks: {
                autoSkip: false,
              },
              grid: {
                color: isDark ? theme.colors.gray[8] : theme.colors.gray[3],
              },
            },
          },
        }}
      />
    </div>
  );
};

export { YakuGraph as default }; // for React.lazy
