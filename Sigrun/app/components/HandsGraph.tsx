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
import { HandValueStat } from 'tsclients/proto/atoms.pb';
const BarGraph = React.lazy(() => import('./BarGraph'));

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
      handValueStats.push({ x: han.toString(), y: count });
    } else {
      yakumanCount += count;
    }
  });

  handValueStats.push({ x: '★', y: yakumanCount > 0 ? yakumanCount : 0 });

  return (
    <BarGraph
      data={{ datasets: [{ data: handValueStats }] }}
      options={{
        backgroundColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        borderColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        color: isDark ? theme.colors.gray[2] : theme.colors.dark[7],
        font: { size: 16, family: '"PT Sans Narrow", Arial' },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3],
            },
            ticks: {
              autoSkip: false,
            },
            position: 'bottom',
            title: {
              display: true,
              text: i18n._t('Hands value'),
            },
          },
          y: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3],
            },
          },
        },
      }}
    />
  );
};

export { HandsGraph as default }; // for React.lazy
