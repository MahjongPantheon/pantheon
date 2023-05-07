import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { StorageStrategyClient } from '../../Common/storageStrategyClient';

const storageStrategy = new StorageStrategyClient(import.meta.env.COOKIE_DOMAIN || null);

if (import.meta.env.MODE === 'development') {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App storageStrategy={storageStrategy} />
    </React.StrictMode>
  );
} else {
  ReactDOM.hydrateRoot(
    document.getElementById('root') as HTMLElement,
    <React.StrictMode>
      <App storageStrategy={storageStrategy} />
    </React.StrictMode>
  );
}
