import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '#/App';
import { PageTitleProvider } from '#/hooks/pageTitle';
import { Layout } from '#/Layout';
import './index.css';
import { StorageProvider } from '#/hooks/storage';
import { ApiProvider } from '#/hooks/api';
import { AuthProvider } from '#/hooks/auth';

const root = createRoot(document.getElementById('forseti-root')!);
window.addEventListener('DOMContentLoaded', () => {
  root.render(
    <PageTitleProvider>
      <AuthProvider>
        <StorageProvider>
          <ApiProvider>
            <Layout>
              <App />
            </Layout>
          </ApiProvider>
        </StorageProvider>
      </AuthProvider>
    </PageTitleProvider>
  );
});
