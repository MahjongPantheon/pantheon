import { Bar as BarGraph } from 'react-chartjs-2';
import * as React from 'react';
import { useI18n } from '../hooks/i18n';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  Title,
} from 'chart.js';
import { HandValueStat } from '../clients/proto/atoms.pb';
ChartJS.register(Tooltip, BarElement, BarController, CategoryScale, LinearScale, Title);
ChartJS.defaults.font.size = 16;
ChartJS.defaults.font.family = '"PT Sans Narrow", Arial';

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
  for (let i = 1; i < 13; i++) {
    if (hands[i] >= 0) {
      handValueStats.push({ x: i.toString(), y: hands[i] });
    } else {
      yakumanCount += hands[i];
    }
  }

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
