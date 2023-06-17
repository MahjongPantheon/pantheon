import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  PointElement,
  Tooltip,
  LinearScale,
  Title,
  Legend,
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
  Legend
);
ChartJS.defaults.font.size = 16;
ChartJS.defaults.font.family = '"PT Sans Narrow", Arial';

export default BarGraph;
