import { TwirpError } from 'twirpscript';
import { TableState } from 'tsclients/proto/atoms.pb';
import { componentHarness } from '../../../tests/componentHarness';
import { initialState } from '../../../store/state';
import { mimirReducer } from '../../../store/reducers/mimirReducer';
import type { RemoteError } from '../../../services/remoteError';
import {
  GET_OTHER_TABLES_LIST_FAIL,
  GET_OTHER_TABLES_LIST_INIT,
  GET_OTHER_TABLES_LIST_SUCCESS,
  GET_OTHER_TABLE_INIT,
  GOTO_PREV_SCREEN,
} from '../../../store/actions/interfaces';
import { OtherTablesList } from './OtherTablesList';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});

const view = componentHarness();

it.each([
  [new TwirpError({ code: 'unavailable', msg: 'Service unavailable' }), 'Service unavailable'],
  [new Error('Connection failed'), 'Connection failed'],
  [new Error(''), 'Unexpected server error'],
])(
  'shows request failures with working recovery controls: %s',
  (error: unknown, message: string) => {
    const state = mimirReducer(initialState, {
      type: GET_OTHER_TABLES_LIST_FAIL,
      payload: error as RemoteError,
    });
    const dispatch = vi.fn();
    view.render(<OtherTablesList state={state} dispatch={dispatch} newyear={false} />);
    expect(view.container.querySelector('[role="alert"]')?.textContent).toContain(message);
    expect(view.container.querySelector('[data-testid="tyr-other-tables-empty"]')).toBeNull();
    view.click('[data-testid="tyr-other-tables-back"]');
    expect(dispatch).toHaveBeenLastCalledWith({ type: GOTO_PREV_SCREEN });
    view.click('[data-testid="tyr-other-tables-retry"]');
    expect(dispatch).toHaveBeenLastCalledWith({ type: GET_OTHER_TABLES_LIST_INIT });

    const loading = mimirReducer(state, { type: GET_OTHER_TABLES_LIST_INIT });
    view.render(<OtherTablesList state={loading} dispatch={dispatch} newyear={false} />);
    expect(view.container.querySelector('[role="alert"]')).toBeNull();
    expect(view.container.querySelector('[data-testid="tyr-other-tables-empty"]')).toBeNull();

    const table = TableState.initialize({
      sessionHash: 'other-session',
      currentRoundIndex: 1,
      players: [1, 2, 3, 4].map((id) => ({
        id,
        title: `Player ${id}`,
        ignoreSeating: false,
        hasAvatar: false,
        lastUpdate: '',
      })),
      scores: [1, 2, 3, 4].map((playerId) => ({ playerId, score: 30000, chomboCount: 0 })),
    });
    const loaded = mimirReducer(loading, {
      type: GET_OTHER_TABLES_LIST_SUCCESS,
      payload: [table],
    });
    view.render(<OtherTablesList state={loaded} dispatch={dispatch} newyear={false} />);
    expect(view.container.querySelector('[role="alert"]')).toBeNull();
    expect(view.container.textContent).toContain('Player 1: 30000');
    view.click('[data-testid="tyr-other-tables-table-other-session"]');
    expect(dispatch).toHaveBeenLastCalledWith({
      type: GET_OTHER_TABLE_INIT,
      payload: 'other-session',
    });
  }
);

it('shows the empty state after a successful request with no other tables', () => {
  view.render(<OtherTablesList state={initialState} dispatch={vi.fn()} newyear={false} />);
  expect(view.container.textContent).toContain('No tables are playing right now');
  expect(view.container.querySelector('[role="alert"]')).toBeNull();
});
