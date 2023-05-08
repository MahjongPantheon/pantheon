import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from './App';
import { StorageStrategyServer } from '../../Common/storageStrategyServer';
import { Isomorphic } from './hooks/isomorphic';

export async function SSRRender(url: string | Partial<Location>, cookies: Record<string, string>) {
  const storageStrategy = new StorageStrategyServer();
  storageStrategy.fill(cookies);
  const isomorphicCtxValue: Record<string, any> & { requests?: any[] } = { requests: [] };

  // First pass to collect effects
  ReactDOMServer.renderToString(
    <Isomorphic.Provider value={isomorphicCtxValue}>
      <StaticRouter location={url}>
        <App storageStrategy={storageStrategy} />
      </StaticRouter>
    </Isomorphic.Provider>
  );

  if (isomorphicCtxValue.requests) {
    await Promise.all(isomorphicCtxValue.requests);
    delete isomorphicCtxValue.requests;
  }

  const appHtml = ReactDOMServer.renderToString(
    <Isomorphic.Provider value={isomorphicCtxValue}>
      <StaticRouter location={url}>
        <App storageStrategy={storageStrategy} />
      </StaticRouter>
    </Isomorphic.Provider>
  );

  return {
    appHtml,
    cookies: storageStrategy.getCookies(),
    serverData: `<script>window.initialData = ${JSON.stringify(isomorphicCtxValue)};</script>`,
  };
}
