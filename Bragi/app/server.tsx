/*  Bragi: Pantheon landing pages
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

import ReactDOMServer from 'react-dom/server';
import { App } from './App';
import { Router } from 'wouter';
import { StorageStrategyServer } from '../../Common/storageStrategyServer';
import { Isomorphic } from './hooks/isomorphic';
import staticLocationHook from 'wouter/static-location';
import { Layout } from './components/Layout';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { JSDOM } from 'jsdom';
import { storage } from './hooks/storage';
import { i18n } from './hooks/i18n';
import { createEmotionCache } from '@mantine/core';
import { createStylesServer } from '@mantine/ssr';

const cache = createEmotionCache({ key: 'cs', speedy: true, prepend: true });
const stylesServer = createStylesServer(cache);

export async function SSRRender(url: string, cookies: Record<string, string>) {
  const storageStrategy = new StorageStrategyServer();
  storageStrategy.fill(cookies);
  storage.setStrategy(storageStrategy);
  i18n.init(
    (locale) => {
      storage.setLang(locale);
    },
    (err) => console.error(err)
  );

  const isomorphicCtxValue: Record<string, any> & { requests?: any[] } = { requests: [] };
  const locHook = staticLocationHook(url);
  (global as any).JSDOM = JSDOM;

  const helmetContext: { helmet?: { title: any; meta: any; link: any } } = {};

  // First pass to collect effects
  ReactDOMServer.renderToString(
    <Isomorphic.Provider value={isomorphicCtxValue}>
      <HelmetProvider context={helmetContext}>
        <Router hook={locHook}>
          <Layout cache={cache}>
            <App />
          </Layout>
        </Router>
      </HelmetProvider>
    </Isomorphic.Provider>
  );

  if (isomorphicCtxValue.requests) {
    await Promise.all(isomorphicCtxValue.requests);
    delete isomorphicCtxValue.requests;
  }

  const appHtml = ReactDOMServer.renderToString(
    <Isomorphic.Provider value={isomorphicCtxValue}>
      <HelmetProvider context={helmetContext}>
        <Router hook={locHook}>
          <Layout cache={cache}>
            <App />
          </Layout>
        </Router>
      </HelmetProvider>
    </Isomorphic.Provider>
  );

  const { helmet } = helmetContext;
  return {
    appHtml,
    helmet: [
      helmet?.title.toString(),
      helmet?.meta.toString(),
      helmet?.link.toString(),
      `<style>${stylesServer.extractCritical(appHtml).css}</style>`,
    ].join('\n'),
    cookies: storageStrategy.getCookies(),
    serverData: `<script>window.initialData = ${JSON.stringify(isomorphicCtxValue)};</script>`,
  };
}
