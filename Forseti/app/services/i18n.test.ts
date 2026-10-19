// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { Storage } from '../../../Common/storage';
import { I18nService } from './i18n';

describe.each([
  ['cn', '目标点数'],
  ['jp', '目標点'],
])('saved %s language', (language, goalScore) => {
  it('loads the selected catalog and its single plural form', async () => {
    const values = new Map();
    const storage = new Storage();
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
    storage.setLang(language);
    const i18n = new I18nService(storage);

    const loadedLanguage = await new Promise<string>((resolve, reject) => {
      i18n.init(resolve, reject);
    });

    expect(loadedLanguage).toBe(language);
    expect(storage.getLang()).toBe(language);
    expect(i18n._t('Goal score')).toBe(goalScore);
    for (const count of [1, 3]) {
      expect(i18n._nt(['Found %1 error', 'Found %1 errors'], count, [count])).toBe(
        language === 'cn' ? `发现 ${count} 个错误` : `${count} 件のエラーが見つかりました`
      );
    }
  });
});
