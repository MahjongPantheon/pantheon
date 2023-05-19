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
import { YakuId, yakuList } from '../helpers/yaku';
import { YakuStat } from '../clients/proto/atoms.pb';
ChartJS.register(Tooltip, BarElement, BarController, CategoryScale, LinearScale, Title);
ChartJS.defaults.font.size = 16;
ChartJS.defaults.font.family = '"PT Sans Narrow", Arial';

export const YakuGraph = ({ yakuStat }: { yakuStat?: YakuStat[] }) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

  if (!yakuStat) {
    return null;
  }

  const yakuNames = {} as Record<YakuId, string>;
  const yaku = Object.values(yakuList).reduce((acc, y) => {
    yakuNames[y.id] = y.name(i18n);
    acc.set(y.id, 0);
    return acc;
  }, new Map<YakuId, number>());
  let totalYakuhai = 0;

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
      return { x: value, y: yakuNames[key] };
    })
    .filter((v) => v.x > 0);

  if (totalYakuhai > 0) {
    yakuStats.push({ x: totalYakuhai, y: i18n._t('Yakuhai: total') });
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
          },
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
