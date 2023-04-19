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
