import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '#/components/App';
import { Store } from '#/store';
import { I18nService } from '#/services/i18n';
import { IAppState } from '#/store/interfaces';
import { observe } from '#/scripts/dimensionsObserver';
import { registerFrontErrorHandler } from '#/scripts/logFrontError';
import { environment } from '#config';
import { Storage } from '../../Common/storage';

const storage = new Storage(environment.cookieDomain);

// Storage cleanup: use if some trouble happened during logging in
if (window.location.search.startsWith('?clear')) {
  storage.clear();
  window.location.replace(window.location.protocol + '//' + window.location.host);
}

observe();
registerFrontErrorHandler();

if (storage.getTwirpEnabled()) {
  document.body.className = 'betaLabel';
}

const i18nService = new I18nService(storage);
const store = new Store(i18nService, storage);
const root = createRoot(document.getElementById('tyr-root')!);

const doRender = (state: IAppState) => {
  (window as any).__debugInfo = { sh: state.currentSessionHash, p: state.currentPlayerId };
  root.render(
    <App state={state} dispatch={store.dispatch} storage={storage} i18nService={i18nService} />
  );
};

store.subscribe(doRender);
doRender(store.redux.getState());
