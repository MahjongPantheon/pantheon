import { componentHarness } from '../../../tests/componentHarness';
import { EnterCredentialsScreen } from './EnterCredentialsScreen';
import { initialState } from '../../../store/state';
import { LOGIN_INIT } from '../../../store/actions/interfaces';

vi.mock('../../pages/Login/Login', () => ({
  Login: ({ onSubmit }: { onSubmit: (email: string, password: string) => void }) => (
    <button onClick={() => onSubmit('Player@Example.org', 'secret')}>Login</button>
  ),
}));
const view = componentHarness();
it('submits the current analytics session after a session change', () => {
  const dispatch = vi.fn();
  view.render(
    <EnterCredentialsScreen
      newyear={false}
      state={{ ...initialState, analyticsSession: 'before' }}
      dispatch={dispatch}
    />
  );
  view.render(
    <EnterCredentialsScreen
      newyear={false}
      state={{ ...initialState, analyticsSession: 'after' }}
      dispatch={dispatch}
    />
  );
  view.click('button');
  expect(dispatch).toHaveBeenCalledWith({
    type: LOGIN_INIT,
    payload: { email: 'player@example.org', password: 'secret', sessionId: 'after' },
  });
});
