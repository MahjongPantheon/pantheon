import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Chart as ChartJS,
  CategoryScale,
  LineElement,
  PointElement,
  Tooltip,
  LinearScale,
  Title,
} from 'chart.js';
import { Line as LineGraph } from 'react-chartjs-2';
ChartJS.register(LineElement, Tooltip, CategoryScale, PointElement, LinearScale, Title, zoomPlugin);
ChartJS.defaults.font.size = 16;
ChartJS.defaults.font.family = '"PT Sans Narrow", Arial';

export default LineGraph;
