import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Event, EventType, GameConfig, RegisteredPlayer } from 'tsclients/proto/atoms.pb';
import { auth, authCtx, PrivilegesLevel } from '../../hooks/auth';
import { ManagementTab } from './ManagementTab';
import { LocalIdsTab } from './LocalIdsTab';
import { TeamNamesTab } from './TeamNamesTab';

const { api } = vi.hoisted(() => ({
  api: {
    registerPlayer: vi.fn(),
    getAllPlayers: vi.fn(),
    updateLocalIds: vi.fn(),
    updateTeamNames: vi.fn(),
  },
}));
const i18n = { _t: (text: string) => text };
vi.mock('../../hooks/api', () => ({ useApi: () => api }));
vi.mock('../../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../../components/TopActionButton', () => ({
  TopActionButton: ({ testId, onClick }: { testId: string; onClick: () => void }) => (
    <button data-testid={testId} onClick={onClick}>
      Save
    </button>
  ),
}));
vi.mock('./PlayerSelector', () => ({
  PlayerSelector: ({
    testId,
    onPlayerSelect,
  }: {
    testId: string;
    onPlayerSelect: (player: RegisteredPlayer) => void;
  }) => (
    <button
      data-testid={testId}
      onClick={() => onPlayerSelect(RegisteredPlayer.initialize({ id: 101, title: 'Player' }))}
    >
      Select
    </button>
  ),
}));

let container: HTMLDivElement;
let root: Root;
const setPlayers = vi.fn();
const registered = RegisteredPlayer.initialize({ id: 101, title: 'Player', localId: 7 });

beforeEach(() => {
  vi.clearAllMocks();
  api.registerPlayer.mockResolvedValue(true);
  api.updateLocalIds.mockResolvedValue(true);
  api.updateTeamNames.mockResolvedValue(true);
  api.getAllPlayers.mockResolvedValue([registered]);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

it('loads the assigned local ID after adding a player', async () => {
  await act(async () =>
    root.render(
      <MantineProvider env='test'>
        <authCtx.Provider value={{ ...auth, privilegesLevel: PrivilegesLevel.ADMIN }}>
          <ManagementTab
            eventId={42}
            players={[]}
            setPlayers={setPlayers}
            config={GameConfig.initialize({ isPrescripted: true })}
            event={Event.initialize({ type: EventType.EVENT_TYPE_TOURNAMENT })}
            tables={[]}
          />
        </authCtx.Provider>
      </MantineProvider>
    )
  );
  await act(async () =>
    container
      .querySelector<HTMLButtonElement>('[data-testid="forseti-players-add-selector"]')!
      .click()
  );
  expect(api.registerPlayer).toHaveBeenCalledWith(101, 42);
  expect(api.getAllPlayers).toHaveBeenCalledWith(42);
  expect(setPlayers).toHaveBeenCalledWith([registered]);
});

it('refreshes parent registration data after saving local IDs', async () => {
  await act(async () =>
    root.render(
      <MantineProvider env='test'>
        <LocalIdsTab eventId={42} players={[registered]} setPlayers={setPlayers} />
      </MantineProvider>
    )
  );
  await act(async () =>
    container
      .querySelector<HTMLButtonElement>('[data-testid="forseti-players-local-ids-save"]')!
      .click()
  );
  expect(api.updateLocalIds).toHaveBeenCalledWith(42, { 101: 7 });
  expect(api.getAllPlayers).toHaveBeenCalledWith(42);
  expect(setPlayers).toHaveBeenCalledWith([registered]);
});

it('refreshes parent registration data after saving team names', async () => {
  await act(async () =>
    root.render(
      <MantineProvider env='test'>
        <TeamNamesTab eventId={42} players={[registered]} setPlayers={setPlayers} />
      </MantineProvider>
    )
  );
  await act(async () =>
    container
      .querySelector<HTMLButtonElement>('[data-testid="forseti-players-team-names-save"]')!
      .click()
  );
  expect(api.updateTeamNames).toHaveBeenCalledWith(42, { 101: '' });
  expect(api.getAllPlayers).toHaveBeenCalledWith(42);
  expect(setPlayers).toHaveBeenCalledWith([registered]);
});
