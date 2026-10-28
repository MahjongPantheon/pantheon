import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
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
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
const i18n = { _t: (text: string) => text };
vi.mock('../../hooks/api', () => ({ useApi: () => api }));
vi.mock('../../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../../components/TopActionButton', () => ({
  TopActionButton: ({
    testId,
    onClick,
    title,
    loading,
  }: {
    testId: string;
    onClick: () => void;
    title: string;
    loading: boolean;
  }) => (
    <button data-testid={testId} onClick={onClick} disabled={loading}>
      {title}
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
  vi.resetAllMocks();
  vi.useFakeTimers();
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
  vi.useRealTimers();
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

for (const kind of ['local-ids', 'team-names'] as const) {
  describe(`${kind} saves`, () => {
    const local = kind === 'local-ids';
    const Component = local ? LocalIdsTab : TeamNamesTab;
    const save = () =>
      container.querySelector<HTMLButtonElement>(`[data-testid="forseti-players-${kind}-save"]`)!;
    async function render() {
      await act(async () =>
        root.render(
          <MantineProvider env='test' forceColorScheme='dark'>
            <Component
              eventId={42}
              players={[
                RegisteredPlayer.initialize({ id: 101, title: 'First' }),
                RegisteredPlayer.initialize({
                  id: 102,
                  title: 'Second',
                  localId: 8,
                  teamName: 'Old team',
                }),
              ]}
              setPlayers={setPlayers}
            />
          </MantineProvider>
        )
      );
    }
    function edit(value: string) {
      const input = container.querySelector<HTMLInputElement>(
        `[data-testid="forseti-players-${local ? 'local-id' : 'team-name'}-input-102"]`
      )!;
      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
          input,
          value
        );
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
      });
    }
    it('submits edited values, refreshes players, and clears saved feedback after five seconds', async () => {
      await render();
      edit(local ? '25' : 'New team');
      await act(async () => save().click());
      expect(local ? api.updateLocalIds : api.updateTeamNames).toHaveBeenCalledWith(
        42,
        local ? { 101: 0, 102: 25 } : { 101: '', 102: 'New team' }
      );
      expect(setPlayers).toHaveBeenCalledWith([registered]);
      expect(save().textContent).toBe('Changes saved!');
      expect(save().disabled).toBe(true);
      await act(async () => vi.advanceTimersByTime(5000));
      expect(save().textContent).toBe('Save changes');
      expect(save().disabled).toBe(false);
    });
    it.each(['refused', 'error'])(
      'preserves parent data after a %s response and enables retry',
      async (result) => {
        const update = local ? api.updateLocalIds : api.updateTeamNames;
        if (result === 'error') update.mockRejectedValueOnce(new Error('Save failed'));
        else update.mockResolvedValueOnce(false);
        await render();
        await act(async () => save().click());
        expect(setPlayers).not.toHaveBeenCalled();
        expect(api.getAllPlayers).not.toHaveBeenCalled();
        expect(save().disabled).toBe(false);
        expect(save().textContent).toBe('Save changes');
        if (result === 'error')
          expect(notifications.show).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Save failed', color: 'red' })
          );
        await act(async () => save().click());
        expect(setPlayers).toHaveBeenCalledWith([registered]);
      }
    );
    if (local)
      it('saves a cleared local ID as zero', async () => {
        await render();
        edit('');
        await act(async () => save().click());
        expect(api.updateLocalIds).toHaveBeenCalledWith(42, { 101: 0, 102: 0 });
      });
  });
}
