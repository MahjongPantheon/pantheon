import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Event, EventType } from 'tsclients/proto/atoms.pb';
import { auth, authCtx, PrivilegesLevel } from '../hooks/auth';
import { OwnedEvents } from './OwnedEvents';

const { api, loadOwnedEvents, show } = vi.hoisted(() => ({
  api: {
    setEventId: vi.fn(),
    toggleListed: vi.fn(),
    toggleResults: vi.fn(),
    toggleAchievements: vi.fn(),
    finishEvent: vi.fn(),
    rebuildScoring: vi.fn(),
  },
  loadOwnedEvents: vi.fn(),
  show: vi.fn(),
}));
const i18n = { _t: (text: string) => text };
const storage = { getPersonId: () => 1 };
vi.mock('../hooks/api', () => ({ useApi: () => api }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../hooks/storage', () => ({ useStorage: () => storage }));
vi.mock('../helpers/ownedEventsData', () => ({ loadOwnedEvents }));
vi.mock('@mantine/notifications', () => ({ notifications: { show } }));
vi.mock('@mantine/nprogress', () => ({
  nprogress: { reset: vi.fn(), start: vi.fn(), complete: vi.fn() },
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  vi.resetAllMocks();
  api.toggleListed.mockResolvedValue(true);
  api.toggleAchievements.mockResolvedValue(true);
  loadOwnedEvents.mockResolvedValue({
    events: [
      EventType.EVENT_TYPE_LOCAL,
      EventType.EVENT_TYPE_ONLINE,
      EventType.EVENT_TYPE_TOURNAMENT,
    ].map((type, index) =>
      Event.initialize({
        id: index + 1,
        title: `Event ${index + 1}`,
        type,
        isPrescripted: index === 0,
        finished: index === 2,
      })
    ),
    page: 1,
    totalPages: 3,
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MantineProvider env='test'>
        <authCtx.Provider
          value={{ ...auth, isLoggedIn: true, privilegesLevel: PrivilegesLevel.ADMIN }}
        >
          <OwnedEvents params={{}} />
        </authCtx.Provider>
      </MantineProvider>
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function control(id: number) {
  return container.querySelector<HTMLElement>(
    `[data-testid="forseti-owned-event-visibility-${id}"]`
  )!;
}

async function open(id: number) {
  await act(async () => control(id).click());
}

async function toggle(id: number, setting: string) {
  await open(id);
  await act(async () => {
    document
      .querySelector<HTMLElement>(`[data-testid="forseti-owned-event-toggle-${setting}-${id}"]`)!
      .click();
  });
}

it('preserves concurrent visibility updates and loading state for different events', async () => {
  const resolve: Array<(result: boolean) => void> = [];
  api.toggleResults.mockImplementation(
    () =>
      new Promise<boolean>((done) => {
        resolve.push(done);
      })
  );
  await toggle(1, 'rating');
  await toggle(2, 'rating');
  expect(control(1).hasAttribute('data-loading')).toBe(true);
  expect(control(2).hasAttribute('data-loading')).toBe(true);
  await act(async () => resolve[0](true));
  expect(control(1).hasAttribute('data-loading')).toBe(false);
  expect(control(2).hasAttribute('data-loading')).toBe(true);
  await act(async () => resolve[1](true));
  for (const id of [1, 2]) {
    await open(id);
    const item = document.querySelector(`[data-testid="forseti-owned-event-toggle-rating-${id}"]`)!;
    expect(item.querySelector('.tabler-icon-square-check-filled')).not.toBeNull();
    await open(id);
  }
});

it.each([
  ['listed', 'toggleListed'],
  ['rating', 'toggleResults'],
  ['achievements', 'toggleAchievements'],
] as const)(
  'clears the %s loading state and reports a rejected request',
  async (setting, method) => {
    api[method].mockRejectedValue(new Error('Offline'));
    await toggle(1, setting);
    expect(control(1).hasAttribute('data-loading')).toBe(false);
    expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Offline' }));
  }
);

async function renderAs(privilegesLevel: PrivilegesLevel, isLoggedIn = true) {
  await act(async () =>
    root.render(
      <MantineProvider env='test'>
        <authCtx.Provider value={{ ...auth, isLoggedIn, privilegesLevel }}>
          <OwnedEvents params={{}} />
        </authCtx.Provider>
      </MantineProvider>
    )
  );
}
async function clickTestId(id: string) {
  await act(async () => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!.click());
}
async function action(id: number, name: string) {
  await clickTestId(`forseti-owned-event-actions-${id}`);
  await clickTestId(`forseti-owned-event-menu-${name}-${id}`);
}

it('filters events and loads the selected page', async () => {
  await clickTestId('forseti-owned-events-filter-all');
  expect(loadOwnedEvents).toHaveBeenLastCalledWith(api, 1, 1, false, 30);
  const secondPage = Array.from(container.querySelectorAll('button')).find(
    (button) => button.textContent === '2'
  )!;
  loadOwnedEvents.mockResolvedValueOnce({ events: [], page: 2, totalPages: 3 });
  await act(async () => secondPage.click());
  expect(loadOwnedEvents).toHaveBeenLastCalledWith(api, 1, 2, false, 30);
  await clickTestId('forseti-owned-events-filter-ongoing');
  expect(loadOwnedEvents).toHaveBeenLastCalledWith(api, 1, 1, true, 30);
});

it.each([true, false])(
  'only reloads events after an acknowledged finish (%s)',
  async (acknowledged) => {
    api.finishEvent.mockResolvedValue(acknowledged);
    await action(1, 'finish');
    await clickTestId('forseti-owned-events-stop-cancel');
    expect(api.finishEvent).not.toHaveBeenCalled();
    await action(1, 'finish');
    const loads = loadOwnedEvents.mock.calls.length;
    await clickTestId('forseti-owned-events-stop-confirm');
    expect(api.finishEvent).toHaveBeenCalledWith(1);
    expect(loadOwnedEvents).toHaveBeenCalledTimes(loads + (acknowledged ? 1 : 0));
  }
);

it('reports finish and scoring failures and clears scoring loading state', async () => {
  await renderAs(PrivilegesLevel.SUPERADMIN);
  api.finishEvent.mockRejectedValue(new Error('Cannot finish'));
  await action(1, 'finish');
  await clickTestId('forseti-owned-events-stop-confirm');
  expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot finish' }));
  api.rebuildScoring.mockRejectedValue(new Error('Cannot rebuild'));
  await action(1, 'rebuild-scoring');
  expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot rebuild' }));
  await clickTestId('forseti-owned-event-actions-1');
  expect(
    document.querySelector<HTMLButtonElement>(
      '[data-testid="forseti-owned-event-menu-rebuild-scoring-1"]'
    )!.disabled
  ).toBe(false);
});

it('offers predefined seating to administrators and restricts finished events to copying', async () => {
  await clickTestId('forseti-owned-event-actions-1');
  expect(
    document.querySelector('[data-testid="forseti-owned-event-menu-seating-1"]')
  ).not.toBeNull();
  await clickTestId('forseti-owned-event-actions-1');
  await clickTestId('forseti-owned-event-actions-3');
  expect(document.querySelector('[data-testid="forseti-owned-event-copy-3"]')).not.toBeNull();
  expect(document.querySelector('[data-testid="forseti-owned-event-menu-finish-3"]')).toBeNull();
  expect(container.textContent).toContain('Event finished');
});

it('allows referees to manage games and rating visibility while hiding administrative actions', async () => {
  await renderAs(PrivilegesLevel.REFEREE);
  await clickTestId('forseti-owned-event-actions-1');
  expect(document.querySelector('[data-testid="forseti-owned-event-menu-games-1"]')).not.toBeNull();
  for (const name of ['settings', 'privileges', 'seating', 'finish'])
    expect(document.querySelector(`[data-testid="forseti-owned-event-menu-${name}-1"]`)).toBeNull();
  await clickTestId('forseti-owned-event-actions-1');
  await open(1);
  expect(document.querySelector('[data-testid="forseti-owned-event-toggle-listed-1"]')).toBeNull();
});

it.each(['listed', 'achievements'] as const)(
  'updates the %s checkmark for the selected event',
  async (setting) => {
    await toggle(1, setting);
    await open(1);
    expect(
      document.querySelector(
        `[data-testid="forseti-owned-event-toggle-${setting}-1"] .tabler-icon-square-check-filled`
      )
    ).not.toBeNull();
  }
);

it.each(['rating', 'achievements'] as const)(
  'reports unacknowledged %s changes',
  async (setting) => {
    api[setting === 'rating' ? 'toggleResults' : 'toggleAchievements'].mockResolvedValue(false);
    await toggle(1, setting);
    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Failed to toggle') })
    );
  }
);

it('skips loading events when authentication is lost', async () => {
  const loads = loadOwnedEvents.mock.calls.length;
  await renderAs(PrivilegesLevel.ADMIN, false);
  expect(loadOwnedEvents).toHaveBeenCalledTimes(loads);
  expect(container.querySelector('[aria-busy="false"]')).not.toBeNull();
});
