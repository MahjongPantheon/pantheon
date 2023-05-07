import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from './App';
import { StorageStrategyServer } from '../../Common/storageStrategyServer';

export function SSRRender(url: string | Partial<Location>, cookies: Record<string, string>) {
  const storageStrategy = new StorageStrategyServer();
  storageStrategy.fill(cookies);
  const appHtml = ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <App storageStrategy={storageStrategy} />
    </StaticRouter>
  );

  return { appHtml, cookies: storageStrategy.getCookies() };
}
