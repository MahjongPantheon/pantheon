/*  Forseti: personal area & event control panel
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

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PageTitleProvider } from './hooks/pageTitle';
import { Layout } from './Layout';
import { StorageProvider } from './hooks/storage';
import { ApiProvider } from './hooks/api';
import { AnalyticsProvider } from './hooks/analytics';
import { I18nProvider } from './hooks/i18n';
import { registerFrontErrorHandler } from './helpers/logFrontError';
registerFrontErrorHandler();
const root = createRoot(document.getElementById('forseti-root')!);
window.addEventListener('DOMContentLoaded', () => {
  root.render(
    <React.StrictMode>
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
    </React.StrictMode>
  );
});
