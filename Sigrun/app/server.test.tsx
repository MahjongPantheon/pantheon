// @vitest-environment node
import type { PropsWithChildren } from 'react';
import { JSDOM } from 'jsdom';
import { expect, it, vi } from 'vitest';
import { useIsomorphicState } from './hooks/useIsomorphicState';
import { SSRRender } from './server';

const { payload } = vi.hoisted(() => ({
  payload: { description: '</script><script>window.injected = true</script>', count: 0 },
}));
vi.mock('./hooks/storage', () => ({ storage: { setStrategy: vi.fn() } }));
vi.mock('./hooks/i18n', () => ({ i18n: { init: vi.fn() } }));
vi.mock('./Layout', () => ({ Layout: ({ children }: PropsWithChildren) => children }));
vi.mock('./App', () => ({
  App: () => {
    const [data] = useIsomorphicState(null, 'event', async () => payload, []);
    return <div>{data?.description}</div>;
  },
}));

it('renders real server hydration data as one script and preserves its original content', async () => {
  const rendered = await SSRRender('/', {});
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
