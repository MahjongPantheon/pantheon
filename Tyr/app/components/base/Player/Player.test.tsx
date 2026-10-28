import { act } from 'react';
import { componentHarness } from '../../../tests/componentHarness';
import { i18n } from '../../i18n';
import { I18nService } from '../../../services/i18n';
import { Player } from './Player';
import { makeColors, makeInitials } from '../Avatar/Avatar';

const view = componentHarness();
const loc = { _t: (s: string) => s } as I18nService;

it.each([
  ['e', '東'],
  ['s', '南'],
  ['w', '西'],
  ['n', '北'],
] as const)(
  'shows the %s wind with player identity and chombo',
  (currentWind: 'e' | 's' | 'w' | 'n', label: string) => {
    view.render(
      <i18n.Provider value={loc}>
        <Player
          id={7}
          playerName='Alice Smith'
          currentWind={currentWind}
          showChomboSign
          showYakitori
          size='lg'
          upsideDown
        />
      </i18n.Provider>
    );
    expect(view.container.textContent).toContain('Alice Smith');
    expect(view.container.textContent).toContain(label);
    expect(view.container.textContent).toContain('Chombo');
    expect(view.container.textContent).toContain('AS');
  }
);

it.each(['sm', 'md', 'lg', undefined] as const)(
  'renders %s size and falls back after an avatar error',
  (size: 'sm' | 'md' | 'lg' | undefined) => {
    view.render(
      <i18n.Provider value={loc}>
        <Player id={7} title='Alice' hasAvatar lastUpdate='today' size={size} />
      </i18n.Provider>
    );
    const image = view.container.querySelector('img')!;
    expect(image.getAttribute('src')).toContain('user_7.jpg?today');
    act(() => image.dispatchEvent(new Event('error')));
    expect(view.container.querySelector('img')).toBeNull();
    expect(view.container.textContent).toContain('A');
    view.render(
      <i18n.Provider value={loc}>
        <Player />
      </i18n.Provider>
    );
    expect(view.container.textContent).toContain('??');
  }
);

it('builds stable initials and fallback colors', () => {
  expect(makeInitials('')).toBe('??');
  expect(makeInitials('alice')).toBe('A');
  expect(makeInitials(' alice   bob carol ')).toBe('AB');
  expect(makeColors('')).toEqual({
    color: 'var(--color-secondary-1)',
    backgroundColor: 'var(--color-secondary-3)',
  });
  expect(makeColors('Alice')).toEqual(makeColors('Alice'));
  expect(makeColors('Alice').color).toMatch(/^var\(--avatar-fg-/);
});
