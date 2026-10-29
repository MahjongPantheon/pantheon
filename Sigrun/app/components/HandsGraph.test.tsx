import * as React from 'react';
import type { ChartProps } from 'react-chartjs-2';
type BarChartProps = Omit<ChartProps<'bar', { x: string; y: number }[]>, 'type'>;
import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HandsGraph } from './HandsGraph';

let chartProps: BarChartProps;
vi.mock('./BarGraph', () => ({
  default: (props: BarChartProps) => {
    chartProps = props;
    return <div data-testid='hands-chart' />;
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

it.each(['light', 'dark'] as const)(
  'keeps han buckets and combines yakuman in %s mode',
  async (colorScheme) => {
    render(
      <MantineProvider forceColorScheme={colorScheme}>
        <React.Suspense fallback={null}>
          <HandsGraph
            handValueStat={[
              { hanCount: 1, count: 5 },
              { hanCount: 4, count: 2 },
              { hanCount: -1, count: 3 },
              { hanCount: -2, count: 1 },
            ]}
          />
        </React.Suspense>
      </MantineProvider>
    );
    await screen.findByTestId('hands-chart');
    const points = chartProps.data.datasets[0].data;
    expect(points).toHaveLength(13);
    expect(points[0]).toEqual({ x: '1', y: 5 });
    expect(points[1]).toEqual({ x: '2', y: 0 });
    expect(points[3]).toEqual({ x: '4', y: 2 });
    expect(points[12]).toEqual({ x: '★', y: 4 });
    expect(chartProps.options?.scales?.y?.ticks).toEqual(expect.objectContaining({ precision: 0 }));
  }
);
