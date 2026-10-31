import {
  GameConfig,
  RoundOutcome,
  RoundState,
  SessionHistoryResult,
} from 'tsclients/proto/atoms.pb';
import { componentHarness } from '../../../tests/componentHarness';
import { initialState } from '../../../store/state';
import type { IRoundResult, PlayerDescriptor } from '../../../helpers/interfaces';
import { Log } from './Log';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});

vi.mock('../../../store/selectors/logScreen', () => ({
  getRoundOverviewInfo: vi.fn(() => ({})),
}));
vi.mock('../../pages/LogView/LogView', () => ({
  LogView: ({ players, results }: { players: PlayerDescriptor[]; results: IRoundResult[] }) => (
    <>
      <output>{players.map((player) => player.playerName).join(',')}</output>
      <output data-testid='scores'>{JSON.stringify(results)}</output>
    </>
  ),
}));

const view = componentHarness();

it('renders previous-game players and scores without active-game players', () => {
  const state = {
    ...initialState,
    gameLogOrigin: 'lastResults' as const,
    gameConfig: GameConfig.initialize({}),
    players: undefined,
    currentOtherTablePlayers: [],
    lastResults: [SessionHistoryResult.initialize({ playerId: 7, title: 'Previous player' })],
    allRoundsOverview: [
      RoundState.initialize({
        outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
        roundIndex: 1,
        scores: [{ playerId: 7, score: 26000, chomboCount: 0 }],
        scoresDelta: [{ playerId: 7, score: 1000, chomboCount: 0 }],
      }),
    ],
  };
  view.render(<Log state={state} dispatch={vi.fn()} newyear={false} />);
  expect(view.container.textContent).toContain('Previous player');
  expect(view.container.querySelector('[data-testid="scores"]')?.textContent).toContain('26000');
});
