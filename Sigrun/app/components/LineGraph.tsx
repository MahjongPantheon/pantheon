import { lazy, useEffect, useState } from 'react';
import type { ChartProps } from 'react-chartjs-2';

const Line = lazy(async () => {
  const [
    { Chart, CategoryScale, LineElement, PointElement, Tooltip, LinearScale, Title },
    { Line: LineChart },
  ] = await Promise.all([import('chart.js'), import('react-chartjs-2')]);
  Chart.register(LineElement, Tooltip, CategoryScale, PointElement, LinearScale, Title);
  Chart.defaults.font.size = 16;
  Chart.defaults.font.family = '"PT Sans Narrow", Arial';
  return { default: LineChart };
});

export default function LineGraph(props: Omit<ChartProps<'line'>, 'type'>) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // Hammer.js requires a browser; register zoom before creating the chart, after SSR.
    void Promise.all([import('chart.js'), import('chartjs-plugin-zoom')])
      .then(([{ Chart }, { default: zoomPlugin }]) => {
        Chart.register(zoomPlugin);
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        // Keep basic selection usable if the optional zoom chunk fails to download.
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return ready ? <Line {...props} /> : null;
}
