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

  return { head: document.slice(headStart, headEnd), appHtml: document.slice(rootStart, rootEnd) };
}
