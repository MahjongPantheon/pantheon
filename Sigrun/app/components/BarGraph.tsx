import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  PointElement,
  Tooltip,
  LinearScale,
  Title,
} from 'chart.js';
import { Bar as BarGraph } from 'react-chartjs-2';
ChartJS.register(
  Tooltip,
  BarElement,
  BarController,
  CategoryScale,
  PointElement,
  LinearScale,
  Title,
  zoomPlugin
);
ChartJS.defaults.font.size = 16;
ChartJS.defaults.font.family = '"PT Sans Narrow", Arial';

export default BarGraph;
