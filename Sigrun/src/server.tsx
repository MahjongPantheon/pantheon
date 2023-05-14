import ReactDOMServer from 'react-dom/server';
import { App } from './App';
import { Router } from 'wouter';
import { StorageStrategyServer } from '../../Common/storageStrategyServer';
import { Isomorphic } from './hooks/isomorphic';
import staticLocationHook from 'wouter/static-location';
import { Layout } from './Layout';
import React from 'react';

export async function SSRRender(url: string, cookies: Record<string, string>) {
  const storageStrategy = new StorageStrategyServer();
  storageStrategy.fill(cookies);
  const isomorphicCtxValue: Record<string, any> & { requests?: any[] } = { requests: [] };
  const locHook = staticLocationHook(url);

  // First pass to collect effects
  ReactDOMServer.renderToString(
    <Isomorphic.Provider value={isomorphicCtxValue}>
      <Router hook={locHook}>
        <Layout storageStrategy={storageStrategy}>
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
        <Layout storageStrategy={storageStrategy}>
          <App />
        </Layout>
      </Router>
    </Isomorphic.Provider>
  );

  return {
    appHtml,
    cookies: storageStrategy.getCookies(),
    serverData: `<script>window.initialData = ${JSON.stringify(isomorphicCtxValue)};</script>`,
  };
}
