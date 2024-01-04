import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  PointElement,
  Tooltip,
  LinearScale,
  Title,
  Legend,
  Filler,
} from 'chart.js';
import { Line as LineGraph } from 'react-chartjs-2';
ChartJS.register(
  Tooltip,
  LineElement,
  CategoryScale,
  PointElement,
  LinearScale,
  Title,
  Legend,
  Filler
);
ChartJS.defaults.font.size = 16;
ChartJS.defaults.font.family = '"PT Sans Narrow", Arial';

export default LineGraph;
