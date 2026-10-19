// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { Storage } from '../../../Common/storage';
import { I18nService } from './i18n';

describe.each([
  ['cn', '活动列表'],
  ['jp', 'イベント一覧'],
])('saved %s language', (language, eventList) => {
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
    expect(i18n._t('Event list')).toBe(eventList);
    for (const count of [1, 3]) {
      expect(i18n._npt('Achievements badge', ['%1 win', '%1 wins'], count, [count])).toBe(
        language === 'cn' ? `${count} 次和牌` : `和了 ${count} 回`
      );
    }
  });
});
