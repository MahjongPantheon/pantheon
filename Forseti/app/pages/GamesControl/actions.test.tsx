import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
const roots: Array<{ root: Root; container: HTMLDivElement }> = [];
function render(node: ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push({ root, container });
  act(() => root.render(node));
}
function cleanup() {
  for (const { root, container } of roots.splice(0)) {
    act(() => root.unmount());
    container.remove();
  }
}
async function waitFor(check: () => void) {
  await act(async () => {});
  check();
}
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { GameConfig, TableState, WindShuffleMode } from 'tsclients/proto/atoms.pb';
import { auth, authCtx } from '../../hooks/auth';
import { GamesControl } from './index';

const f = vi.hoisted(() => ({
  api: Object.fromEntries(
    [
      'setEventId',
      'getGameConfig',
      'getPrescriptedEventConfig',
      'getTablesState',
      'getAllPlayers',
      'getTimerState',
      'cancelLastRound',
      'definalizeGame',
      'cancelGame',
      'startTimer',
      'addExtraTime',
      'notifyPlayers',
      'toggleResults',
      'approveResults',
      'makeIntervalSeating',
      'makeShuffledSeating',
      'makeSwissSeating',
      'makePrescriptedSeating',
      'resetSeating',
      'forceFinish',
    ].map((key) => [key, vi.fn()])
  ) as Record<string, ReturnType<typeof vi.fn>>,
  games: {} as Record<string, unknown>,
  tournament: {} as Record<string, unknown>,
  sync: true,
  show: vi.fn(),
  personId: 7 as number | null,
}));
const i18n = { _t: (s: string) => s };
const storage = { getPersonId: () => f.personId };
vi.mock('../../hooks/api', () => ({ useApi: () => f.api }));
vi.mock('../../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../../hooks/storage', () => ({ useStorage: () => storage }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: f.show } }));
vi.mock('@mantine/nprogress', () => ({
  nprogress: { reset: vi.fn(), start: vi.fn(), complete: vi.fn() },
}));
vi.mock('./GamesList', () => ({
  GamesList: (props: Record<string, unknown>) => {
    f.games = props;
    return null;
  },
}));
vi.mock('./TournamentControls', () => ({
  TournamentControls: (props: Record<string, unknown>) => {
    f.tournament = props;
    return null;
  },
}));
vi.mock('../../components/TopActionButton', () => ({ TopActionButton: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  f.personId = 7;
  f.sync = true;
  for (const method of Object.values(f.api)) method.mockResolvedValue(true);
  f.api.getGameConfig.mockImplementation(() =>
    Promise.resolve(GameConfig.initialize({ syncStart: f.sync }))
  );
  f.api.getPrescriptedEventConfig.mockResolvedValue(null);
  f.api.getTablesState.mockResolvedValue([TableState.initialize({ sessionHash: 'hash' })]);
  f.api.getAllPlayers.mockResolvedValue([]);
  f.api.getTimerState.mockResolvedValue(null);
});
afterEach(cleanup);
async function mount(sync = true) {
  f.sync = sync;
  render(
    <MantineProvider env='test'>
      <authCtx.Provider value={{ ...auth, isLoggedIn: true }}>
        <GamesControl params={{ id: '42' }} />
      </authCtx.Provider>
    </MantineProvider>
  );
  await waitFor(() => expect(f.games.eventConfig).toBeTruthy());
  vi.clearAllMocks();
}

const cases = [
  ['games', 'onCancelLastRound', ['hash', []], 'cancelLastRound', ['hash', []], 'tables'],
  ['games', 'onDefinalizeGame', ['hash'], 'definalizeGame', ['hash'], 'tables'],
  ['games', 'onRemoveGame', ['hash'], 'cancelGame', ['hash'], 'tables'],
  ['games', 'onForceFinish', ['hash'], 'forceFinish', ['hash'], 'tables'],
  ['games', 'onAddExtraTime', ['hash', 60], 'addExtraTime', [['hash'], 60], 'both'],
  ['tournament', 'startTimer', [], 'startTimer', [42], 'both'],
  ['tournament', 'notifyPlayers', [], 'notifyPlayers', [42], 'none'],
  ['tournament', 'addExtraTime', [60], 'addExtraTime', [['hash'], 60], 'both'],
  ['tournament', 'toggleResults', [], 'toggleResults', [42], 'config'],
  ['tournament', 'approveResults', [], 'approveResults', [42], 'both'],
  [
    'tournament',
    'makeIntervalSeating',
    [3, WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED],
    'makeIntervalSeating',
    [42, 3, WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED],
    'both',
  ],
  [
    'tournament',
    'makeRandomSeating',
    [WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED],
    'makeShuffledSeating',
    [42, WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED],
    'both',
  ],
  [
    'tournament',
    'makeSwissSeating',
    [WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED],
    'makeSwissSeating',
    [42, WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED],
    'both',
  ],
  [
    'tournament',
    'makeNextPredefinedSeating',
    [WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED],
    'makePrescriptedSeating',
    [42, WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED],
    'both',
  ],
  ['tournament', 'resetSeating', [], 'resetSeating', [42], 'both'],
] as const;

it.each(cases)(
  '%s.%s submits its payload and refreshes only affected state',
  async (kind, callback, args, method, payload, reload) => {
    await mount(kind === 'tournament');
    await act(async () => {
      (f[kind][callback] as (...args: unknown[]) => void)(...args);
    });
    expect(f.api[method]).toHaveBeenCalledWith(...payload);
    expect(f.api.getGameConfig.mock.calls.length > 0).toBe(
      reload === 'config' || reload === 'both'
    );
    expect(f.api.getTablesState.mock.calls.length > 0).toBe(
      reload === 'tables' || reload === 'both'
    );
    expect(f.show).not.toHaveBeenCalled();
    if (kind === 'tournament') expect(f.tournament.seatingLoading).toBe(false);
  }
);

it.each(cases)('%s.%s reports a negative acknowledgement', async (kind, callback, args, method) => {
  await mount(kind === 'tournament');
  f.api[method].mockResolvedValueOnce(false);
  await act(async () => {
    (f[kind][callback] as (...args: unknown[]) => void)(...args);
  });
  expect(f.show).toHaveBeenCalledWith(
    expect.objectContaining({ color: 'red', message: expect.stringContaining('Failed') })
  );
  expect(f.api.getGameConfig).not.toHaveBeenCalled();
  expect(f.api.getTablesState).not.toHaveBeenCalled();
  if (kind === 'tournament') expect(f.tournament.seatingLoading).toBe(false);
});

it('reports initial configuration failures and releases the loading state', async () => {
  f.api.getGameConfig.mockRejectedValueOnce(new Error('Offline'));
  render(
    <MantineProvider env='test'>
      <authCtx.Provider value={{ ...auth, isLoggedIn: true }}>
        <GamesControl params={{ id: '42' }} />
      </authCtx.Provider>
    </MantineProvider>
  );
  await waitFor(() =>
    expect(f.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Offline' }))
  );
});
