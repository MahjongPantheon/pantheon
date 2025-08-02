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

import { useEffect, useRef } from 'react';
import * as React from 'react';
import { useI18n } from '../hooks/i18n';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import starSvg from '../../assets/img/star.svg';
import { PlayersGetPlayerStatsResponse } from 'tsclients/proto/mimir.pb';
import { SessionHistoryResultTable } from 'tsclients/proto/atoms.pb';
const LineGraph = React.lazy(() => import('./LineGraph'));

export const RatingGraph = ({
  playerId,
  playerStats,
  onSelectGame,
  lastSelectionX,
  setLastSelectionX,
  lastSelectionHash,
  setLastSelectionHash,
}: {
  playerId: number;
  playerStats?: PlayersGetPlayerStatsResponse;
  onSelectGame: (game: SessionHistoryResultTable) => void;
  lastSelectionX: number | null;
  setLastSelectionX: (x: number | null) => void;
  lastSelectionHash: string | null;
  setLastSelectionHash: (hash: string | null) => void;
}) => {
  const i18n = useI18n();
  const theme = useMantineTheme();
  const isDark = useMantineColorScheme().colorScheme === 'dark';

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
    const idx =
      playerStats?.scoreHistory?.findIndex((v) => v.tables[0].sessionHash === lastSelectionHash) ??
      null;
    if (idx !== null) {
      setLastSelectionX(1 + idx);
    } else {
      setLastSelectionX(null);
    }
  }, [playerId, playerStats]);

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
        onClick: (e: any) => {
          // @ts-expect-error
          const d = getElementAtEvent(chartRef.current!, { nativeEvent: e });
          if (d.length) {
            const { index } = d[0];
            setLastSelectionX(index);
            setLastSelectionHash(games?.[gamesIdx[index - 1]].tables[0].sessionHash ?? null);
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
            radius: (context: any) =>
              lastSelectionX && context.dataIndex === lastSelectionX ? 8 : 3,
            hoverRadius: 8,
            hoverBorderWidth: 1,
            pointStyle: (context: any) => {
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

function getElementAtEvent(chart: any /* ChartJS*/, event: React.MouseEvent<HTMLCanvasElement>) {
  return chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: false }, false);
}

export { RatingGraph as default }; // for React.lazy
