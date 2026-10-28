import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Event } from 'tsclients/proto/atoms.pb';
import { auth, authCtx, PrivilegesLevel } from '../hooks/auth';
import { OwnedEvents } from './OwnedEvents';

const { api, loadOwnedEvents, show } = vi.hoisted(() => ({
  api: {
    setEventId: vi.fn(),
    toggleListed: vi.fn(),
    toggleResults: vi.fn(),
    toggleAchievements: vi.fn(),
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
  vi.clearAllMocks();
  loadOwnedEvents.mockResolvedValue({
    events: [1, 2].map((id) => Event.initialize({ id, title: `Event ${id}` })),
    page: 1,
    totalPages: 1,
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
