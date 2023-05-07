import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { App } from "./App";

export function SSRRender(url: string | Partial<Location>) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}
