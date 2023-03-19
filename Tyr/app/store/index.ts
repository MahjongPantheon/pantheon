import { createStore, applyMiddleware, Store as ReduxStore, compose, Reducer } from 'redux';
import { screenManageReducer } from './reducers/screenManageReducer';
import { apiClient } from './middlewares/apiClient';
import { RiichiApiService } from '#/services/riichiApi';
import { mimirReducer } from './reducers/mimirReducer';
import { outcomeReducer } from './reducers/outcomeReducer';
import { analytics } from './middlewares/analytics';
import { history } from './middlewares/history';
import { Analytics } from '#/services/analytics';
import { timerReducer } from './reducers/timerReducer';
import { timerMw } from './middlewares/timer';
import { IAppState, TimerStorage } from './interfaces';
import { commonReducer } from './reducers/commonReducer';
import { persistentMw } from './middlewares/persistent';
import { initialState } from './state';
import { logging } from './middlewares/logging';
import { I18nService } from '#/services/i18n';
import { yaku } from './middlewares/yaku';
import { reduceReducers } from '#/store/util';
import { AppActionTypes } from '#/store/actions/interfaces';
import { screenManageMw } from '#/store/middlewares/screenManage';
import { IStorage } from '../../../Common/storage';
import { RiichiApiTwirpService } from '#/services/riichiApiTwirp';

export class Store {
  private onUpdate: ((state: IAppState) => void) | undefined;
  private readonly store: ReduxStore<IAppState>;
  private readonly timerSt: TimerStorage;

  constructor(i18n: I18nService, storage: IStorage) {
    this.timerSt = {
      timer: undefined,
      autostartTimer: undefined,
      setInterval: (callback: () => any, milliseconds: number) =>
        window.setInterval(callback, milliseconds),
      clearInterval: (handle: number) => window.clearInterval(handle),
    };
    const reducer = reduceReducers(initialState, [
      commonReducer,
      screenManageReducer,
      outcomeReducer,
      mimirReducer,
      timerReducer,
    ]);
    const analyticsService = new Analytics();
    const riichiService = storage.getTwirpEnabled()
      ? new RiichiApiTwirpService()
      : new RiichiApiService();
    const middleware = applyMiddleware(
      logging(`⇨ [middlewares]`),
      apiClient(riichiService),
      analytics(analyticsService),
      history(),
      timerMw(this.timerSt),
      persistentMw(storage),
      yaku(i18n),
      logging(`⇨ [reducers]`),
      screenManageMw()
    );
    const composeEnhancers =
      (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 })) ||
      compose;
    this.store = createStore(
      reducer as Reducer<IAppState, AppActionTypes>,
      composeEnhancers(middleware)
    );
  }

  public subscribe(onUpdate: (state: IAppState) => void) {
    this.onUpdate = onUpdate;
    this.store.subscribe(() => this.onUpdate && this.onUpdate(this.store.getState()));
  }

  get dispatch() {
    return this.store.dispatch.bind(this.store);
  }

  public get redux(): ReduxStore<IAppState> {
    return this.store;
  }
}
