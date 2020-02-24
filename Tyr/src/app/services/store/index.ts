import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createStore, combineReducers, applyMiddleware, Store as ReduxStore, Action } from 'redux';
import { AppActionTypes } from "./actions/interfaces";
import { screenManageReducer } from "./reducers/screenManageReducer";
import { mimirClient } from './middlewares/mimirClient';
import { RiichiApiService } from "../riichiApi";
import { mimirReducer } from "./reducers/mimirReducer";
import { outcomeReducer } from "./reducers/outcomeReducer";
import {metrika} from "./middlewares/metrika";
import {history} from "./middlewares/history";
import {MetrikaService} from "../metrika";
import {timerReducer} from "./reducers/timer";
import {timerMw} from "./middlewares/timer";
import {TimerStorage} from "./interfaces";

@Injectable()
export class Store {
  private onUpdate: (state) => void;
  private store: ReduxStore;
  private readonly timerSt: TimerStorage;

  constructor(client: HttpClient) {
    this.timerSt = {
      timer: null,
      setInterval: window.setInterval,
      clearInterval: window.clearInterval
    };
    this.store = createStore(combineReducers({
      screenManageReducer,
      outcomeReducer,
      mimirReducer,
      timerReducer
    }), applyMiddleware(
      mimirClient(new RiichiApiService(client)),
      metrika(new MetrikaService(client)),
      history(),
      timerMw(this.timerSt)
    ));
  }

  public subscribe(onUpdate: (state) => void) {
    this.onUpdate = onUpdate;
    this.store.subscribe(() => this.onUpdate(this.store.getState()));
  }

  public dispatch(action: AppActionTypes) {
    this.store.dispatch(action);
  }
}
