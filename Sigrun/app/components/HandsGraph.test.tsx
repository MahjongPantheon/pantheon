import * as React from 'react';
import type { BarChartProps } from '@mantine/charts';
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

it('keeps empty han buckets and combines single and multiple yakuman', async () => {
  render(
    <MantineProvider>
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
  expect(chartProps.data).toHaveLength(13);
  expect(chartProps.data[0]).toEqual({ x: '1', count: 5 });
  expect(chartProps.data[1]).toEqual({ x: '2', count: 0 });
  expect(chartProps.data[3]).toEqual({ x: '4', count: 2 });
  expect(chartProps.data[12]).toEqual({ x: '★', count: 4 });
  expect(chartProps.yAxisProps?.allowDecimals).toBe(false);
});
