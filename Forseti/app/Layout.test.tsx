import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './Layout';

const { api, analytics, storage } = vi.hoisted(() => ({
  api: {
    quickAuthorize: vi.fn().mockResolvedValue(true),
    getSuperadminFlag: vi.fn().mockResolvedValue(false),
    getIsEventReferee: vi.fn().mockResolvedValue(false),
    getIsEventAdmin: vi.fn().mockResolvedValue(false),
  },
  analytics: { trackView: vi.fn() },
  storage: { getPersonId: () => 1, getTheme: () => 'day', getDimmed: () => false },
}));
const i18n = { _t: (text: string) => text };
vi.mock('./hooks/api', () => ({ useApi: () => api }));
vi.mock('./hooks/analytics', () => ({ useAnalytics: () => analytics }));
vi.mock('./hooks/storage', () => ({ useStorage: () => storage }));
vi.mock('./hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('./helpers/fontLoader', () => ({ fontLoader: vi.fn() }));
vi.mock('wouter', () => ({ useRoute: () => [false, null] }));
vi.mock('./components/AppHeader', () => ({ AppHeader: () => null }));
vi.mock('./components/AppFooter', () => ({ AppFooter: () => null }));
vi.mock('./components/MainMenu', () => ({ MainMenu: () => null }));
vi.mock('./components/StopEventModal', () => ({ StopEventModal: () => null }));
vi.mock('./components/RecalcAchievementsModal', () => ({ RecalcAchievementsModal: () => null }));
vi.mock('./components/RecalcPlayerStatsModal', () => ({ RecalcPlayerStatsModal: () => null }));

afterEach(() => vi.unstubAllGlobals());

it('keeps one analytics listener per navigation event and removes them on unmount', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <StrictMode>
          <Layout />
        </StrictMode>
      )
    );
    analytics.trackView.mockClear();
    for (const name of ['popstate', 'pushState', 'replaceState']) {
      window.dispatchEvent(new Event(name));
    }
    expect(analytics.trackView).toHaveBeenCalledTimes(3);
  } finally {
    act(() => root.unmount());
    container.remove();
  }
  analytics.trackView.mockClear();
  for (const name of ['popstate', 'pushState', 'replaceState']) {
    window.dispatchEvent(new Event(name));
  }
  expect(analytics.trackView).not.toHaveBeenCalled();
});
