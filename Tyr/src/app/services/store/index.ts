import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createStore, combineReducers, applyMiddleware, Store as ReduxStore, compose } from 'redux';
import { screenManageReducer } from "./reducers/screenManageReducer";
import { mimirClient } from './middlewares/mimirClient';
import { RiichiApiService } from "../riichiApi";
import { mimirReducer } from "./reducers/mimirReducer";
import { outcomeReducer } from "./reducers/outcomeReducer";
import { metrika } from "./middlewares/metrika";
import { history } from "./middlewares/history";
import { MetrikaService } from "../metrika";
import { timerReducer } from "./reducers/timerReducer";
import { timerMw } from "./middlewares/timer";
import { IAppState, TimerStorage } from "./interfaces";
import { commonReducer } from "./reducers/commonReducer";
import { yaku } from "./middlewares/yaku";
import { AppActionTypes } from "./actions/interfaces";
import {persistentMw} from "./middlewares/persistent";
import {IDB} from "../idb";
import {isMetadataError} from "@angular/compiler-cli";

@Injectable()
export class Store {
  private onUpdate: (state) => void;
  private store: ReduxStore<IAppState>;
  private readonly timerSt: TimerStorage;

  constructor(client: HttpClient) {
    this.timerSt = {
      timer: null,
      setInterval: window.setInterval,
      clearInterval: window.clearInterval
    };
    const reducer = combineReducers({
      commonReducer,
      screenManageReducer,
      outcomeReducer,
      mimirReducer,
      timerReducer
    });
    const metrikaService = new MetrikaService(client);
    const idb = new IDB(metrikaService);
    const middleware = applyMiddleware(
      mimirClient(new RiichiApiService(client)),
      metrika(metrikaService),
      history(),
      timerMw(this.timerSt),
      persistentMw(idb),
      yaku
    );
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    this.store = createStore(reducer, composeEnhancers(middleware)) as unknown as ReduxStore<IAppState>; // TODO: proper types
  }

  public subscribe(onUpdate: (state) => void) {
    this.onUpdate = onUpdate;
    this.store.subscribe(() => this.onUpdate(this.store.getState()));
  }

  public dispatch(action: AppActionTypes) {
    this.store.dispatch(action);
  }

  public get redux(): ReduxStore<IAppState> {
    return this.store;
  }
}
