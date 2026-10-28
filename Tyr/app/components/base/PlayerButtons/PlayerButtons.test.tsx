import { act } from 'react';
import { componentHarness } from '../../../tests/componentHarness';
import { PlayerButtons } from './PlayerButtons';
import { PlayerButtonMode } from '../../../helpers/enums';
const view = componentHarness();
it.each([PlayerButtonMode.IDLE, PlayerButtonMode.PRESSED, PlayerButtonMode.DISABLE])(
  'uses button mode %s for all round controls',
  (mode: PlayerButtonMode) => {
    const win = vi.fn(),
      lose = vi.fn(),
      riichi = vi.fn(),
      dead = vi.fn();
    view.render(
      <PlayerButtons
        winButton={mode}
        loseButton={mode}
        riichiButton={mode}
        deadButton={mode}
        onWinButtonClick={win}
        onLoseButtonClick={lose}
        onRiichiButtonClick={riichi}
        onDeadButtonClick={dead}
        testIdPrefix='player'
        rotateActionIcons='cw'
      />
    );
    for (const name of ['win', 'lose', 'dead']) view.click(`[data-testid="player-${name}"]`);
    act(() =>
      view.container
        .querySelector('[data-testid="player-riichi"]')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    );
    for (const fn of [win, lose, riichi, dead])
      expect(fn.mock.calls.length).toBe(mode === PlayerButtonMode.DISABLE ? 0 : 1);
  }
);
it.each(['ccw', 'flip', undefined] as const)(
  'renders rotation %s without requiring test IDs or handlers',
  (rotation: 'ccw' | 'flip' | undefined) => {
    view.render(
      <PlayerButtons
        rotateActionIcons={rotation}
        winButton={PlayerButtonMode.IDLE}
        loseButton={PlayerButtonMode.IDLE}
        deadButton={PlayerButtonMode.IDLE}
        riichiButton={PlayerButtonMode.IDLE}
      />
    );
    expect(view.container.querySelectorAll('button')).toHaveLength(3);
    view.render(<PlayerButtons />);
    expect(view.container.querySelectorAll('button')).toHaveLength(0);
  }
);
