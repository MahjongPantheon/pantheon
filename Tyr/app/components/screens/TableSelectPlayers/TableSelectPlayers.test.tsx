import { GameConfig, PlayerInSession, RoundOutcome } from 'tsclients/proto/atoms.pb';
import { componentHarness } from '../../../tests/componentHarness';
import { initialState, initBlankOutcome } from '../../../store/state';
import type { IAppState } from '../../../store/interfaces';
import { TableSelectPlayers } from './TableSelectPlayers';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});

const view = componentHarness();
const ready = {
  ...initialState,
  currentScreen: 'playersSelect' as const,
  currentPlayerId: 1,
  gameOverviewReady: true,
  gameConfig: GameConfig.initialize({}),
  players: [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id, title: `Player ${id}` })),
  currentOutcome: initBlankOutcome(1, RoundOutcome.ROUND_OUTCOME_RON),
};

it.each([
  { gameOverviewReady: false },
  { loading: { ...initialState.loading, games: true } },
  { players: undefined },
  { players: ready.players.slice(0, 3) },
])(
  'waits for a complete overview and current rules before showing winner controls: %j',
  (pending: Partial<IAppState>) => {
    view.render(
      <TableSelectPlayers state={{ ...ready, ...pending }} dispatch={vi.fn()} newyear={false} />
    );
    expect(view.container.querySelector('[data-testid="tyr-select-player-status"]')).toBeNull();
    view.render(<TableSelectPlayers state={ready} dispatch={vi.fn()} newyear={false} />);
    expect(view.container.querySelector('[data-testid="tyr-select-player-status"]')).not.toBeNull();
  }
);
