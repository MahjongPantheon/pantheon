import { useEffect, useRef, useState } from 'react';
import { Line as LineGraph } from 'react-chartjs-2';
import * as React from 'react';
import { useI18n } from '../hooks/i18n';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import starSvg from '../../assets/img/star.svg';
import { PlayersGetPlayerStatsResponse } from '../clients/proto/mimir.pb';
import {
  Chart as ChartJS,
  CategoryScale,
  LineElement,
  PointElement,
  LinearScale,
  Title,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { SessionHistoryResultTable } from '../clients/proto/atoms.pb';
ChartJS.register(LineElement, CategoryScale, PointElement, LinearScale, Title, zoomPlugin);
ChartJS.defaults.font.size = 16;
ChartJS.defaults.font.family = '"PT Sans Narrow", Arial';

export const RatingGraph = ({
  playerId,
  playerStats,
  onSelectGame,
}: {
  playerId: number;
  playerStats?: PlayersGetPlayerStatsResponse;
  onSelectGame: (game: SessionHistoryResultTable) => void;
}) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';
  const [lastSelectionX, setLastSelectionX] = useState<number | null>(null);

  const games = playerStats?.scoreHistory;
  const points = (playerStats?.ratingHistory ?? []).map((item, idx) => ({
    x: idx,
    y: Math.floor(item),
  }));

  const ticks = [];
  for (let idx = 0; idx < points.length; idx++) {
    ticks.push(idx);
  }

  const gamesIdx: number[] = [];
  games?.forEach((g, idx) => gamesIdx.push(idx));
  const chartRef = useRef();

  useEffect(() => {
    if (!(window as any).__ratingStarIcon) {
      const ico = new Image();
      ico.src = starSvg;
      ico.height = 20;
      ico.width = 20;
      (window as any).__ratingStarIcon = ico;

      const icoBig = new Image();
      icoBig.src = starSvg;
      icoBig.height = 32;
      icoBig.width = 32;
      (window as any).__ratingStarIconBig = icoBig;
    }
  });

  return (
    <LineGraph
      ref={chartRef}
      data={{ labels: ticks, datasets: [{ data: points }] }}
      options={{
        interaction: {
          mode: 'nearest',
        },
        backgroundColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        borderColor: isDark ? theme.colors.blue[8] : theme.colors.blue[3],
        color: isDark ? theme.colors.gray[2] : theme.colors.dark[7],
        font: { size: 16, family: '"PT Sans Narrow", Arial' },
        onClick: (e) => {
          // @ts-expect-error
          const d = getElementAtEvent(chartRef.current!, { nativeEvent: e });
          if (d.length) {
            const { index } = d[0];
            setLastSelectionX(index);
            if (games?.[gamesIdx[index - 1]]) {
              onSelectGame(games?.[gamesIdx[index - 1]]);
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: 'x',
            },
          },
        },
        elements: {
          point: {
            radius: (context) => (context.dataIndex === lastSelectionX ? 8 : 3),
            hoverRadius: 8,
            hoverBorderWidth: 1,
            pointStyle: (context) => {
              if (context.dataIndex === 0) {
                return undefined;
              }
              if (
                games?.[gamesIdx[context.dataIndex - 1]].tables.every(
                  (v) => v.playerId === playerId || v.ratingDelta < 0
                )
              ) {
                return context.dataIndex === lastSelectionX
                  ? (window as any).__ratingStarIconBig
                  : (window as any).__ratingStarIcon;
              }
              return undefined;
            },
          },
          line: { tension: 0.3 },
        },
        scales: {
          x: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3],
            },
            position: 'bottom',
            title: {
              display: true,
              text: i18n._t('Games played'),
            },
          },
          y: {
            grid: {
              color: isDark ? theme.colors.gray[8] : theme.colors.gray[3],
            },
            position: 'left',
            title: {
              display: true,
              text: i18n._t('Rating'),
            },
          },
        },
      }}
    />
  );
};

function getElementAtEvent(chart: ChartJS, event: React.MouseEvent<HTMLCanvasElement>) {
  return chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: false }, false);
}
