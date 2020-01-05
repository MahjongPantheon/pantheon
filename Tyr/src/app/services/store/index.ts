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

@Injectable()
export class Store {
  private onUpdate: (state) => void;
  private store: ReduxStore;

  constructor(client: HttpClient) {
    this.store = createStore(combineReducers({
      screenManageReducer,
      outcomeReducer,
      mimirReducer
    }), applyMiddleware(
      mimirClient(new RiichiApiService(client)),
      metrika(new MetrikaService(client)),
      history()
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
