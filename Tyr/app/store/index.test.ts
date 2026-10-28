import { Store } from './index';
import { I18nService } from '../services/i18n';
import { Storage } from '../../../Common/storage';
import { StorageStrategyServer } from '../../../Common/storageStrategyServer';
import { SETTINGS_SAVE_THEME } from './actions/interfaces';

// This store test exercises Redux identity without making RPC calls.
vi.mock('../services/riichiApiTwirp', () => ({ RiichiApiTwirpService: vi.fn() }));

it('exposes one dispatch reference across reads and store updates', () => {
  vi.useFakeTimers();
  try {
    const storage = new Storage();
    storage.setStrategy(new StorageStrategyServer());
    const store = new Store(new I18nService(storage), storage);
    const dispatch = store.dispatch;
    expect(store.dispatch).toBe(dispatch);
    const update = vi.fn();
    store.subscribe(update);
    dispatch({ type: SETTINGS_SAVE_THEME, payload: 'night' });
    expect(update).toHaveBeenCalled();
    expect(store.redux.getState().settings.currentTheme).toBe('night');
    expect(store.dispatch).toBe(dispatch);
  } finally {
    vi.clearAllTimers();
    vi.useRealTimers();
  }
});
