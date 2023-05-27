import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { Router } from 'wouter';
import { StorageStrategyClient } from '../../Common/storageStrategyClient';
import { Isomorphic } from './hooks/isomorphic';
import useLocation from 'wouter/use-location';
import { Layout } from './Layout';
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LineElement,
  PointElement,
  Tooltip,
  LinearScale,
  Title,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line as LineGraph, Bar as BarGraph } from 'react-chartjs-2';
import { storage } from './hooks/storage';
ChartJS.register(
  LineElement,
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

(window as any).__chart = { LineGraph, BarGraph };

const storageStrategy = new StorageStrategyClient(import.meta.env.VITE_COOKIE_DOMAIN || null);
storage.setStrategy(storageStrategy);

let isomorphicCtxValue = { __running: 0 };
if (window && (window as any).initialData) {
  isomorphicCtxValue = (window as any).initialData;
  isomorphicCtxValue.__running = 0;
}

window.addEventListener('error', (event) => {
  if (event.message.includes('React error #419')) {
    event.preventDefault();
  }
});

if (import.meta.env.MODE === 'development') {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Isomorphic.Provider value={isomorphicCtxValue}>
        <Router hook={useLocation}>
          <Layout>
            <App />
          </Layout>
        </Router>
      </Isomorphic.Provider>
    </React.StrictMode>
  );
} else {
  ReactDOM.hydrateRoot(
    document.getElementById('root') as HTMLElement,
    <React.StrictMode>
      <Isomorphic.Provider value={isomorphicCtxValue}>
        <Router hook={useLocation}>
          <Layout>
            <App />
          </Layout>
        </Router>
      </Isomorphic.Provider>
    </React.StrictMode>
  );
}
