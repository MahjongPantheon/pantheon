import { adminAccess } from './adminAccess';
import { commonReducer } from '../reducers/commonReducer';
import { initialState } from '../state';
import {
  AppActionTypes,
  FORCE_LOGOUT,
  INIT_STATE,
  LOGIN_INIT,
  ADMIN_ACCESS_INIT,
  SET_CREDENTIALS,
  SELECT_EVENT,
  STARTUP_WITH_AUTH,
} from '../actions/interfaces';

function deferred() {
  let resolve!: (allowed: boolean) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<boolean>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(personId = 42) {
  let state = { ...initialState, currentPlayerId: personId, currentEventId: 17 };
  const requests: ReturnType<typeof deferred>[] = [];
  const api = {
    canAccessAdminPanel: vi.fn(() => {
      const request = deferred();
      requests.push(request);
      return request.promise;
    }),
  };
  let handler = (action: AppActionTypes): AppActionTypes => action;
  const dispatch = <T extends AppActionTypes>(action: T): T => handler(action) as T;
  handler = adminAccess(api)({ getState: () => state, dispatch })(
    <T extends AppActionTypes>(action: T): T => {
      state = commonReducer(state, action) as typeof state;
      if (action.type === SELECT_EVENT) state = { ...state, currentEventId: action.payload };
      return action;
    }
  );
  return { dispatch, api, requests, getState: () => state };
}

const flush = () => Promise.resolve();

describe('admin panel permission state', () => {
  it.each([true, false])(
    'shows the button only after an eligible result (%s)',
    async (allowed: boolean) => {
      const store = setup();
      store.dispatch({ type: ADMIN_ACCESS_INIT });
      expect(store.api.canAccessAdminPanel).toHaveBeenCalledWith(42, 17);
      expect(store.getState().canAccessAdminPanel).toBe(false);
      store.requests[0].resolve(allowed);
      await flush();
      expect(store.getState().canAccessAdminPanel).toBe(allowed);
    }
  );

  it('hides previously granted access while rechecking and after errors', async () => {
    const store = setup();
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    store.requests[0].resolve(true);
    await flush();
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    expect(store.getState().canAccessAdminPanel).toBe(false);
    store.requests[1].reject(new Error('Network failure'));
    await flush();
    expect(store.getState().canAccessAdminPanel).toBe(false);
  });

  it('does not load permissions without a current account', () => {
    const store = setup(0);
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    expect(store.api.canAccessAdminPanel).not.toHaveBeenCalled();
    expect(store.getState().canAccessAdminPanel).toBe(false);
  });

  it.each<AppActionTypes>([
    { type: FORCE_LOGOUT, payload: undefined },
    { type: INIT_STATE },
    { type: SELECT_EVENT, payload: 18 },
    { type: LOGIN_INIT, payload: { email: '', password: '', sessionId: '' } },
    { type: SET_CREDENTIALS, payload: { personId: 7, authToken: 'new', sessionId: '' } },
    { type: SET_CREDENTIALS, payload: { personId: 42, authToken: 'renewed', sessionId: '' } },
    { type: STARTUP_WITH_AUTH, payload: { personId: 7, token: 'new', sessionId: '' } },
  ])('invalidates access and pending results on $type', async (action: AppActionTypes) => {
    const store = setup();
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    store.requests[0].resolve(true);
    await flush();
    expect(store.getState().canAccessAdminPanel).toBe(true);
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    store.dispatch(action);
    store.requests[1].resolve(true);
    await flush();
    expect(store.getState().canAccessAdminPanel).toBe(false);
  });

  it('ignores older successful requests after the latest request denies access', async () => {
    const store = setup();
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    store.requests[1].resolve(false);
    await flush();
    store.requests[0].resolve(true);
    await flush();
    expect(store.getState().canAccessAdminPanel).toBe(false);
  });

  it('ignores pending access for the previous event after selecting another event', async () => {
    const store = setup();
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    store.dispatch({ type: SELECT_EVENT, payload: 18 });
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    expect(store.api.canAccessAdminPanel).toHaveBeenLastCalledWith(42, 18);
    store.requests[1].resolve(false);
    await flush();
    store.requests[0].resolve(true);
    await flush();
    expect(store.getState().canAccessAdminPanel).toBe(false);
  });

  it('ignores older failed requests after the latest request grants access', async () => {
    const store = setup();
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    store.dispatch({ type: ADMIN_ACCESS_INIT });
    store.requests[1].resolve(true);
    await flush();
    store.requests[0].reject(new Error('Old request failed'));
    await flush();
    expect(store.getState().canAccessAdminPanel).toBe(true);
  });
});
