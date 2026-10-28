import { componentHarness } from '../../../tests/componentHarness';
import { GameResultScreen } from './GameResultScreen';
import { initialState } from '../../../store/state';
import { GOTO_NEXT_SCREEN, START_NEW_GAME } from '../../../store/actions/interfaces';
import type { IAppState } from '../../../store/interfaces';

vi.mock('../../pages/GameResult/GameResult', () => ({
  GameResult: ({
    results,
    onCheckClick,
    onRepeatClick,
  }: {
    results: { playerId: number }[];
    onCheckClick: () => void;
    onRepeatClick: () => void;
  }) => (
    <>
      <output>{results.map((p) => p.playerId).join(',')}</output>
      <button onClick={onCheckClick}>Done</button>
      <button onClick={onRepeatClick}>Repeat</button>
    </>
  ),
}));

const view = componentHarness();
it('keeps hook order across loading transitions and dispatches the current results', () => {
  const dispatch = vi.fn();
  const ready = {
    ...initialState,
    currentScreen: 'lastResults',
    gameConfig: { autoSeating: false },
    loading: {},
    lastResults: [
      { playerId: 1, score: 100 },
      { playerId: 2, score: 200 },
    ],
  } as IAppState;
  view.render(
    <GameResultScreen
      newyear={false}
      state={{ ...ready, loading: { ...ready.loading, games: true } }}
      dispatch={dispatch}
    />
  );
  view.render(<GameResultScreen newyear={false} state={ready} dispatch={dispatch} />);
  expect(view.container.querySelector('output')?.textContent).toBe('2,1');
  view.click('button');
  expect(dispatch).toHaveBeenLastCalledWith({ type: GOTO_NEXT_SCREEN });
  view.click('button:last-child');
  expect(dispatch).toHaveBeenLastCalledWith({ type: START_NEW_GAME, payload: [1, 2] });
  view.render(
    <GameResultScreen
      newyear={false}
      state={{ ...ready, gameConfig: undefined }}
      dispatch={dispatch}
    />
  );
  view.render(<GameResultScreen newyear={false} state={ready} dispatch={dispatch} />);
  expect(view.container.querySelector('output')).toBeTruthy();
});
