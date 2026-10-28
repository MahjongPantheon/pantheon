import { componentHarness } from '../../../tests/componentHarness';
import { PlayerPlace } from './PlayerPlace';
import { PlayerButtonMode } from '../../../helpers/enums';

vi.mock('../Player/Player', () => ({
  Player: ({ playerName }: { playerName: string }) => <span>{playerName}</span>,
}));
vi.mock('../PlayerPoints/PlayerPoints', () => ({ PlayerPoints: () => <span>25000</span> }));
const view = componentHarness();
it('separates tappable player details from the player action buttons', () => {
  const details = vi.fn(),
    win = vi.fn();
  view.render(
    <PlayerPlace
      id={1}
      playerName='Player'
      points='25000'
      onPlayerClick={details}
      buttons={{ winButton: PlayerButtonMode.IDLE, onWinButtonClick: win }}
      testIdPrefix='player'
    />
  );
  view.click('[data-testid="player-win"]');
  expect(win).toHaveBeenCalledOnce();
  expect(details).not.toHaveBeenCalled();
  expect(view.container.querySelector('button button')).toBeNull();
  const button = [...view.container.querySelectorAll('button')].find(
    (node) => node.textContent === 'Player25000'
  )!;
  button.click();
  expect(details).toHaveBeenCalledOnce();
});
