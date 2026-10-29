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

import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import type { ChartOptions } from 'chart.js';
import { useI18n } from '../hooks/i18n';
import { RangeSlider, useMantineColorScheme, useMantineTheme } from '@mantine/core';
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
  const gridColor = isDark ? theme.colors.gray[8] : theme.colors.gray[3];
  const textColor = isDark ? theme.colors.gray[2] : theme.colors.dark[7];
  const games = playerStats?.scoreHistory;
  const data = useMemo(
    () => ({
      labels: (playerStats?.ratingHistory ?? []).map((_, index) => index),
      datasets: [{ data: (playerStats?.ratingHistory ?? []).map(Math.floor) }],
    }),
    [playerStats?.ratingHistory]
  );
  const [stars, setStars] = useState<HTMLImageElement[] | null>(null);
  const maxIndex = Math.max(0, data.labels.length - 1);
  const [rangeSelection, setRangeSelection] = useState<{
    playerId: number;
    history: PlayersGetPlayerStatsResponse['ratingHistory'] | undefined;
    value: [number, number];
  } | null>(null);
  const range: [number, number] =
    rangeSelection?.playerId === playerId && rangeSelection.history === playerStats?.ratingHistory
      ? rangeSelection.value
      : [0, maxIndex];

  useEffect(() => {
    let cancelled = false;
    const icons = [20, 32].map((size) => {
      const icon = new Image(size, size);
      return icon;
    });
    let loaded = 0;
    icons.forEach((icon) => {
      icon.onload = () => {
        loaded++;
        if (loaded === icons.length && !cancelled) setStars(icons);
      };
      icon.src = starSvg;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const index = lastSelectionHash
      ? (games?.findIndex((game) => game.tables[0]?.sessionHash === lastSelectionHash) ?? -1)
      : -1;
    setLastSelectionX(index >= 0 ? index + 1 : null);
  }, [playerId, games, lastSelectionHash, setLastSelectionX]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false },
    backgroundColor: color,
    borderColor: color,
    color: textColor,
    onClick: (_, elements) => {
      const index = elements[0]?.index;
      if (index === undefined || index < 1) return;
      const game = games?.[index - 1];
      if (!game?.tables[0]) return;
      setLastSelectionX(index);
      setLastSelectionHash(game.tables[0].sessionHash);
      onSelectGame(game);
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      // Pinch recognition sets touch-action:none, which also blocks one-finger page scrolling.
      zoom: { zoom: { wheel: { enabled: false }, pinch: { enabled: false }, mode: 'x' } },
    },
    elements: {
      point: {
        radius: (context) => (context.dataIndex === lastSelectionX ? 8 : 3),
        hoverRadius: 8,
        hoverBorderWidth: 1,
        pointStyle: (context) => {
          const game = games?.[context.dataIndex - 1];
          const winning =
            !!game?.tables.length &&
            game.tables.every((seat) => seat.playerId === playerId || seat.ratingDelta < 0);
          return winning && stars ? stars[context.dataIndex === lastSelectionX ? 1 : 0] : 'circle';
        },
      },
      line: { tension: 0.3 },
    },
    scales: {
      x: {
        min: range[0],
        max: range[1],
        grid: { color: gridColor },
        ticks: { color: textColor, maxRotation: 0 },
        title: { display: true, text: i18n._t('Games played'), color: textColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, precision: 0 },
        title: { display: true, text: i18n._t('Rating'), color: textColor },
      },
    },
  };

  return (
    <div>
      <div style={{ position: 'relative', height: 400 }}>
        <LineGraph key={playerId} data={data} options={options} />
      </div>
      {maxIndex > 1 && (
        <div style={{ padding: '0 8px 8px' }}>
          <RangeSlider
            min={0}
            max={maxIndex}
            step={1}
            minRange={1}
            pushOnOverlap={false}
            size='xs'
            thumbSize={14}
            value={range}
            thumbFromLabel={i18n._t('First displayed game')}
            thumbToLabel={i18n._t('Last displayed game')}
            onChange={(value) =>
              setRangeSelection({
                playerId,
                history: playerStats?.ratingHistory,
                value,
              })
            }
          />
        </div>
      )}
    </div>
  );
};

export { RatingGraph as default }; // for React.lazy
