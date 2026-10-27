import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import {
  Event,
  EventType,
  GameConfig,
  RegisteredPlayer,
  TableState,
} from 'tsclients/proto/atoms.pb';
import { auth, authCtx } from '../../hooks/auth';
import { PlayersManage } from './index';

const { api } = vi.hoisted(() => ({
  api: {
    setEventId: vi.fn(),
    getGameConfig: vi.fn(),
    getEventsById: vi.fn(),
    getAllPlayers: vi.fn(),
    getTablesState: vi.fn(),
  },
}));
const i18n = { _t: (text: string) => text };
const storage = { getPersonId: () => 1 };
vi.mock('../../hooks/api', () => ({ useApi: () => api }));
vi.mock('../../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../../hooks/storage', () => ({ useStorage: () => storage }));
vi.mock('@mantine/nprogress', () => ({
  nprogress: { reset: vi.fn(), start: vi.fn(), complete: vi.fn() },
}));
vi.mock('./ManagementTab', () => ({
  ManagementTab: ({ players }: { players: RegisteredPlayer[] }) => (
    <div>{players.map((player) => player.title).join(', ')}</div>
  ),
}));
vi.mock('./LocalIdsTab', () => ({ LocalIdsTab: () => null }));
vi.mock('./TeamNamesTab', () => ({ TeamNamesTab: () => null }));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.clearAllMocks();
  api.getGameConfig.mockResolvedValue(GameConfig.initialize({ syncStart: true }));
  api.getEventsById.mockResolvedValue([
    Event.initialize({ type: EventType.EVENT_TYPE_TOURNAMENT }),
  ]);
  api.getAllPlayers.mockImplementation(async (id: number) => [
    RegisteredPlayer.initialize({ id, title: `Player ${id}` }),
  ]);
  api.getTablesState.mockResolvedValue([]);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function render(id: string) {
  await act(async () => {
    root.render(
      <MantineProvider env='test'>
        <authCtx.Provider value={{ ...auth, isLoggedIn: true }}>
          <PlayersManage params={{ id }} />
        </authCtx.Provider>
      </MantineProvider>
    );
  });
}

it('loads a new event and ignores a previous event response delayed by its tables request', async () => {
  let resolve!: (tables: TableState[]) => void;
  api.getTablesState.mockReturnValueOnce(
    new Promise<TableState[]>((done) => {
      resolve = done;
    })
  );
  await render('1');
  await render('2');
  expect(api.getAllPlayers).toHaveBeenLastCalledWith(2);
  expect(container.textContent).toContain('Player 2');
  await act(async () => resolve([]));
  expect(container.textContent).toContain('Player 2');
  expect(container.textContent).not.toContain('Player 1');
});
