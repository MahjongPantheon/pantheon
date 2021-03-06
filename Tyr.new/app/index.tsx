import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '#/components/App';
import { Store } from "#/store";
import { I18nService } from "#/services/i18n";
import { IDB } from "#/services/idb";
import { MetrikaService } from "#/services/metrika";
import { IAppState } from "#/store/interfaces";
import { observe } from '#/scripts/dimensionsObserver'
import { registerFrontErrorHandler } from '#/scripts/logFrontError'

observe();
registerFrontErrorHandler();

const metrikaService = new MetrikaService();
const storage = new IDB(metrikaService);
const i18nService = new I18nService(storage);
const store = new Store(i18nService);

const doRender = (state: IAppState) => {
  (window as any).__debugInfo = { sh: state.currentSessionHash, p: state.currentPlayerId };
  ReactDOM.render(<App
    state={state}
    dispatch={store.dispatch}
    storage={storage}
    i18nService={i18nService}
  />, document.getElementById('tyr-root'));
};

store.subscribe(doRender);
doRender(store.redux.getState());
