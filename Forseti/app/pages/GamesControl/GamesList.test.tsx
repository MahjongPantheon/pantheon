import { act, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import {
  GameConfig,
  RegisteredPlayer,
  SessionStatus,
  TableState,
  TournamentGamesStatus,
} from 'tsclients/proto/atoms.pb';
import { GamesList } from './GamesList';

vi.mock('../../hooks/i18n', () => ({ useI18n: () => ({ _t: (text: string) => text }) }));
vi.mock('../../components/PlayerAvatar', () => ({ PlayerAvatar: () => null }));
let container: HTMLDivElement;
let root: Root;
const callbacks = {
  onDefinalizeGame: vi.fn(),
  onCancelLastRound: vi.fn(),
  onForceFinish: vi.fn(),
  onRemoveGame: vi.fn(),
  onAddExtraTime: vi.fn(),
};
const scores = [{ playerId: 1, score: 30000, chomboCount: 0 }];
beforeEach(() => {
  vi.clearAllMocks();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
function render(
  table: Partial<TableState> = {},
  config: Partial<GameConfig> = {},
  other: Partial<ComponentProps<typeof GamesList>> = {}
) {
  act(() =>
    root.render(
      <MantineProvider env='test'>
        <GamesList
          tablesState={[
            TableState.initialize({
              sessionHash: 'hash',
              status: SessionStatus.SESSION_STATUS_FINISHED,
              mayDefinalize: true,
              scores,
              ...table,
            }),
          ]}
          eventConfig={GameConfig.initialize(config)}
          timerState={null}
          {...callbacks}
          {...other}
        />
      </MantineProvider>
    )
  );
}
async function click(id: string) {
  await act(async () => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!.click());
}
async function confirm(action: string) {
  await click(`forseti-game-${action}-hash-open`);
  await click(`forseti-game-${action}-hash-confirm`);
}

it('warns about both removals and confirms them through a single action', async () => {
  render();
  await click('forseti-game-cancel-results-hash-open');
  expect(document.body.textContent).toContain(
    'This will remove the game results and the last round'
  );
  expect(callbacks.onDefinalizeGame).not.toHaveBeenCalled();
  await click('forseti-game-cancel-results-hash-confirm');
  expect(callbacks.onDefinalizeGame).toHaveBeenCalledExactlyOnceWith('hash', scores);
  expect(callbacks.onCancelLastRound).not.toHaveBeenCalled();
});

it('keeps ordinary round cancellation and force finish available for an ongoing club game', async () => {
  render(
    {
      status: SessionStatus.SESSION_STATUS_INPROGRESS,
      currentRoundIndex: 1,
      extraTime: 60,
      players: [
        RegisteredPlayer.initialize({ id: 1, title: 'One' }),
        RegisteredPlayer.initialize({ id: 2, title: 'Two' }),
        RegisteredPlayer.initialize({ id: 3, title: 'Three' }),
      ],
      scores: [
        ...scores,
        { playerId: 2, score: 35000, chomboCount: 0 },
        { playerId: 3, score: 25000, chomboCount: 0 },
      ],
      lastRound: { draw: { tempai: [1], roundIndex: 1, honba: 0, riichiBets: [] } },
    },
    {
      rulesetConfig: { startPoints: 30000 } as GameConfig['rulesetConfig'],
      isOnline: true,
      isPrescripted: true,
    }
  );
  expect(container.textContent).toContain('One');
  expect(
    document.querySelector('[data-testid="forseti-game-cancel-results-hash-open"]')
  ).toBeNull();
  await confirm('cancel-last-round');
  expect(callbacks.onCancelLastRound).toHaveBeenCalledOnce();
  await confirm('force-finish');
  expect(callbacks.onForceFinish).toHaveBeenCalledExactlyOnceWith('hash');
});

it('allows removing a game before its first round', async () => {
  render(
    { status: SessionStatus.SESSION_STATUS_INPROGRESS },
    { gamesStatus: TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY }
  );
  expect(container.querySelector('[title="Session is ready to start"]')).not.toBeNull();
  await confirm('remove');
  expect(callbacks.onRemoveGame).toHaveBeenCalledExactlyOnceWith('hash');
});

it('keeps tournament extra time and prefinished round cancellation separate from club undo', async () => {
  render({ status: SessionStatus.SESSION_STATUS_INPROGRESS }, { syncStart: true });
  await click('forseti-game-add-extra-time-hash-open');
  await click('forseti-game-extra-time-hash');
  await act(async () =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
      .find((el) => el.textContent === '2 minutes')!
      .click()
  );
  await click('forseti-game-add-extra-time-hash-confirm');
  expect(callbacks.onAddExtraTime).toHaveBeenCalledExactlyOnceWith('hash', 120);
  render(
    {
      status: SessionStatus.SESSION_STATUS_PREFINISHED,
      lastRound: { draw: { tempai: [], roundIndex: 8, honba: 0, riichiBets: [] } },
    },
    { syncStart: true }
  );
  await confirm('cancel-last-round');
  expect(callbacks.onCancelLastRound).toHaveBeenCalledOnce();
  expect(
    document.querySelector('[data-testid="forseti-game-cancel-results-hash-open"]')
  ).toBeNull();
});

it('hides result cancellation when reopening is not permitted', () => {
  render({ mayDefinalize: false });
  expect(container.querySelector('[data-testid$="-open"]')).toBeNull();
});

it('shows planned and cancelled games without cancellation actions', () => {
  render(
    {},
    {},
    {
      tablesState: [
        SessionStatus.SESSION_STATUS_PLANNED,
        SessionStatus.SESSION_STATUS_CANCELLED,
        SessionStatus.SESSION_STATUS_UNSPECIFIED,
      ].map((status, index) => TableState.initialize({ status, sessionHash: `hash${index}` })),
    }
  );
  expect(container.querySelector('[title="Session is scheduled"]')).not.toBeNull();
  expect(container.querySelector('[title="Session cancelled"]')).not.toBeNull();
  expect(container.querySelector('[data-testid$="-open"]')).toBeNull();
});
