import * as React from 'react';
import type { LineChartProps } from '@mantine/charts';
import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayersGetPlayerStatsResponse } from 'tsclients/proto/mimir.pb';
import { RatingGraph } from './RatingGraph';

let chartProps: LineChartProps;
vi.mock('./LineGraph', () => ({
  default: (props: LineChartProps) => {
    chartProps = props;
    return <div data-testid='rating-chart' />;
  },
}));

beforeEach(() => {
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

async function setup(overrides: Partial<React.ComponentProps<typeof RatingGraph>> = {}) {
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
    <MantineProvider>
      <React.Suspense fallback={null}>
        <RatingGraph {...next} />
      </React.Suspense>
    </MantineProvider>
  );
  const view = render(tree());
  await screen.findByTestId('rating-chart');
  return { props, ...view, tree };
}

function clickCategory(label: number | string | undefined, visibleIndex = 0) {
  chartProps.lineChartProps?.onClick?.(
    {
      activeLabel: label,
      activeTooltipIndex: visibleIndex,
      activeIndex: visibleIndex,
      isTooltipActive: true,
      activeDataKey: 'rating',
      activeCoordinate: undefined,
    },
    {} as React.MouseEvent<SVGGraphicsElement>
  );
}

describe('rating history selection', () => {
  it('selects the original game after brushing and ignores the initial rating and missing points', async () => {
    const { props } = await setup();
    expect(chartProps.withBrush).toBe(true);
    clickCategory('3', 0);
    expect(props.onSelectGame).toHaveBeenCalledWith(stats.scoreHistory[2]);
    expect(props.setLastSelectionX).toHaveBeenLastCalledWith(3);
    expect(props.setLastSelectionHash).toHaveBeenLastCalledWith('third');
    clickCategory(0);
    clickCategory(undefined);
    clickCategory(99);
    const brush = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    brush.setAttribute('class', 'recharts-brush');
    chartProps.lineChartProps?.onClick?.(
      { activeLabel: 2 } as Parameters<
        NonNullable<NonNullable<LineChartProps['lineChartProps']>['onClick']>
      >[0],
      { target: brush } as unknown as React.MouseEvent<SVGGraphicsElement>
    );
    expect(props.onSelectGame).toHaveBeenCalledTimes(1);
  });

  it('restores valid selections and clears a missing game when the player changes', async () => {
    const { props, rerender, tree } = await setup({ lastSelectionHash: 'second' });
    expect(props.setLastSelectionX).toHaveBeenLastCalledWith(2);
    rerender(tree({ ...props, playerId: 2, playerStats: { ...stats, scoreHistory: [] } }));
    expect(props.setLastSelectionX).toHaveBeenLastCalledWith(null);
  });

  it('renders winning stars and enlarges the selection made by external controls', async () => {
    const { props, rerender, tree } = await setup({ lastSelectionX: 1 });
    const dots = () => {
      const line = chartProps.lineProps;
      if (!line || typeof line === 'function' || typeof line.dot !== 'function')
        throw new Error('Missing custom dots');
      const dot = line.dot;
      return (
        <svg>
          {chartProps.data.map((payload) =>
            dot({
              cx: payload.x * 10,
              cy: 10,
              payload,
              points: [],
              index: payload.x,
              dataKey: 'rating',
              value: payload.rating,
            })
          )}
        </svg>
      );
    };
    const chartData = chartProps.data;
    const dotView = render(dots());
    expect(dotView.container.querySelector('image')?.getAttribute('width')).toBe('32');
    rerender(tree({ ...props, lastSelectionX: 2 }));
    expect(chartProps.data).toBe(chartData);
    dotView.rerender(dots());
    expect(dotView.container.querySelector('image')?.getAttribute('width')).toBe('20');
    expect(dotView.container.querySelectorAll('circle')[1].getAttribute('r')).toBe('8');
  });
});
