import { lazy, Suspense } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

vi.mock('react-chartjs-2', () => ({ Bar: () => <canvas data-testid='bar-canvas' /> }));
afterEach(cleanup);

it('renders when a stats graph imports the chart wrapper through React.lazy', async () => {
  const BarGraph = lazy(() => import('./BarGraph'));
  render(
    <Suspense fallback={null}>
      <BarGraph data={{ datasets: [{ data: [{ x: '1', y: 5 }] }] }} />
    </Suspense>
  );
  expect(await screen.findByTestId('bar-canvas')).toBeTruthy();
});
