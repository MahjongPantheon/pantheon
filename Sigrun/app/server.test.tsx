// @vitest-environment node
import type { PropsWithChildren } from 'react';
import { JSDOM } from 'jsdom';
import { beforeEach, expect, it, vi } from 'vitest';
import { useIsomorphicState } from './hooks/useIsomorphicState';
import { SSRRender } from './server';
import { preloadRouteData } from './services/routeData';
import { useStorage, StorageProvider } from './hooks/storage';
import { useI18n, I18nProvider } from './hooks/i18n';
import { ApiProvider } from './hooks/api';

const { payload, appRender } = vi.hoisted(() => ({
  appRender: vi.fn(),
  payload: { description: '</script><script>window.injected = true</script>', count: 0 },
}));
vi.mock('./services/routeData', () => ({ preloadRouteData: vi.fn() }));
vi.mock('./hooks/analytics', () => ({ analytics: null }));
vi.mock('./services/analytics', () => ({ Analytics: { LOAD_STARTED: 'load_started' } }));
vi.mock('./Layout', () => ({
  Layout: ({ children }: PropsWithChildren) => (
    <StorageProvider>
      <I18nProvider>
        <ApiProvider>{children}</ApiProvider>
      </I18nProvider>
    </StorageProvider>
  ),
}));
vi.mock('./App', () => ({
  App: () => {
    appRender();
    const [data] = useIsomorphicState(null, 'event', async () => payload, []);
    const storage = useStorage();
    const i18n = useI18n();
    return (
      <div
        data-person={storage.getPersonId()}
        data-language={storage.getLang()}
        title={i18n._t('Event list')}
      >
        {data?.description}
      </div>
    );
  },
}));

beforeEach(() => {
  appRender.mockClear();
  vi.mocked(preloadRouteData).mockReset().mockResolvedValue({ event: payload });
});

it('renders real server hydration data as one script and preserves its original content', async () => {
  const rendered = await SSRRender('/', {});
  expect(appRender).toHaveBeenCalledOnce();
  const dom = new JSDOM(
    `<html><head>${rendered.serverData}</head><body>${rendered.appHtml}</body></html>`,
    { runScripts: 'dangerously' }
  );
  try {
    expect(dom.window.document.querySelectorAll('script')).toHaveLength(1);
    expect(dom.window.injected).toBeUndefined();
    expect(dom.window.initialData.event).toEqual(payload);
    expect(dom.window.document.body.textContent).toBe(payload.description);
  } finally {
    dom.window.close();
  }
});

it('keeps overlapping requests isolated when their preloads settle in reverse order', async () => {
  let release!: () => void;
  const firstPending = new Promise<void>((resolve) => {
    release = resolve;
  });
  vi.mocked(preloadRouteData).mockImplementation(async (_, __, personId) => {
    if (personId === 1) await firstPending;
    return { event: payload };
  });
  const first = SSRRender('/', { pid: '1', lng: 'en', auth: 'first' });
  const second = await SSRRender('/', { pid: '2', lng: 'ru', auth: 'second' });
  release();
  const one = await first;
  expect(one.appHtml).toContain('data-person="1" data-language="en" title="Event list"');
  expect(second.appHtml).toContain('data-person="2" data-language="ru"');
  expect(second.appHtml).not.toContain('title="Event list"');
  expect(one.cookies.add.lng).toBe('en');
  expect(second.cookies.add.lng).toBe('ru');
  const calls = vi.mocked(preloadRouteData).mock.calls;
  expect(calls[0][1]).not.toBe(calls[1][1]);
});
