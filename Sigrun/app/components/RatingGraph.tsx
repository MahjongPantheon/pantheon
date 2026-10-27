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

import { useEffect, useMemo } from 'react';
import * as React from 'react';
import type { LineChartProps } from '@mantine/charts';
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
  const color = isDark ? theme.colors.blue[8] : theme.colors.blue[3];
  const games = playerStats?.scoreHistory;
  const points = useMemo(
    () =>
      (playerStats?.ratingHistory ?? []).map((item, idx) => ({
        x: idx,
        rating: Math.floor(item),
        winning:
          idx > 0 &&
          !!games?.[idx - 1]?.tables.length &&
          games[idx - 1].tables.every((v) => v.playerId === playerId || v.ratingDelta < 0),
      })),
    [playerStats?.ratingHistory, games, playerId]
  );

  useEffect(() => {
    const idx = lastSelectionHash
      ? (games?.findIndex((v) => v.tables[0]?.sessionHash === lastSelectionHash) ?? -1)
      : -1;
    setLastSelectionX(idx >= 0 ? idx + 1 : null);
  }, [playerId, games, lastSelectionHash, setLastSelectionX]);

  const handleClick: NonNullable<LineChartProps['lineChartProps']>['onClick'] = (data, event) => {
    if (event.target instanceof Element && event.target.closest('.recharts-brush')) return;
    // The category is the original game index even when the brush slices the data.
    const index = Number(data.activeLabel);
    if (data.activeLabel === undefined || !Number.isInteger(index) || index < 1) return;
    const game = games?.[index - 1];
    if (!game?.tables[0]) return;
    setLastSelectionX(index);
    setLastSelectionHash(game.tables[0].sessionHash);
    onSelectGame(game);
  };

  const renderDot = (
    {
      cx,
      cy,
      payload,
    }: {
      cx?: number;
      cy?: number;
      payload?: { x: number; winning: boolean };
    },
    active = false
  ) => {
    if (cx === undefined || cy === undefined || !payload) return <g />;
    const selected = payload.x === lastSelectionX;
    const size = selected || active ? 32 : 20;
    return payload.winning ? (
      <image
        key={payload.x}
        href={starSvg}
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
      />
    ) : (
      <circle
        key={payload.x}
        cx={cx}
        cy={cy}
        r={selected || active ? 8 : 3}
        fill={color}
        stroke={color}
      />
    );
  };

  return (
    <LineGraph
      key={playerId}
      h={400}
      data={points}
      dataKey='x'
      series={[{ name: 'rating', label: i18n._t('Rating'), color: isDark ? 'blue.8' : 'blue.3' }]}
      gridAxis='xy'
      textColor={isDark ? theme.colors.gray[2] : theme.colors.dark[7]}
      tooltipProps={{ labelFormatter: () => null }}
      styles={{ tooltipBody: { paddingTop: 'var(--mantine-spacing-sm)' } }}
      yAxisLabel={i18n._t('Rating')}
      xAxisProps={{
        allowDecimals: false,
        height: 55,
        label: {
          value: i18n._t('Games played'),
          position: 'insideBottom',
          offset: 0,
          fill: 'currentColor',
          fontSize: 12,
        },
      }}
      yAxisProps={{ allowDecimals: false, width: 65, domain: ['auto', 'auto'] }}
      lineChartProps={{ onClick: handleClick, margin: { top: 16, left: 16, right: 16, bottom: 8 } }}
      lineProps={{ dot: (props) => renderDot(props), activeDot: (props) => renderDot(props, true) }}
      withBrush={points.length > 1}
      brushProps={{ height: 30, travellerWidth: 10 }}
    />
  );
};

export { RatingGraph as default }; // for React.lazy
