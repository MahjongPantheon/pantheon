import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { Router } from 'wouter';
import { StorageStrategyClient } from '../../Common/storageStrategyClient';
import { Isomorphic } from './hooks/isomorphic';
import useLocation from 'wouter/use-location';
import { Layout } from './Layout';

const storageStrategy = new StorageStrategyClient(import.meta.env.VITE_COOKIE_DOMAIN || null);

let isomorphicCtxValue = { __running: 0 };
if (window && (window as any).initialData) {
  isomorphicCtxValue = (window as any).initialData;
  isomorphicCtxValue.__running = 0;
}

if (import.meta.env.MODE === 'development') {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Isomorphic.Provider value={isomorphicCtxValue}>
        <Router hook={useLocation}>
          <Layout storageStrategy={storageStrategy}>
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
          <Layout storageStrategy={storageStrategy}>
            <App />
          </Layout>
        </Router>
      </Isomorphic.Provider>
    </React.StrictMode>
  );
}
