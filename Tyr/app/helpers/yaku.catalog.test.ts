import { yakuList, yakuMap, sortByViewPriority, YakuId } from './yaku';
import { I18nService } from '../services/i18n';
import { Storage } from '../../../Common/storage';
import { StorageStrategyServer } from '../../../Common/storageStrategyServer';

it('has unique IDs and translated full and short labels for every selectable yaku', async () => {
  const storage = new Storage();
  storage.setStrategy(new StorageStrategyServer());
  storage.setLang('en');
  const i18n = new I18nService(storage);
  await new Promise<string>((resolve, reject) => {
    i18n.init(resolve, reject);
  });
  expect(new Set(yakuList.map((y) => y.id)).size).toBe(yakuList.length);
  for (const yaku of yakuList) {
    expect(yakuMap[yaku.id]).toBe(yaku);
    expect(yaku.name(i18n).trim().length).toBeGreaterThan(0);
    expect(yaku.shortName(i18n).trim().length).toBeGreaterThan(0);
  }
  expect(yakuMap[YakuId.RIICHI].name(i18n)).toBe('Riichi');
});

it('sorts a selection by UI priority without inserting unselected yaku or mutating the input', () => {
  const selected = [yakuMap[YakuId.PINFU], yakuMap[YakuId.RIICHI], yakuMap[YakuId.TANYAO]];
  const before = [...selected];
  const sorted = sortByViewPriority(selected);
  expect(sorted.map((y) => y.id)).toEqual([YakuId.RIICHI, YakuId.TANYAO, YakuId.PINFU]);
  expect(selected).toEqual(before);
  expect(sortByViewPriority([])).toEqual([]);
});
