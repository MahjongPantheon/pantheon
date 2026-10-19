// @vitest-environment node

import { beforeEach, describe, expect, it } from 'vitest';
import { Storage } from '../../../Common/storage';
import { I18nService } from './i18n';

describe('Belarusian locale', () => {
  let i18n: I18nService;
  let storage: Storage;

  beforeEach(async () => {
    const values = new Map();
    storage = new Storage();
    storage.setStrategy({
      get: (key) => values.get(key) ?? null,
      set: (key, _type, value) => {
        values.set(key, value);
      },
      delete: (key) => {
        values.delete(key);
      },
      clear: () => {
        values.clear();
      },
    });
    storage.setLang('be');
    i18n = new I18nService(storage);
    await new Promise<string>((resolve, reject) => {
      i18n.init(resolve, reject);
    });
  });

  it('restores the saved language and loads its translations', () => {
    expect(storage.getLang()).toBe('be');
    expect(i18n._t('Language')).toBe('Мова');
  });

  it.each([
    [0, 2],
    [1, 0],
    [2, 1],
    [5, 2],
    [11, 2],
    [21, 0],
    [22, 1],
    [25, 2],
    [101, 0],
    [102, 1],
    [111, 2],
  ])('selects the correct plural form for %i', (count, form) => {
    const forms = ['Знойдзена %1 памылка', 'Знойдзены %1 памылкі', 'Знойдзена %1 памылак'];
    expect(i18n._nt(['Found %1 error', 'Found %1 errors'], count, [count])).toBe(
      forms[form].replace('%1', String(count))
    );
  });
});
