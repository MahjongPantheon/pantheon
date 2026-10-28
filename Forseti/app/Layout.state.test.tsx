import { act, useContext } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Layout } from './Layout';
import { authCtx, PrivilegesLevel } from './hooks/auth';
import { modalsCtx } from './hooks/modals';
import { Event } from 'tsclients/proto/atoms.pb';

const f = vi.hoisted(() => ({
  api: {
    quickAuthorize: vi.fn(),
    getSuperadminFlag: vi.fn(),
    getIsEventReferee: vi.fn(),
    getIsEventAdmin: vi.fn(),
    getEventsById: vi.fn(),
  },
  route: 'event' as 'event' | 'edit' | null,
  theme: 'day' as string | null,
  wide: true,
  storage: {
    getPersonId: () => 7,
    getTheme: () => f.theme,
    getDimmed: () => false,
    setTheme: vi.fn(),
    setDimmed: vi.fn(),
    setLang: vi.fn(),
  },
  i18n: { _t: (s: string) => s, init: vi.fn() },
  header: {} as {
    title?: string;
    toggleColorScheme?: (value?: 'dark' | 'light') => void;
    toggleDimmed?: () => void;
    saveLang?: (lang: string) => void;
  },
}));
vi.mock('./hooks/api', () => ({ useApi: () => f.api }));
vi.mock('./hooks/analytics', () => ({ useAnalytics: () => ({ trackView: vi.fn() }) }));
vi.mock('./hooks/storage', () => ({ useStorage: () => f.storage }));
vi.mock('./hooks/i18n', () => ({ useI18n: () => f.i18n }));
vi.mock('./helpers/fontLoader', () => ({ fontLoader: vi.fn() }));
vi.mock('wouter', () => ({
  useRoute: (path: string) => [
    f.route === (path.startsWith('/event') ? 'event' : 'edit'),
    { id: '42' },
  ],
}));
vi.mock('./components/AppHeader', () => ({
  AppHeader: (props: typeof f.header) => {
    f.header = props;
    return null;
  },
}));
vi.mock('./components/AppFooter', () => ({ AppFooter: () => null }));
vi.mock('./components/MainMenu', () => ({ MainMenu: () => null }));
vi.mock('./components/StopEventModal', () => ({ StopEventModal: () => null }));
vi.mock('./components/RecalcAchievementsModal', () => ({ RecalcAchievementsModal: () => null }));
vi.mock('./components/RecalcPlayerStatsModal', () => ({ RecalcPlayerStatsModal: () => null }));
let container: HTMLDivElement;
let root: Root;
function Consumer() {
  const auth = useContext(authCtx);
  const modals = useContext(modalsCtx);
  return (
    <>
      <output id='auth'>
        {JSON.stringify([auth.isLoggedIn, auth.privilegesLevel, auth.privilegesLoading])}
      </output>
      <button
        onClick={() => {
          modals.setStopEventModalData({ id: 42, title: 'Event' });
          modals.showStopEventModal();
        }}
      >
        Stop
      </button>
      <output id='stop'>
        {JSON.stringify([modals.stopEventModalShown, modals.stopEventModalData])}
      </output>
    </>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  f.route = 'event';
  f.theme = 'day';
  f.wide = true;
  f.api.quickAuthorize.mockResolvedValue(true);
  f.api.getSuperadminFlag.mockResolvedValue(false);
  f.api.getIsEventReferee.mockResolvedValue(false);
  f.api.getIsEventAdmin.mockResolvedValue(false);
  f.api.getEventsById.mockResolvedValue([Event.initialize({ id: 42, title: 'A'.repeat(40) })]);
  f.i18n.init.mockImplementation((ready: (locale: string) => void) => ready('de'));
  vi.stubGlobal('matchMedia', () => ({
    matches: f.wide,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function mount() {
  await act(async () =>
    root.render(
      <Layout>
        <Consumer />
      </Layout>
    )
  );
}

it.each([
  [false, false, false, PrivilegesLevel.NOBODY],
  [false, true, false, PrivilegesLevel.REFEREE],
  [false, false, true, PrivilegesLevel.ADMIN],
  [true, true, true, PrivilegesLevel.SUPERADMIN],
] as const)(
  'resolves superadmin=%s referee=%s admin=%s privileges',
  async (superadmin, referee, admin, expected) => {
    f.api.getSuperadminFlag.mockResolvedValue(superadmin);
    f.api.getIsEventReferee.mockResolvedValue(referee);
    f.api.getIsEventAdmin.mockResolvedValue(admin);
    await mount();
    expect(container.querySelector('#auth')!.textContent).toBe(
      JSON.stringify([true, expected, false])
    );
    expect(f.api.getEventsById).toHaveBeenCalledWith([42]);
    expect(f.header.title).toBe('A'.repeat(32) + '...');
  }
);

it.each(['day', 'night', 'unknown', null])(
  'supports initial theme %s and explicit and toggled preferences',
  async (theme) => {
    f.theme = theme;
    await mount();
    act(() => f.header.toggleColorScheme!());
    expect(f.storage.setTheme).toHaveBeenLastCalledWith(theme === 'night' ? 'day' : 'night');
    act(() => f.header.toggleColorScheme!('dark'));
    expect(f.storage.setTheme).toHaveBeenLastCalledWith('night');
    act(() => f.header.toggleDimmed!());
    expect(f.storage.setDimmed).toHaveBeenLastCalledWith(true);
    act(() => f.header.toggleDimmed!());
    expect(f.storage.setDimmed).toHaveBeenLastCalledWith(false);
    act(() => f.header.saveLang!('de'));
    expect(f.storage.setLang).toHaveBeenCalledWith('de');
  }
);

it('loads edit routes, skips unrelated event data, and updates modal context', async () => {
  f.route = 'edit';
  f.wide = false;
  f.api.getEventsById.mockResolvedValue([Event.initialize({ id: 42, title: 'Short' })]);
  await mount();
  expect(f.header.title).toBe('Short');
  act(() => container.querySelector('button')!.click());
  expect(container.querySelector('#stop')!.textContent).toContain('true');
  f.route = null;
  f.api.getEventsById.mockClear();
  await mount();
  expect(f.api.getEventsById).not.toHaveBeenCalled();
});
