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
import { Paper, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { HandValueStat } from '../clients/proto/atoms.pb';
import { ChartTooltipProps } from '@mantine/charts';
import { I18nService } from 'services/i18n';
import { CustomizedAxisTick } from './LineGraph';

const BarGraph = React.lazy(() => import('./BarGraph'));

interface ChartTooltipExtendedProps extends ChartTooltipProps {
  i18n: I18nService;
}

function ChartTooltip({ label, payload, i18n }: ChartTooltipExtendedProps) {
  if (!payload) return null;

  return (
    <Paper px='md' py='sm' withBorder shadow='md' radius='md'>
      <Text fw={500} mb={5}>
        {i18n._t('%1 han', [label as string])}
      </Text>
      {payload.map((item: any) => (
        <Text key={item.name} fz='sm'>
          {i18n._t('Amount')}: {item.value}
        </Text>
      ))}
    </Paper>
  );
}

export const HandsGraph = ({ handValueStat }: { handValueStat?: HandValueStat[] }) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  if (!handValueStat) {
    return null;
  }

  const hands: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
  };
  handValueStat.forEach((item) => (hands[item.hanCount] = item.count));
  let yakumanCount = 0;

  const handValueStats = [];
  Object.entries(hands).forEach(([hanStr, count]) => {
    const han = parseInt(hanStr, 10);
    if (han >= 0) {
      handValueStats.push({ x: han.toString(), count });
    } else {
      yakumanCount += count;
    }
  });

  handValueStats.push({ x: '★', count: yakumanCount > 0 ? yakumanCount : 0 });

  return (
    <BarGraph
      barChartProps={{ margin: { bottom: 32 } }}
      data={handValueStats}
      dataKey='x'
      getBarColor={() => (isDark ? 'blue.8' : 'blue.3')}
      gridAxis='xy'
      h={500}
      series={[{ name: 'count' }]}
      textColor={isDark ? theme.colors.gray[2] : theme.colors.dark[7]}
      tooltipProps={{
        content: ({ label, payload }) => (
          <ChartTooltip label={label} payload={payload} i18n={i18n} />
        ),
      }}
      xAxisProps={{
        tick: <CustomizedAxisTick />,
        label: {
          value: i18n._t('Hands value'),
          offset: -20,
          position: 'insideBottom',
          style: {
            fontFamily: '"PT Sans Narrow", Arial',
            fontSize: 16,
          },
        },
      }}
      yAxisProps={{ allowDecimals: false, tick: { fontSize: 16 } }}
    />
  );
};

export { HandsGraph as default }; // for React.lazy
