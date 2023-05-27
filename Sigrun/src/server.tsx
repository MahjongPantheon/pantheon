import ReactDOMServer from 'react-dom/server';
import { App } from './App';
import { Router } from 'wouter';
import { StorageStrategyServer } from '../../Common/storageStrategyServer';
import { Isomorphic } from './hooks/isomorphic';
import staticLocationHook from 'wouter/static-location';
import { Layout } from './Layout';
import React from 'react';
import { Helmet } from 'react-helmet';
import { JSDOM } from 'jsdom';
import { createStylesServer, ServerStyles } from '@mantine/ssr';
import { storage } from './hooks/storage';

export async function SSRRender(url: string, cookies: Record<string, string>) {
  const storageStrategy = new StorageStrategyServer();
  storageStrategy.fill(cookies);
  storage.setStrategy(storageStrategy);
  const isomorphicCtxValue: Record<string, any> & { requests?: any[] } = { requests: [] };
  const locHook = staticLocationHook(url);
  (global as any).JSDOM = JSDOM;

  // First pass to collect effects
  ReactDOMServer.renderToString(
    <Isomorphic.Provider value={isomorphicCtxValue}>
      <Router hook={locHook}>
        <Layout>
          <App />
        </Layout>
      </Router>
    </Isomorphic.Provider>
  );

  if (isomorphicCtxValue.requests) {
    await Promise.all(isomorphicCtxValue.requests);
    delete isomorphicCtxValue.requests;
  }

  const appHtml = ReactDOMServer.renderToString(
    <Isomorphic.Provider value={isomorphicCtxValue}>
      <Router hook={locHook}>
        <Layout>
          <App />
        </Layout>
      </Router>
    </Isomorphic.Provider>
  );

  const helmet = Helmet.renderStatic();
  const stylesServer = createStylesServer();
  const styles = ReactDOMServer.renderToString(
    <ServerStyles html={appHtml} server={stylesServer} />
  );

  return {
    appHtml,
    helmet: [helmet.title.toString(), helmet.meta.toString(), helmet.link.toString(), styles].join(
      '\n'
    ),
    cookies: storageStrategy.getCookies(),
    serverData: `<script>window.initialData = ${JSON.stringify(isomorphicCtxValue)};</script>`,
  };
}
