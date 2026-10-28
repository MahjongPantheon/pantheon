// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Router, Route } from 'wouter';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { renderDocument } from './renderDocument';

describe('server document rendering', () => {
  it('keeps metadata in the head and renders the requested route', () => {
    const { head, appHtml } = renderDocument(
      <HelmetProvider>
        <Router ssrPath='/ru/about'>
          <Helmet>
            <title>Pantheon</title>
            <meta name='description' content='Riichi mahjong' />
            <link rel='icon' href='/favicon.png' />
          </Helmet>
          <Route path='/ru/about'>
            <main>About Pantheon</main>
          </Route>
          <Route path='/en/about'>
            <main>English page</main>
          </Route>
        </Router>
      </HelmetProvider>
    );
    expect(head).toContain('<title>Pantheon</title>');
    expect(head).toContain('content="Riichi mahjong"');
    expect(head).toContain('href="/favicon.png"');
    expect(appHtml).toBe('<main>About Pantheon</main>');
  });
  it('lets page metadata override layout defaults while preserving resource links', () => {
    const { head, appHtml } = renderDocument(
      <HelmetProvider>
        <Helmet>
          <title>Default title</title>
          <meta name='description' content='Default description' />
          <meta property='og:title' content='Default title' />
          <link rel='canonical' href='https://example.com/' />
          <link rel='preload' href='/first.woff2' as='font' />
        </Helmet>
        <main>
          <Helmet>
            <title>Page title</title>
            <meta name='description' content='Page description' />
            <meta property='og:title' content='Page title' />
            <link rel='canonical' href='https://example.com/page' />
            <link rel='preload' href='/second.woff2' as='font' />
          </Helmet>
          Page content
        </main>
      </HelmetProvider>
    );
    expect(head.match(/<title>/g)).toHaveLength(1);
    expect(head).toContain('<title>Page title</title>');
    expect(head).toContain('content="Page description"');
    expect(head).not.toContain('Default');
    expect(head.match(/rel="canonical"/g)).toHaveLength(1);
    expect(head).toContain('href="https://example.com/page"');
    expect(head).toContain('href="/first.woff2"');
    expect(head).toContain('href="/second.woff2"');
    expect(appHtml).toBe('<main>Page content</main>');
  });
});
