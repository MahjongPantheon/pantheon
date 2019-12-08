import { Injectable } from '@angular/core';
import { createStore, combineReducers, Store as ReduxStore, Action } from 'redux';
import { AppActionTypes } from "./actions/interfaces";
import { screenManageReducer } from "./reducers/screenManageReducer";

@Injectable()
export class Store {
  private onUpdate: (state) => void;
  private store: ReduxStore;

  constructor() {
    this.store = createStore(combineReducers({
      screenManageReducer
    }));
  }

  public subscribe(onUpdate: (state) => void) {
    this.onUpdate = onUpdate;
    this.store.subscribe(() => this.onUpdate(this.store.getState()));
  }

  public dispatch(action: AppActionTypes) {
    this.store.dispatch(action);
  }
}
