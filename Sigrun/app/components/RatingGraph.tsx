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

import { useEffect } from 'react';
import * as React from 'react';
import { useI18n } from '../hooks/i18n';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import starSvg from '../../assets/img/star.svg';
import { PlayersGetPlayerStatsResponse } from '../clients/proto/mimir.pb';
import { SessionHistoryResultTable } from '../clients/proto/atoms.pb';
import { CustomizedAxisTick } from './LineGraph';
import { CategoricalChartState } from 'recharts/types/chart/types';
import { Brush } from 'recharts';

const LineGraph = React.lazy(() => import('./LineGraph'));

export const RatingGraph = ({
  playerId,
  playerStats,
  onSelectGame,
  setLastSelectionX,
  lastSelectionHash,
  setLastSelectionHash,
}: {
  playerId: number;
  playerStats?: PlayersGetPlayerStatsResponse;
  onSelectGame: (game: SessionHistoryResultTable) => void;
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

  const handleClick = (data: CategoricalChartState) => {
    const index = data?.activeTooltipIndex;

    if (!index) return;

    setLastSelectionX(index);
    setLastSelectionHash(games?.[gamesIdx[index - 1]]?.tables[0].sessionHash ?? null);
    if (games?.[gamesIdx[index - 1]]) {
      onSelectGame(games?.[gamesIdx[index - 1]]);
    }
  };

  useEffect(() => {
    const idx =
      playerStats?.scoreHistory?.findIndex((v) => v?.tables[0].sessionHash === lastSelectionHash) ??
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
      data={points}
      dataKey='x'
      dotProps={{ r: 4, stroke: isDark ? theme.colors.blue[8] : theme.colors.blue[3] }}
      activeDotProps={{ r: 8, fill: isDark ? theme.colors.blue[8] : theme.colors.blue[3] }}
      gridAxis='xy'
      h={500}
      lineChartProps={{
        margin: { bottom: 52, left: 24 },
        onClick: handleClick,
      }}
      series={[
        {
          name: 'y',
          label: i18n._t('Total points gained: '),
          color: isDark ? 'blue.8' : 'blue.3',
        },
      ]}
      valueFormatter={(value) => new Intl.NumberFormat('en-US').format(value)}
      textColor={isDark ? theme.colors.gray[2] : theme.colors.dark[7]}
      xAxisProps={{
        tick: <CustomizedAxisTick />,
        label: {
          value: i18n._t('Games played'),
          offset: -60,
          position: 'insideBottom',
          style: {
            fontFamily: '"PT Sans Narrow", Arial',
            fontSize: 16,
          },
        },
      }}
      yAxisProps={{
        label: {
          value: i18n._t('Rating'),
          angle: -90,
          offset: 20,
          position: 'left',
        },
        allowDecimals: false,
        tick: { fontSize: 16 },
      }}
      withPointLabels={true}
    >
      <Brush
        dataKey='x'
        height={30}
        stroke={isDark ? theme.colors.blue[8] : theme.colors.blue[3]}
        travellerWidth={10}
        startIndex={0}
        endIndex={points.length - 1}
      />
    </LineGraph>
  );
};

export { RatingGraph as default }; // for React.lazy
