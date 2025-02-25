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

import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import * as React from 'react';
import { useMemo } from 'react';
import { YakuStat } from '../clients/proto/atoms.pb';
import { YakuId, yakuList, yakuNameMap as yakuNameMapGen } from '../helpers/yaku';
import { useI18n } from '../hooks/i18n';
import { CustomizedAxisTick } from './LineGraph';

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
      return { count: value, yaku: yakuNameMap.get(key) };
    })
    .filter((v) => v.count > 0)
    .sort((a, b) => b.count - a.count);

  if (totalYakuhai > 0) {
    yakuStats.push({ count: totalYakuhai, yaku: i18n._t('Yakuhai: total') });
  }

  const yakuStatsHeight = 40 + 24 * yakuStats.length;
  return (
    <BarGraph
      barChartProps={{ margin: { bottom: 32 } }}
      data={yakuStats}
      dataKey='yaku'
      getBarColor={() => (isDark ? 'blue.8' : 'blue.3')}
      gridAxis='xy'
      h={yakuStatsHeight}
      orientation='vertical'
      series={[{ name: 'count' }]}
      textColor={isDark ? theme.colors.gray[2] : theme.colors.dark[7]}
      withTooltip={false}
      withBarValueLabel
      xAxisProps={{
        tick: <CustomizedAxisTick />,
        label: {
          value: i18n._t('Yaku collected over all time'),
          offset: -20,
          position: 'insideBottom',
          style: {
            fontFamily: '"PT Sans Narrow", Arial',
            fontSize: 16,
          },
        },
      }}
      yAxisProps={{
        interval: 0,
        tick: { fontSize: 16 },
        width: 150,
      }}
    />
  );
};

export { YakuGraph as default }; // for React.lazy
