import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from '#/components/App';
import { Store } from "#/store";
import { I18nService } from "#/services/i18n";
import { IDB } from "#/services/idb";
import { MetrikaService } from "#/services/metrika";

const metrikaService = new MetrikaService();
const storage = new IDB(metrikaService);
const i18nService = new I18nService(storage);
const store = new Store(i18nService);

ReactDOM.render(<App store={store} />, document.getElementById('tyr-root'));
