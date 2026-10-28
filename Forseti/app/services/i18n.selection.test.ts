import { afterEach, expect, it, vi } from 'vitest';
import { Storage } from '../../../Common/storage';
import { StorageStrategyServer } from '../../../Common/storageStrategyServer';
import { I18nService, supportedLanguages } from './i18n';

function fixture(lang?: string) {
  const storage = new Storage();
  storage.setStrategy(new StorageStrategyServer());
  if (lang) storage.setLang(lang);
  return { storage, i18n: new I18nService(storage) };
}
async function initialize(i18n: I18nService) {
  return new Promise<string>((resolve, reject) => {
    i18n.init(resolve, reject);
  });
}
afterEach(() => vi.restoreAllMocks());

it.each(supportedLanguages)('restores supported language %s', async (lang) => {
  const { i18n, storage } = fixture(lang);
  expect(await initialize(i18n)).toBe(lang);
  expect(storage.getLang()).toBe(lang);
  expect(i18n._t('Language').length).toBeGreaterThan(0);
});

it('clears an obsolete saved language and uses the first supported browser language', async () => {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['xx', 'de', 'ru']);
  const { i18n, storage } = fixture('xx');
  expect(await initialize(i18n)).toBe('de');
  expect(storage.getLang()).toBeNull();
});

it('falls back to English when browser languages are unsupported', async () => {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['xx']);
  const { i18n } = fixture();
  expect(await initialize(i18n)).toBe('en');
  expect(i18n._t('Hello %1', ['world'])).toBe('Hello world');
  expect(i18n._pt('context', 'Hello %1', ['world'])).toBe('Hello world');
  expect(i18n._nt(['%1 item', '%1 items'], 1, [1])).toBe('1 item');
  expect(i18n._npt('context', ['%1 item', '%1 items'], 2, [2])).toBe('2 items');
  for (const getter of [i18n._gg, i18n._ngg, i18n._pgg, i18n._npgg])
    expect(typeof getter).toBe('function');
});
