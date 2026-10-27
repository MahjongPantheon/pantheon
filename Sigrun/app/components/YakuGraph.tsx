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
import { YakuStat } from 'tsclients/proto/atoms.pb';

const BarGraph = React.lazy(() => import('./BarGraph'));

export const YakuGraph = ({ yakuStat }: { yakuStat?: YakuStat[] }) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  const yakuNameMap = yakuNameMapGen(i18n);
  const yaku = Object.values(yakuList).reduce((acc, y) => {
    acc.set(y.id, 0);
    return acc;
  }, new Map<YakuId, number>());
  let totalYakuhai = 0;

  if (!yakuStat) {
    return null;
  }

  yakuStat.forEach((stat) => {
    yaku.set(stat.yakuId, stat.count);
    switch (stat.yakuId) {
      case YakuId.EAST_SEAT_WIND:
      case YakuId.EAST_ROUND_WIND:
      case YakuId.SOUTH_SEAT_WIND:
      case YakuId.SOUTH_ROUND_WIND:
      case YakuId.WEST_SEAT_WIND:
      case YakuId.WEST_ROUND_WIND:
      case YakuId.NORTH_SEAT_WIND:
      case YakuId.NORTH_ROUND_WIND:
      case YakuId.RED_DRAGON:
      case YakuId.GREEN_DRAGON:
      case YakuId.WHITE_DRAGON:
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

  const yakuStatsHeight = 40 + 24 * (yakuStats.length < 3 ? 3 : yakuStats.length);
  return (
    <div style={{ position: 'relative', height: `${yakuStatsHeight}px` }}>
      <BarGraph
        h={yakuStatsHeight}
        data={yakuStats}
        dataKey='yaku'
        orientation='vertical'
        series={[{ name: 'count', color: isDark ? 'blue.8' : 'blue.3' }]}
        gridAxis='xy'
        textColor={isDark ? theme.colors.gray[2] : theme.colors.dark[7]}
        xAxisLabel={i18n._t('Yaku collected over all time')}
        xAxisProps={{ allowDecimals: false }}
        yAxisProps={{ interval: 0, width: 150 }}
        barChartProps={{ margin: { right: 32, bottom: 30 } }}
        withTooltip={false}
        valueFormatter={(value) => String(value)}
        withBarValueLabel
      />
    </div>
  );
};

export { YakuGraph as default }; // for React.lazy
