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

import { App } from './App';
import { Router } from 'wouter';
import { StorageStrategyServer } from '../../Common/storageStrategyServer';
import { Isomorphic } from './hooks/isomorphic';
import { Layout } from './Layout';
import { HelmetProvider } from 'react-helmet-async';
import { StorageProvider } from './hooks/storage';
import { I18nProvider } from './hooks/i18n';
import { ApiProvider } from './hooks/api';
import { Storage } from '../../Common/storage';
import { I18nService } from './services/i18n';
import { ApiService } from './services/api';
import { preloadRouteData } from './services/routeData';
import createEmotionServer from '@emotion/server/create-instance';
import { createEmotionCache } from './emotion/cache';
import { renderDocument } from './helpers/renderDocument';
import { serializeServerData } from './helpers/serializeServerData';

export async function SSRRender(
  url: string,
  cookies: Record<string, string>,
  options: { signal?: AbortSignal } = {}
) {
  const signal = options.signal ?? AbortSignal.timeout(10000);
  const emotionCache = createEmotionCache();
  const stylesServer = createEmotionServer(emotionCache);
  const storageStrategy = new StorageStrategyServer();
  storageStrategy.fill({ ...cookies });
  const storage = new Storage();
  storage.setStrategy(storageStrategy);
  const i18n = new I18nService(storage);
  await new Promise<void>((resolve, reject) => {
    i18n.init((locale) => {
      storage.setLang(locale);
      resolve();
    }, reject);
  });
  const api = new ApiService(
    import.meta.env.VITE_FREY_URL_SSR,
    import.meta.env.VITE_MIMIR_URL_SSR,
    signal
  );
  api.setCredentials(storage.getPersonId() ?? 0, storage.getAuthToken() ?? '');
  const isomorphicCtxValue = await preloadRouteData(url, api, storage.getPersonId(), signal);

  const { appHtml, head } = renderDocument(
    <Isomorphic.Provider value={isomorphicCtxValue}>
      <StorageProvider value={storage}>
        <I18nProvider value={i18n}>
          <ApiProvider value={api}>
            <HelmetProvider>
              <Router ssrPath={url}>
                <Layout emotionCache={emotionCache}>
                  <App />
                </Layout>
              </Router>
            </HelmetProvider>
          </ApiProvider>
        </I18nProvider>
      </StorageProvider>
    </Isomorphic.Provider>
  );
  signal.throwIfAborted();

  return {
    appHtml,
    helmet: head,
    styles: stylesServer.constructStyleTagsFromChunks(
      stylesServer.extractCriticalToChunks(appHtml)
    ),
    cookies: storageStrategy.getCookies(),
    serverData: `<script>window.initialData = ${serializeServerData(isomorphicCtxValue)};</script>`,
  };
}
