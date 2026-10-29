import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Chart } from 'chart.js';
import LineGraph from './LineGraph';

const { loadZoom } = vi.hoisted(() => ({ loadZoom: vi.fn() }));
vi.mock('chartjs-plugin-zoom', () => {
  loadZoom();
  return { default: { id: 'zoom' } };
});
vi.mock('react-chartjs-2', () => ({ Line: () => <canvas data-testid='line-canvas' /> }));
afterEach(cleanup);

it('keeps the browser-only zoom dependency out of server rendering', () => {
  expect(renderToString(<LineGraph data={{ datasets: [] }} />)).toBe('');
  expect(loadZoom).not.toHaveBeenCalled();
});

it('registers zoom before creating the client chart', async () => {
  render(
    <Suspense fallback={null}>
      <LineGraph data={{ datasets: [] }} />
    </Suspense>
  );
  await screen.findByTestId('line-canvas');
  expect(loadZoom).toHaveBeenCalledOnce();
  expect(Chart.registry.getPlugin('zoom')?.id).toBe('zoom');
});

it('still renders the chart if the optional zoom chunk fails to load', async () => {
  vi.resetModules();
  vi.doMock('chartjs-plugin-zoom', () => {
    throw new Error('Zoom chunk unavailable');
  });
  try {
    const { default: FallbackGraph } = await import('./LineGraph');
    render(
      <Suspense fallback={null}>
        <FallbackGraph data={{ datasets: [] }} />
      </Suspense>
    );
    await screen.findByTestId('line-canvas');
  } finally {
    vi.doUnmock('chartjs-plugin-zoom');
  }
});
