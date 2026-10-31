import { SessionHistoryResult } from 'tsclients/proto/atoms.pb';
import { componentHarness } from '../../../tests/componentHarness';
import { GameResult } from './GameResult';

const view = componentHarness();

it('places the log button before repeat and confirm and opens it on tap', () => {
  const onLogClick = vi.fn();
  view.render(
    <GameResult
      results={[SessionHistoryResult.initialize({ playerId: 7, title: 'Player' })]}
      showRepeatButton
      onCheckClick={vi.fn()}
      onRepeatClick={vi.fn()}
      onLogClick={onLogClick}
    />
  );
  expect(
    Array.from(view.container.querySelectorAll('button'), (button) => button.dataset.testid)
  ).toEqual(['tyr-game-result-log', 'tyr-game-result-repeat', 'tyr-game-result-confirm']);
  view.click('[data-testid="tyr-game-result-log"]');
  expect(onLogClick).toHaveBeenCalledOnce();
});
