/*  Sigrun: rating tables and statistics frontend
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
import { i18n } from './hooks/i18n';
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
i18n.init(
  (locale) => {
    storage.setLang(locale);
  },
  (err) => console.error(err)
);

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
