/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { createStore, applyMiddleware, Store as ReduxStore, compose, Reducer } from 'redux';
import { screenManageReducer } from './reducers/screenManageReducer';
import { apiClient } from './middlewares/apiClient';
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
    const riichiService = new RiichiApiTwirpService();
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
