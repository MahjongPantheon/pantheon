import { act } from 'react';
import { UnknownAction } from 'redux';
import { createRoot, Root } from 'react-dom/client';
import { GameConfig } from 'tsclients/proto/atoms.pb';
import { Home } from './Home';
import { initialState } from '../../../store/state';
import { IAppState } from '../../../store/interfaces';
import { AppActionTypes, SET_CREDENTIALS, SELECT_EVENT } from '../../../store/actions/interfaces';
import { commonReducer } from '../../../store/reducers/commonReducer';
import { adminAccess } from '../../../store/middlewares/adminAccess';

vi.mock('../../../helpers/env', () => ({
  env: { urls: { forseti: 'https://admin.example.test' } },
}));
vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});

describe('Home admin panel shortcut', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mountHome() {
    let state: IAppState = {
      ...initialState,
      currentPlayerId: 42,
      currentEventId: 17,
      gameConfig: GameConfig.initialize(),
    };
    let resolve!: (allowed: boolean) => void;
    let reject!: (error: Error) => void;
    const api = {
      canAccessAdminPanel: vi.fn(
        () =>
          new Promise<boolean>((res, rej) => {
            resolve = res;
            reject = rej;
          })
      ),
    };
    let handler = (action: AppActionTypes): AppActionTypes => action;
    const dispatch = <T extends AppActionTypes | UnknownAction>(action: T): T => {
      handler(action as AppActionTypes);
      return action;
    };
    const render = () => root.render(<Home newyear={false} state={state} dispatch={dispatch} />);
    handler = adminAccess(api)({ getState: () => state, dispatch })(
      <T extends AppActionTypes>(action: T): T => {
        state = commonReducer(state, action);
        if (action.type === SELECT_EVENT) state = { ...state, currentEventId: action.payload };
        render();
        return action;
      }
    );
    act(render);
    return {
      api,
      render,
      dispatch,
      resolve: (allowed: boolean) => resolve(allowed),
      reject: () => reject(new Error('Network failure')),
    };
  }

  it('loads access on main-screen entry and opens Forseti without visiting Settings', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const home = mountHome();
    expect(home.api.canAccessAdminPanel).toHaveBeenCalledWith(42, 17);
    expect(container.querySelector('[data-testid="tyr-home-admin-panel"]')).toBeNull();
    await act(async () => home.resolve(true));
    const button = container.querySelector<HTMLButtonElement>(
      '[data-testid="tyr-home-admin-panel"]'
    );
    expect(button?.textContent).toBe('Go to admin panel');
    act(() => button?.click());
    expect(open).toHaveBeenCalledWith('https://admin.example.test/event/17/games');
    act(home.render);
    expect(home.api.canAccessAdminPanel).toHaveBeenCalledTimes(1);
  });

  it.each([false, 'failure'])(
    'hides the button for a %s permission result',
    async (result: boolean | string) => {
      const home = mountHome();
      await act(async () => {
        if (result === 'failure') home.reject();
        else home.resolve(false);
      });
      expect(container.querySelector('[data-testid="tyr-home-admin-panel"]')).toBeNull();
    }
  );

  it('rechecks permission and targets the newly selected event', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const home = mountHome();
    await act(async () => home.resolve(true));
    act(() => home.dispatch({ type: SELECT_EVENT, payload: 18 }));
    expect(home.api.canAccessAdminPanel).toHaveBeenLastCalledWith(42, 18);
    expect(container.querySelector('[data-testid="tyr-home-admin-panel"]')).toBeNull();
    await act(async () => home.resolve(true));
    act(() =>
      container.querySelector<HTMLButtonElement>('[data-testid="tyr-home-admin-panel"]')?.click()
    );
    expect(open).toHaveBeenCalledWith('https://admin.example.test/event/18/games');
  });

  it('rechecks access when the current account changes', async () => {
    const home = mountHome();
    await act(async () => home.resolve(true));
    act(() =>
      home.dispatch({
        type: SET_CREDENTIALS,
        payload: {
          personId: 7,
          authToken: 'other-account',
          sessionId: 'other-session',
        },
      })
    );
    expect(home.api.canAccessAdminPanel).toHaveBeenLastCalledWith(7, 17);
    expect(container.querySelector('[data-testid="tyr-home-admin-panel"]')).toBeNull();
    await act(async () => home.resolve(false));
    expect(home.api.canAccessAdminPanel).toHaveBeenCalledTimes(2);
  });
});
