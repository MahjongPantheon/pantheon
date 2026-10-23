import { GameConfig } from 'tsclients/proto/atoms.pb';
import { initialState } from '../state';
import { getOtherTableStatus, getTableStatus } from './table';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('call referee visibility', () => {
  it.each([
    [undefined, true, false],
    ['', true, false],
    ['pantheon_bot', true, true],
    [undefined, false, false],
    ['', false, false],
    ['pantheon_bot', false, false],
  ] as const)(
    'uses bot nickname %s and tournament mode %s to show the button: %s',
    (botNickname: string | undefined, syncStart: boolean, expected: boolean) => {
      vi.stubEnv('VITE_BOT_NICKNAME', botNickname);
      const state = { ...initialState, gameConfig: GameConfig.initialize({ syncStart }) };

      expect(getTableStatus(state).showCallReferee).toBe(expected);
    }
  );

  it('hides the button before the event configuration is available', () => {
    vi.stubEnv('VITE_BOT_NICKNAME', 'pantheon_bot');

    expect(getTableStatus(initialState).showCallReferee).toBe(false);
  });

  it.each([undefined, '', 'pantheon_bot'])(
    'hides the button on other tables with bot nickname %s',
    (botNickname: string | undefined) => {
      vi.stubEnv('VITE_BOT_NICKNAME', botNickname);
      const state = { ...initialState, gameConfig: GameConfig.initialize({ syncStart: true }) };

      expect(getOtherTableStatus(state, vi.fn()).showCallReferee).toBe(false);
    }
  );
});
