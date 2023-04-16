import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '#/App';
import { PageTitleProvider } from '#/hooks/pageTitle';
import { Layout } from '#/Layout';
import './index.css';
import { StorageProvider } from '#/hooks/storage';
import { ApiProvider } from '#/hooks/api';
import { AnalyticsProvider } from '#/hooks/analytics';
import { I18nProvider } from '#/hooks/i18n';

const root = createRoot(document.getElementById('forseti-root')!);
window.addEventListener('DOMContentLoaded', () => {
  root.render(
    <PageTitleProvider>
      <StorageProvider>
        <I18nProvider>
          <AnalyticsProvider>
            <ApiProvider>
              <Layout>
                <App />
              </Layout>
            </ApiProvider>
          </AnalyticsProvider>
        </I18nProvider>
      </StorageProvider>
    </PageTitleProvider>
  );
});
