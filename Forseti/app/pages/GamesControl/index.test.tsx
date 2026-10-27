import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { GameConfig } from 'tsclients/proto/atoms.pb';
import { auth, authCtx } from '../../hooks/auth';
import { GamesControl } from './index';

const { api, show } = vi.hoisted(() => ({
  api: {
    setEventId: vi.fn(),
    getGameConfig: vi.fn(),
    getPrescriptedEventConfig: vi.fn(),
    getTablesState: vi.fn(),
    getAllPlayers: vi.fn(),
    getTimerState: vi.fn(),
    startTimer: vi.fn(),
  },
  show: vi.fn(),
}));
const i18n = { _t: (text: string) => text };
const storage = { getPersonId: () => 1 };
vi.mock('../../hooks/api', () => ({ useApi: () => api }));
vi.mock('../../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../../hooks/storage', () => ({ useStorage: () => storage }));
vi.mock('@mantine/notifications', () => ({ notifications: { show } }));
vi.mock('@mantine/nprogress', () => ({
  nprogress: { reset: vi.fn(), start: vi.fn(), complete: vi.fn() },
}));
vi.mock('./GamesList', () => ({
  GamesList: ({ eventConfig }: { eventConfig: GameConfig | null }) => (
    <span data-testid='event-title'>{eventConfig?.eventTitle}</span>
  ),
}));
vi.mock('./TournamentControls', () => ({
  TournamentControls: ({ startTimer }: { startTimer: () => void }) => (
    <button onClick={startTimer}>Start timer</button>
  ),
}));
vi.mock('../../components/TopActionButton', () => ({
  TopActionButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Refresh</button>
  ),
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  api.getGameConfig.mockResolvedValue(GameConfig.initialize({ syncStart: true }));
  api.getPrescriptedEventConfig.mockResolvedValue(null);
  api.getTablesState.mockResolvedValue([]);
  api.getAllPlayers.mockResolvedValue([]);
  api.getTimerState.mockResolvedValue(null);
  api.startTimer.mockResolvedValue(true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function render(id = '1', isLoggedIn = true) {
  await act(async () => {
    root.render(
      <StrictMode>
        <MantineProvider env='test'>
          <authCtx.Provider value={{ ...auth, isLoggedIn }}>
            <GamesControl params={{ id }} />
          </authCtx.Provider>
        </MantineProvider>
      </StrictMode>
    );
  });
}

async function advance(seconds: number) {
  // Commit each countdown tick as a browser would, rather than batching a minute.
  for (let second = 0; second < seconds; second++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  }
}

it('polls once per minute in StrictMode and retries after a failed refresh', async () => {
  await render();
  api.getGameConfig.mockClear().mockRejectedValueOnce(new Error('Offline'));
  await advance(59);
  expect(api.getGameConfig).not.toHaveBeenCalled();
  await advance(1);
  expect(api.getGameConfig).toHaveBeenCalledExactlyOnceWith(1);
  expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Offline' }));
  await advance(60);
  expect(api.getGameConfig).toHaveBeenCalledTimes(2);
});

it('uses the current event for actions and ignores an old event refresh', async () => {
  await render();
  let resolve!: (config: GameConfig) => void;
  api.getGameConfig.mockReturnValueOnce(
    new Promise<GameConfig>((done) => {
      resolve = done;
    })
  );
  await act(async () => {
    Array.from(container.querySelectorAll('button'))
      .find((button) => button.textContent === 'Refresh')!
      .click();
  });
  api.getGameConfig.mockResolvedValue(
    GameConfig.initialize({ syncStart: true, eventTitle: 'Current event' })
  );
  await render('2');
  await act(async () => {
    resolve(GameConfig.initialize({ eventTitle: 'Old event' }));
  });
  expect(container.querySelector('[data-testid="event-title"]')!.textContent).toBe('Current event');
  await act(async () => {
    Array.from(container.querySelectorAll('button'))
      .find((button) => button.textContent === 'Start timer')!
      .click();
  });
  expect(api.startTimer).toHaveBeenCalledExactlyOnceWith(2);
  expect(api.getGameConfig).toHaveBeenLastCalledWith(2);
});

it('stops polling on logout and unmount', async () => {
  await render();
  await render('1', false);
  api.getGameConfig.mockClear();
  await advance(65);
  expect(api.getGameConfig).not.toHaveBeenCalled();
  await render();
  act(() => root.unmount());
  root = createRoot(container);
  api.getGameConfig.mockClear();
  await advance(65);
  expect(api.getGameConfig).not.toHaveBeenCalled();
});

it('does not reload an old event when its pending action finishes after navigation', async () => {
  await render();
  let resolve!: (success: boolean) => void;
  api.startTimer.mockReturnValueOnce(
    new Promise<boolean>((done) => {
      resolve = done;
    })
  );
  await act(async () => {
    Array.from(container.querySelectorAll('button'))
      .find((button) => button.textContent === 'Start timer')!
      .click();
  });
  await render('2');
  api.getGameConfig.mockClear();
  await act(async () => resolve(true));
  expect(api.getGameConfig).not.toHaveBeenCalled();
});
