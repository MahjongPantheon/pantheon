import zoomPlugin from "chartjs-plugin-zoom";
import { Chart, LineElement, Tooltip, CategoryScale, PointElement, LinearScale, Title } from "chart.js";
import { Line } from "react-chartjs-2";
import { Line as Line2 } from "react-chartjs-2";
Chart.register(LineElement, Tooltip, CategoryScale, PointElement, LinearScale, Title, zoomPlugin);
Chart.defaults.font.size = 16;
Chart.defaults.font.family = '"PT Sans Narrow", Arial';
export {
  Line2 as default
};
