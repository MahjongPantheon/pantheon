import { lazy } from 'react';

const BarGraph = lazy(async () => {
  const [
    { Chart, BarController, BarElement, CategoryScale, Tooltip, LinearScale, Title },
    { Bar },
  ] = await Promise.all([import('chart.js'), import('react-chartjs-2')]);
  Chart.register(Tooltip, BarElement, BarController, CategoryScale, LinearScale, Title);
  Chart.defaults.font.size = 16;
  Chart.defaults.font.family = '"PT Sans Narrow", Arial';
  return { default: Bar };
});

export default BarGraph;
