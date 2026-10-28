import { act, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  Event,
  EventType,
  GameConfig,
  RegisteredPlayer,
  TableState,
  SessionStatus,
} from 'tsclients/proto/atoms.pb';
import { auth, authCtx, PrivilegesLevel } from '../../hooks/auth';
import { ManagementTab } from './ManagementTab';

const { api } = vi.hoisted(() => ({
  api: {
    updateSeatingFlag: vi.fn(),
    unregisterPlayer: vi.fn(),
    updatePlayerReplacement: vi.fn(),
    registerPlayer: vi.fn(),
    getAllPlayers: vi.fn(),
  },
}));
vi.mock('../../hooks/api', () => ({ useApi: () => api }));
vi.mock('../../hooks/i18n', () => ({ useI18n: () => ({ _t: (text: string) => text }) }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
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
      onClick={() =>
        onPlayerSelect(
          RegisteredPlayer.initialize({
            id: 9,
            title: 'Replacement',
            hasAvatar: true,
            lastUpdate: 'today',
          })
        )
      }
    >
      Select
    </button>
  ),
}));

let container: HTMLDivElement;
let root: Root;
const setPlayers = vi.fn();
const players = [1, 2, 3].map((id) =>
  RegisteredPlayer.initialize({ id, title: `Player ${id}`, tenhouId: `online${id}` })
);

beforeEach(() => {
  vi.resetAllMocks();
  api.updateSeatingFlag.mockResolvedValue(true);
  api.unregisterPlayer.mockResolvedValue(true);
  api.updatePlayerReplacement.mockResolvedValue(true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function render(
  props: Partial<ComponentProps<typeof ManagementTab>> = {},
  privilegesLevel = PrivilegesLevel.ADMIN,
  dark = false
) {
  await act(async () =>
    root.render(
      <MantineProvider env='test' forceColorScheme={dark ? 'dark' : 'light'}>
        <authCtx.Provider value={{ ...auth, privilegesLevel }}>
          <ManagementTab
            eventId={42}
            players={players}
            setPlayers={setPlayers}
            config={GameConfig.initialize({ syncStart: true, isOnline: true })}
            event={Event.initialize({ type: EventType.EVENT_TYPE_TOURNAMENT })}
            tables={[]}
            {...props}
          />
        </authCtx.Provider>
      </MantineProvider>
    )
  );
}
async function click(id: string) {
  const button = document.querySelector<HTMLButtonElement>(`[data-testid="forseti-players-${id}"]`);
  expect(button).not.toBeNull();
  await act(async () => button!.click());
}

it.each([false, true])(
  'toggles seating exclusion from %s while preserving other players',
  async (ignoreSeating) => {
    const current = players.map((p) => ({ ...p, ignoreSeating }));
    await render({ players: current });
    await click('toggle-seating-2');
    expect(api.updateSeatingFlag).toHaveBeenCalledWith(2, 42, !ignoreSeating);
    expect(setPlayers).toHaveBeenCalledWith([
      current[0],
      { ...current[1], ignoreSeating: !ignoreSeating },
      current[2],
    ]);
  }
);
it.each(['refused', 'error'])(
  'preserves seating after a %s response and allows retry',
  async (result) => {
    if (result === 'error')
      api.updateSeatingFlag.mockRejectedValueOnce(new Error('Seating locked'));
    else api.updateSeatingFlag.mockResolvedValueOnce(false);
    await render();
    await click('toggle-seating-2');
    expect(setPlayers).not.toHaveBeenCalled();
    if (result === 'error')
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Seating locked', color: 'red' })
      );
    await click('toggle-seating-2');
    expect(setPlayers).toHaveBeenCalledOnce();
  }
);
it.each([false, true])('removes a player only on successful unregister (%s)', async (success) => {
  api.unregisterPlayer.mockResolvedValue(success);
  await render();
  await click('remove-2');
  expect(api.unregisterPlayer).toHaveBeenCalledWith(2, 42);
  if (success) expect(setPlayers).toHaveBeenCalledWith([players[0], players[2]]);
  else expect(setPlayers).not.toHaveBeenCalled();
});
it.each([false, true])('sets a replacement only after API success (%s)', async (success) => {
  api.updatePlayerReplacement.mockResolvedValue(success);
  await render();
  await click('replace-2');
  await click('replacement-selector');
  expect(api.updatePlayerReplacement).toHaveBeenCalledWith(2, 42, 9);
  if (success)
    expect(setPlayers).toHaveBeenCalledWith([
      players[0],
      {
        ...players[1],
        replacedBy: { id: 9, title: 'Replacement', hasAvatar: true, lastUpdate: 'today' },
      },
      players[2],
    ]);
  else expect(setPlayers).not.toHaveBeenCalled();
});
it('clears a replacement using the API sentinel', async () => {
  await render({
    players: [
      {
        ...players[0],
        replacedBy: { id: 9, title: 'Replacement', hasAvatar: false, lastUpdate: '' },
      },
    ],
  });
  expect(container.textContent).toContain('Replacement');
  await click('remove-replacement-1');
  expect(api.updatePlayerReplacement).toHaveBeenCalledWith(1, 42, -1);
  expect(setPlayers).toHaveBeenCalledWith([{ ...players[0], replacedBy: null }]);
});
it('does not refresh registrations when adding a player is refused', async () => {
  api.registerPlayer.mockResolvedValue(false);
  await render();
  await click('add-selector');
  expect(api.registerPlayer).toHaveBeenCalledWith(9, 42);
  expect(api.getAllPlayers).not.toHaveBeenCalled();
  expect(setPlayers).not.toHaveBeenCalled();
});
it.each([PrivilegesLevel.NOBODY, PrivilegesLevel.REFEREE])(
  'hides registration controls from privilege level %s',
  async (level) => {
    await render({}, level);
    expect(container.querySelector('[data-testid="forseti-players-add-selector"]')).toBeNull();
    expect(container.querySelector('[data-testid="forseti-players-remove-1"]')).toBeNull();
  }
);
it('hides registration controls after the tournament starts', async () => {
  await render({ event: Event.initialize({ tournamentStarted: true }) });
  expect(container.querySelector('[data-testid="forseti-players-remove-1"]')).toBeNull();
});
it('hides replacement and seating controls for an asynchronous local event', async () => {
  await render(
    {
      event: Event.initialize({ type: EventType.EVENT_TYPE_LOCAL }),
      config: GameConfig.initialize(),
    },
    PrivilegesLevel.ADMIN,
    true
  );
  expect(container.querySelector('[data-testid="forseti-players-replace-1"]')).toBeNull();
  expect(container.querySelector('[data-testid="forseti-players-toggle-seating-1"]')).toBeNull();
  expect(container.textContent).not.toContain('online1');
});
it('allows seating exclusions in an online event without synchronous starts', async () => {
  await render({
    event: Event.initialize({ type: EventType.EVENT_TYPE_ONLINE }),
    config: GameConfig.initialize(),
  });
  await click('toggle-seating-1');
  expect(api.updateSeatingFlag).toHaveBeenCalledWith(1, 42, true);
});
it('hides exclusions for prescribed seating', async () => {
  await render({ config: GameConfig.initialize({ syncStart: true, isPrescripted: true }) });
  expect(container.querySelector('[data-testid="forseti-players-toggle-seating-1"]')).toBeNull();
});
it('disables seating changes while a session is in progress', async () => {
  await render({
    tables: [TableState.initialize({ status: SessionStatus.SESSION_STATUS_INPROGRESS })],
  });
  await click('toggle-seating-1');
  expect(api.updateSeatingFlag).not.toHaveBeenCalled();
  expect(
    container.querySelector<HTMLButtonElement>('[data-testid="forseti-players-toggle-seating-1"]')!
      .disabled
  ).toBe(true);
});
