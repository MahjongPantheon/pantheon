import * as React from 'react';
import type { Chart, ChartEvent, ActiveElement, ScriptableContext } from 'chart.js';
import type { ChartProps } from 'react-chartjs-2';
import { MantineProvider } from '@mantine/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayersGetPlayerStatsResponse } from 'tsclients/proto/mimir.pb';
import { RatingGraph } from './RatingGraph';

let chartProps: Omit<ChartProps<'line'>, 'type'>;
let icons: HTMLImageElement[];
vi.mock('./LineGraph', () => ({
  default: (props: typeof chartProps) => {
    chartProps = props;
    return <div data-testid='rating-chart' />;
  },
}));
beforeEach(() => {
  icons = [];
  vi.stubGlobal('Image', function (width: number, height: number) {
    const icon = document.createElement('img');
    icon.width = width;
    icon.height = height;
    icons.push(icon);
    return icon;
  });
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const history = (hash: string, delta: number) => ({
  tables: [1, 2, 3, 4].map((playerId) => ({
    playerId,
    sessionHash: hash,
    eventId: 1,
    score: 0,
    ratingDelta: playerId === 1 ? -3 * delta : delta,
    place: playerId,
    title: String(playerId),
    hasAvatar: false,
    lastUpdate: '',
  })),
});
const stats: PlayersGetPlayerStatsResponse = {
  ...PlayersGetPlayerStatsResponse.decode(new Uint8Array()),
  ratingHistory: [1500, 1530, 1520, 1510],
  scoreHistory: [history('first', -10), history('second', 5), history('third', 5)],
};

async function setup(
  overrides: Partial<React.ComponentProps<typeof RatingGraph>> = {},
  colorScheme: 'light' | 'dark' = 'light'
) {
  const props = {
    playerId: 1,
    playerStats: stats,
    lastSelectionX: null,
    lastSelectionHash: null,
    setLastSelectionX: vi.fn(),
    setLastSelectionHash: vi.fn(),
    onSelectGame: vi.fn(),
    ...overrides,
  };
  const tree = (next = props) => (
    <MantineProvider forceColorScheme={colorScheme}>
      <React.Suspense fallback={null}>
        <RatingGraph {...next} />
      </React.Suspense>
    </MantineProvider>
  );
  const view = render(tree());
  await screen.findByTestId('rating-chart');
  return { props, ...view, tree };
}

function select(index?: number) {
  chartProps.options?.onClick?.(
    { type: 'click' } as ChartEvent,
    index === undefined ? [] : [{ index, datasetIndex: 0 } as ActiveElement],
    {} as Chart<'line'>
  );
}

describe('rating history selection', () => {
  it('handles unavailable statistics in dark mode without selecting an invalid game', async () => {
    const { props } = await setup({ playerStats: undefined, lastSelectionHash: 'missing' }, 'dark');
    expect(chartProps.data.datasets[0].data).toEqual([]);
    expect(props.setLastSelectionX).toHaveBeenLastCalledWith(null);
    select(1);
    expect(props.onSelectGame).not.toHaveBeenCalled();
  });
  it('selects every tapped game immediately from the current hit, including after zoom', async () => {
    const { props } = await setup();
    expect(chartProps.options?.interaction).toEqual({ mode: 'nearest', intersect: false });
    expect(chartProps.options?.plugins?.zoom?.zoom?.pinch?.enabled).toBe(true);
    expect(chartProps.options?.plugins?.zoom?.zoom?.wheel?.enabled).toBe(true);
    for (const index of [1, 3, 2]) {
      select(index);
      expect(props.onSelectGame).toHaveBeenLastCalledWith(stats.scoreHistory[index - 1]);
      expect(props.setLastSelectionX).toHaveBeenLastCalledWith(index);
      expect(props.setLastSelectionHash).toHaveBeenLastCalledWith(
        stats.scoreHistory[index - 1].tables[0].sessionHash
      );
    }
    select(0);
    select();
    select(99);
    expect(props.onSelectGame).toHaveBeenCalledTimes(3);
  });

  it('restores valid selections and clears a missing game when the player changes', async () => {
    const { props, rerender, tree } = await setup({ lastSelectionHash: 'second' });
    expect(props.setLastSelectionX).toHaveBeenLastCalledWith(2);
    rerender(tree({ ...props, playerId: 2, playerStats: { ...stats, scoreHistory: [] } }));
    expect(props.setLastSelectionX).toHaveBeenLastCalledWith(null);
  });

  it('renders winning stars and enlarges selections made by the preview controls', async () => {
    const { props, rerender, tree } = await setup({ lastSelectionX: 1 });
    const point = (property: 'pointStyle' | 'radius', index: number) => {
      const value = chartProps.options?.elements?.point?.[property];
      if (typeof value !== 'function') throw new Error('Missing point callback');
      return value({ dataIndex: index } as ScriptableContext<'line'>, {});
    };
    expect(point('pointStyle', 1)).toBe('circle');
    fireEvent.load(icons[0]);
    fireEvent.load(icons[1]);
    expect(point('pointStyle', 0)).toBe('circle');
    expect(point('pointStyle', 1)).toBe(icons[1]);
    expect(point('radius', 1)).toBe(8);
    const data = chartProps.data;
    rerender(tree({ ...props, lastSelectionX: 2 }));
    expect(chartProps.data).toBe(data);
    expect(point('pointStyle', 1)).toBe(icons[0]);
    expect(point('pointStyle', 2)).toBe('circle');
    expect(point('radius', 1)).toBe(3);
    expect(point('radius', 2)).toBe(8);
  });
});
