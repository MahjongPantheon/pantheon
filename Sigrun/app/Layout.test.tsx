import { StrictMode } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Layout } from './Layout';

const { analytics, storage } = vi.hoisted(() => ({
  analytics: { trackView: vi.fn() },
  storage: { getPersonId: () => null, getTheme: () => 'day', getDimmed: () => false },
}));
const i18n = { _t: (text: string) => text };
vi.mock('./hooks/api', () => ({
  useApi: () => ({}),
  ApiProvider: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('./hooks/analytics', () => ({
  useAnalytics: () => analytics,
  AnalyticsProvider: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('./hooks/storage', () => ({
  useStorage: () => storage,
  StorageProvider: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('./hooks/i18n', () => ({
  useI18n: () => i18n,
  I18nProvider: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('./hooks/useIsomorphicState', () => ({ useIsomorphicState: () => [null] }));
vi.mock('./components/AppHeader', () => ({ AppHeader: () => null }));
vi.mock('./components/AppFooter', () => ({ AppFooter: () => null }));
vi.mock('./components/MainMenu', () => ({ MainMenu: () => null }));
vi.mock('./components/AddOnlineReplayModal', () => ({ AddOnlineReplayModal: () => null }));
vi.mock('./Main', () => ({ Main: ({ children }: React.PropsWithChildren) => children }));
vi.mock('./helpers/fontLoader', () => ({ fontLoader: vi.fn() }));
vi.mock('wouter', () => ({ useRoute: () => [false, null] }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('registers each navigation listener once in StrictMode and removes it on unmount', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const view = render(
    <StrictMode>
      <Layout>
        <div>Content</div>
      </Layout>
    </StrictMode>
  );
  analytics.trackView.mockClear();
  for (const type of ['popstate', 'pushState', 'replaceState'])
    act(() => window.dispatchEvent(new Event(type)));
  expect(analytics.trackView).toHaveBeenCalledTimes(3);
  view.unmount();
  analytics.trackView.mockClear();
  for (const type of ['popstate', 'pushState', 'replaceState'])
    window.dispatchEvent(new Event(type));
  expect(analytics.trackView).not.toHaveBeenCalled();
});
