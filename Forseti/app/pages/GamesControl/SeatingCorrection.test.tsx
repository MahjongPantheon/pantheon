import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { PlayerInSession } from 'tsclients/proto/atoms.pb';
import { SeatingCorrection } from './SeatingCorrection';

const { api } = vi.hoisted(() => ({
  api: { getSessionOverview: vi.fn(), correctSessionSeating: vi.fn() },
}));
vi.mock('../../hooks/api', () => ({ useApi: () => api }));
vi.mock('../../hooks/i18n', () => ({ useI18n: () => ({ _t: (text: string) => text }) }));
let container: HTMLDivElement;
let root: Root;
const onCorrected = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  api.getSessionOverview.mockResolvedValue({
    nextRoundToken: 'fresh',
    players: [
      PlayerInSession.initialize({ id: 1, title: 'One' }),
      PlayerInSession.initialize({ id: 2, title: 'Two' }),
      PlayerInSession.initialize({ id: 3, title: 'Three' }),
    ],
  });
  api.correctSessionSeating.mockResolvedValue(true);
  onCorrected.mockResolvedValue(undefined);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root.render(
      <MantineProvider env='test'>
        <SeatingCorrection sessionHash='hash' onCorrected={onCorrected} />
      </MantineProvider>
    )
  );
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
async function click(id: string) {
  await act(async () =>
    document
      .querySelector<HTMLElement>(`[data-testid="forseti-game-correct-seating-hash-${id}"]`)!
      .click()
  );
}

it('loads fresh seats, swaps a real player and submits only once while pending', async () => {
  await click('open');
  expect(api.getSessionOverview).toHaveBeenCalledExactlyOnceWith('hash');
  expect(document.body.textContent).toContain(
    'Recorded outcomes stay attached to the named players'
  );
  expect(document.querySelectorAll('[data-testid*="-seat-"]')).toHaveLength(3);
  await click('seat-0');
  await act(async () =>
    document
      .querySelector<HTMLElement>(
        '[role="option"][value="2"], [role="option"][data-combobox-value="2"]'
      )!
      .click()
  );
  let resolve!: (value: boolean) => void;
  api.correctSessionSeating.mockReturnValueOnce(
    new Promise<boolean>((done) => {
      resolve = done;
    })
  );
  await click('confirm');
  await click('confirm');
  expect(api.correctSessionSeating).toHaveBeenCalledExactlyOnceWith('hash', [2, 1, 3], 'fresh');
  await act(async () => resolve(true));
  expect(onCorrected).toHaveBeenCalledOnce();
});

it('shows stale-token errors and refreshes on reopening', async () => {
  await click('open');
  api.correctSessionSeating.mockRejectedValueOnce({
    code: 'failed_precondition',
    msg: 'Round token is stale; refresh the session overview',
  });
  await click('confirm');
  expect(document.body.textContent).toContain('Round token is stale');
  expect(onCorrected).not.toHaveBeenCalled();
  await act(async () =>
    Array.from(document.querySelectorAll('button'))
      .find((button) => button.textContent === 'Cancel')!
      .click()
  );
  await click('open');
  expect(api.getSessionOverview).toHaveBeenCalledTimes(2);
});

it('closes a successful mutation even if the following refresh fails', async () => {
  await click('open');
  onCorrected.mockRejectedValueOnce(new Error('Refresh failed'));
  await click('confirm');
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(api.correctSessionSeating).toHaveBeenCalledOnce();
});

it('disables submission when loading fails or no token was returned', async () => {
  api.getSessionOverview.mockRejectedValueOnce(new Error('Offline'));
  await click('open');
  expect(document.body.textContent).toContain('Offline');
  expect(document.querySelector<HTMLButtonElement>('[data-testid$="-confirm"]')!.disabled).toBe(
    true
  );
});

it('keeps an unsuccessful correction open and does not refresh the table', async () => {
  await click('open');
  api.correctSessionSeating.mockResolvedValueOnce(false);
  await click('confirm');
  expect(document.body.textContent).toContain('Failed to correct seating');
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  expect(onCorrected).not.toHaveBeenCalled();
});

it('ignores repeated opens while the fresh overview is loading', async () => {
  let resolve!: (value: object) => void;
  api.getSessionOverview.mockReturnValueOnce(
    new Promise<object>((done) => {
      resolve = done;
    })
  );
  await click('open');
  await click('open');
  expect(api.getSessionOverview).toHaveBeenCalledExactlyOnceWith('hash');
  await act(async () =>
    resolve({
      nextRoundToken: 'fresh',
      players: [PlayerInSession.initialize({ id: 1, title: 'One' })],
    })
  );
  expect(document.querySelector('[data-testid$="-seat-0"]')).not.toBeNull();
});
