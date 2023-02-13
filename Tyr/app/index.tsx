import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '#/components/App';
import { Store } from '#/store';
import { I18nService } from '#/services/i18n';
import { IDB } from '#/services/idb';
import { MetrikaService } from '#/services/metrika';
import { IAppState } from '#/store/interfaces';
import { observe } from '#/scripts/dimensionsObserver';
import { clearStorages } from '#/scripts/clearStorages';
import { registerFrontErrorHandler } from '#/scripts/logFrontError';
import { IDBStorageImpl } from '#/services/idb/localstorageImpl';

// Storage cleanup: use if some trouble happened during logging in
if (window.location.search.startsWith('?clear')) {
  clearStorages();
  window.location.replace(window.location.protocol + '//' + window.location.host);
}

// TODO: temporary measure until transition is finished
if (window.location.host.startsWith('m.riichi.top')) {
  const oldImpl = new IDBStorageImpl();
  window.location.replace('https://assist.riichimahjong.org/?migrate=' + oldImpl.export());
}

observe();
registerFrontErrorHandler();

const metrikaService = new MetrikaService();
const storage = new IDB(metrikaService);

// TODO: temporary measure until transition is finished
if (
  window.location.host.startsWith('assist.riichimahjong.org') &&
  window.location.search.startsWith('?migrate=')
) {
  storage.import(window.location.search.replace('?migrate=', ''));
}

const i18nService = new I18nService(storage);
const store = new Store(i18nService);
const root = createRoot(document.getElementById('tyr-root')!);

const doRender = (state: IAppState) => {
  (window as any).__debugInfo = { sh: state.currentSessionHash, p: state.currentPlayerId };
  root.render(
    <App state={state} dispatch={store.dispatch} storage={storage} i18nService={i18nService} />
  );
};

store.subscribe(doRender);
doRender(store.redux.getState());
