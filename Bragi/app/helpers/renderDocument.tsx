import { JSDOM } from 'jsdom';
import { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

// React 19 hoists metadata into <head> only when rendering a full document.
// Keep the root markup untouched so the client can hydrate it normally.
export function renderDocument(children: ReactNode) {
  const document = renderToString(
    <html>
      <head />
      <body>
        <div id='root'>{children}</div>
      </body>
    </html>
  );
  const headStart = document.indexOf('<head>') + '<head>'.length;
  const headEnd = document.indexOf('</head>');
  const rootStart = document.indexOf('<div id="root">', headEnd) + '<div id="root">'.length;
  const rootEnd = document.lastIndexOf('</div></body>');

  // React 19 hoists every Helmet's tags. Preserve the innermost page metadata.
  const dom = new JSDOM(`<html><head>${document.slice(headStart, headEnd)}</head></html>`);
  const head = dom.window.document.head;
  const seen = new Set<string>();
  for (const element of [...head.children].reverse()) {
    const key =
      element.tagName === 'TITLE'
        ? 'title'
        : element.tagName === 'META'
          ? ['name', 'property', 'http-equiv', 'charset']
              .filter((attribute) => element.hasAttribute(attribute))
              .map((attribute) => `${attribute}:${element.getAttribute(attribute)}`)
              .join('|')
          : element.tagName === 'LINK' && element.getAttribute('rel') === 'canonical'
            ? 'canonical'
            : undefined;
    if (!key) continue;
    if (seen.has(key)) element.remove();
    else seen.add(key);
  }
  const headHtml = head.innerHTML;
  dom.window.close();
  return { head: headHtml, appHtml: document.slice(rootStart, rootEnd) };
}
