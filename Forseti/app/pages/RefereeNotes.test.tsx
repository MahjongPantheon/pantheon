import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { RefereeNotes } from './RefereeNotes';

const { state, api } = vi.hoisted(() => {
  const storageState: { personId: number | null } = { personId: 7 };
  return { state: storageState, api: { setEventId: vi.fn() } };
});
vi.mock('../hooks/api', () => ({ useApi: () => api }));
vi.mock('../hooks/storage', () => ({ useStorage: () => ({ getPersonId: () => state.personId }) }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => ({ _t: (text: string) => text }) }));
vi.mock('../hooks/pageTitle', () => ({ usePageTitle: vi.fn() }));
vi.mock('../components/RefereeNotes', () => ({
  RefereeNotes: ({ eventId }: { eventId: number }) => <div>Event {eventId} notes</div>,
}));
vi.mock('wouter', () => ({ Redirect: ({ to }: { to: string }) => <div>Redirect {to}</div> }));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  state.personId = 7;
  vi.clearAllMocks();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function render(id = '42') {
  await act(async () =>
    root.render(
      <MantineProvider env='test'>
        <RefereeNotes params={{ id }} />
      </MantineProvider>
    )
  );
}

it('opens notes for the requested event and updates the API event context on navigation', async () => {
  await render();
  expect(api.setEventId).toHaveBeenLastCalledWith(42);
  expect(container.textContent).toContain('Event 42 notes');
  await render('43');
  expect(api.setEventId).toHaveBeenLastCalledWith(43);
  expect(container.textContent).toContain('Event 43 notes');
});

it('redirects anonymous visitors to sign in', async () => {
  state.personId = null;
  await render();
  expect(container.textContent).toContain('Redirect /profile/login');
  expect(container.textContent).not.toContain('Event 42 notes');
});
