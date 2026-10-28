import { useContext, type PropsWithChildren } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Layout } from './Layout';
import { authCtx } from './hooks/auth';
import { globalsCtx } from './hooks/globals';
import { modalsCtx } from './hooks/modals';
import { PersonEx } from 'tsclients/proto/atoms.pb';

const f = vi.hoisted(() => ({
  personId: 7 as number | null,
  timer: false,
  wide: true,
  auth: [true, true, { id: 7, title: 'Alice' }, [42]] as unknown[],
  load: null as (() => Promise<unknown>) | null,
  storage: {
    getPersonId: () => f.personId,
    getTheme: () => 'day',
    getDimmed: () => false,
    setDimmed: vi.fn(),
    setLang: vi.fn(),
  },
  api: {
    quickAuthorize: vi.fn(),
    getSuperadminFlag: vi.fn(),
    getPersonalInfo: vi.fn(),
    getOwnedEventIds: vi.fn(),
  },
  i18n: { _t: (s: string) => s, init: vi.fn() },
}));
vi.mock('./hooks/api', () => ({
  useApi: () => f.api,
  ApiProvider: ({ children }: PropsWithChildren) => children,
}));
vi.mock('./hooks/analytics', () => ({
  useAnalytics: () => ({ trackView: vi.fn() }),
  AnalyticsProvider: ({ children }: PropsWithChildren) => children,
}));
vi.mock('./hooks/storage', () => ({
  useStorage: () => f.storage,
  StorageProvider: ({ children }: PropsWithChildren) => children,
}));
vi.mock('./hooks/i18n', () => ({
  useI18n: () => f.i18n,
  I18nProvider: ({ children }: PropsWithChildren) => children,
}));
vi.mock('./hooks/useIsomorphicState', () => ({
  useIsomorphicState: (_initial: unknown, _key: string, load: () => Promise<unknown>) => {
    f.load = load;
    return [f.auth];
  },
}));
vi.mock('./components/AppHeader', () => ({
  AppHeader: ({
    saveLang,
    toggleDimmed,
  }: {
    saveLang: (lang: string) => void;
    toggleDimmed: () => void;
  }) => (
    <>
      <button onClick={() => saveLang('de')}>Language</button>
      <button onClick={toggleDimmed}>Dimmed</button>
    </>
  ),
}));
vi.mock('./components/AppFooter', () => ({ AppFooter: () => <div data-testid='footer' /> }));
vi.mock('./components/MainMenu', () => ({
  MainMenu: ({ showLabels }: { showLabels: boolean }) => (
    <div data-testid='menu'>{String(showLabels)}</div>
  ),
}));
vi.mock('./components/AddOnlineReplayModal', () => ({ AddOnlineReplayModal: () => null }));
vi.mock('./Main', () => ({ Main: ({ children }: PropsWithChildren) => children }));
vi.mock('./helpers/fontLoader', () => ({ fontLoader: vi.fn() }));
vi.mock('wouter', () => ({ useRoute: () => [f.timer, null] }));

function Consumer() {
  const auth = useContext(authCtx);
  const globals = useContext(globalsCtx);
  const modals = useContext(modalsCtx);
  return (
    <>
      <output data-testid='auth'>
        {JSON.stringify([auth.isLoggedIn, auth.isSuperadmin, auth.userInfo?.id, auth.ownEvents])}
      </output>
      <output data-testid='globals'>{JSON.stringify(globals.data.eventId)}</output>
      <output data-testid='modal'>{String(modals.onlineModalShown)}</output>
      <button onClick={() => globals.setData({ eventId: [42] })}>Set event</button>
      <button onClick={modals.showOnlineModal}>Open replay</button>
      <button onClick={modals.hideOnlineModal}>Close replay</button>
    </>
  );
}
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.clearAllMocks();
  f.personId = 7;
  f.timer = false;
  f.wide = true;
  f.auth = [true, true, PersonEx.initialize({ id: 7 }), [42]];
  f.api.quickAuthorize.mockResolvedValue(true);
  f.api.getSuperadminFlag.mockResolvedValue(true);
  f.api.getPersonalInfo.mockResolvedValue({ id: 7 });
  f.api.getOwnedEventIds.mockResolvedValue([42]);
  f.i18n.init.mockImplementation((ready: (locale: string) => void) => ready('de'));
  vi.stubGlobal('matchMedia', () => ({
    matches: f.wide,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('restores authentication data, updates globals and opens and closes replay entry', async () => {
  render(
    <Layout>
      <Consumer />
    </Layout>
  );
  expect(screen.getByTestId('auth').textContent).toBe('[true,true,7,[42]]');
  expect(await f.load!()).toEqual([true, true, { id: 7 }, [42]]);
  fireEvent.click(screen.getByText('Set event'));
  expect(screen.getByTestId('globals').textContent).toBe('[42]');
  fireEvent.click(screen.getByText('Open replay'));
  expect(screen.getByTestId('modal').textContent).toBe('true');
  fireEvent.click(screen.getByText('Close replay'));
  expect(screen.getByTestId('modal').textContent).toBe('false');
  fireEvent.click(screen.getByText('Dimmed'));
  expect(f.storage.setDimmed).toHaveBeenLastCalledWith(true);
  fireEvent.click(screen.getByText('Dimmed'));
  expect(f.storage.setDimmed).toHaveBeenLastCalledWith(false);
  fireEvent.click(screen.getByText('Language'));
  expect(f.storage.setLang).toHaveBeenCalledWith('de');
});

it('uses safe authentication defaults when each lookup fails', async () => {
  f.auth = [];
  for (const mock of Object.values(f.api)) mock.mockRejectedValue(new Error('Offline'));
  render(
    <Layout>
      <Consumer />
    </Layout>
  );
  expect(await f.load!()).toEqual([false, false, null, []]);
  expect(screen.getByTestId('auth').textContent).toBe('[false,false,null,[]]');
});

it('skips authentication requests for anonymous visitors and renders the mobile footer', async () => {
  f.personId = null;
  f.wide = false;
  f.auth = [];
  render(
    <Layout>
      <Consumer />
    </Layout>
  );
  expect(await f.load!()).toEqual([false, false, null, []]);
  expect(f.api.quickAuthorize).not.toHaveBeenCalled();
  expect(screen.getByTestId('footer')).toBeTruthy();
});

it('hides menu labels on a wide timer page and logs language-load failures', () => {
  f.timer = true;
  f.i18n.init.mockImplementation((_ready: unknown, error: (err: Error) => void) =>
    error(new Error('Missing catalog'))
  );
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <Layout>
      <Consumer />
    </Layout>
  );
  expect(screen.getByTestId('menu').textContent).toBe('false');
  act(() => fireEvent.click(screen.getByText('Language')));
  expect(log).toHaveBeenCalledWith(expect.objectContaining({ message: 'Missing catalog' }));
});
