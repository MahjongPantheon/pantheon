import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '#/App';
import { PageTitleProvider } from '#/hooks/pageTitle';
import { Layout } from '#/Layout';
import './index.css';
import { StorageProvider } from '#/hooks/storage';
import { ApiProvider } from '#/hooks/api';

const root = createRoot(document.getElementById('forseti-root')!);
window.addEventListener('DOMContentLoaded', () => {
  root.render(
    <PageTitleProvider>
      <StorageProvider>
        <ApiProvider>
          <Layout>
            <App />
          </Layout>
        </ApiProvider>
      </StorageProvider>
    </PageTitleProvider>
  );
});
