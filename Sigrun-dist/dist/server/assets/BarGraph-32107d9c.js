import zoomPlugin from "chartjs-plugin-zoom";
import { Chart, Tooltip, BarElement, BarController, CategoryScale, PointElement, LinearScale, Title } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Bar as Bar2 } from "react-chartjs-2";
Chart.register(
  Tooltip,
  BarElement,
  BarController,
  CategoryScale,
  PointElement,
  LinearScale,
  Title,
  zoomPlugin
);
Chart.defaults.font.size = 16;
Chart.defaults.font.family = '"PT Sans Narrow", Arial';
export {
  Bar2 as default
};
