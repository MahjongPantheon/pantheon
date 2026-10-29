import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Storage } from '../../../Common/storage';
import { i18nCtx } from '../hooks/i18n';
import { I18nService } from '../services/i18n';
import { YakuId } from '../helpers/yaku';
import { YakuGraph } from './YakuGraph';

// Keep the chart's input observable without relying on a canvas in jsdom.
vi.mock('./BarGraph', () => ({
  default: ({
    data,
    options,
  }: {
    data: { datasets: { data: { x: number; y: string }[] }[] };
    options: { scales: { x: { title: { text: string } } } };
  }) => (
    <ul aria-label={options.scales.x.title.text}>
      {data.datasets[0].data.map(({ x, y }) => (
        <li key={y} data-count={x}>
          {y}
        </li>
      ))}
    </ul>
  ),
}));

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('yaku graph language changes', () => {
  it.each(['light', 'dark'] as const)(
    'updates translated labels and statistics in %s mode',
    async (colorScheme) => {
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
      const i18n = new I18nService(storage);
      const setLanguage = (language: string) => {
        storage.setLang(language);
        return new Promise<string>((resolve, reject) => {
          i18n.init(resolve, reject);
        });
      };
      const yakuStat = [
        { yakuId: YakuId.YAKUHAI2, count: 3 },
        { yakuId: YakuId.RIICHI, count: 8 },
        { yakuId: YakuId.YAKUHAI1, count: 4 },
        { yakuId: YakuId.YAKUHAI3, count: 2 },
        { yakuId: YakuId.YAKUHAI4, count: 1 },
        { yakuId: YakuId.PINFU, count: 0 },
        { yakuId: YakuId.EAST_SEAT_WIND, count: 1 },
        { yakuId: YakuId.EAST_ROUND_WIND, count: 1 },
        { yakuId: YakuId.RED_DRAGON, count: 1 },
      ];
      const graph = () => (
        <MantineProvider forceColorScheme={colorScheme}>
          <i18nCtx.Provider value={i18n}>
            <React.Suspense fallback={null}>
              <YakuGraph yakuStat={yakuStat} />
            </React.Suspense>
          </i18nCtx.Provider>
        </MantineProvider>
      );

      await setLanguage('en');
      const { rerender } = render(graph());
      const chart = await screen.findByRole('list', { name: 'Yaku collected over all time' });
      const englishLabels = [
        'Riichi (8)',
        'Yakuhai x1 (4)',
        'Yakuhai x2 (3)',
        'Yakuhai x3 (2)',
        'Yakuhai x4 (1)',
        'East seat wind (1)',
        'East round wind (1)',
        'Red dragon (1)',
        'Yakuhai: total (23)',
      ];
      const labels = () => screen.getAllByRole('listitem').map((item) => item.textContent);
      const assertStatistics = () => {
        expect(screen.getAllByRole('listitem').map((item) => item.dataset.count)).toEqual([
          '8',
          '4',
          '3',
          '2',
          '1',
          '1',
          '1',
          '1',
          '23',
        ]);
        expect(chart.parentElement?.style.height).toBe('256px');
      };
      expect(labels()).toEqual(englishLabels);
      assertStatistics();

      await setLanguage('ru');
      rerender(graph());
      expect(screen.getByRole('list', { name: 'Собранные яку за все время' })).toBe(chart);
      expect(labels()).toEqual([
        'Риичи (8)',
        'Якухай 1 (4)',
        'Якухай 2 (3)',
        'Якухай 3 (2)',
        'Якухай 4 (1)',
        'Ветер места: Восток (1)',
        'Ветер раунда: Восток (1)',
        'Красный дракон (1)',
        'Якухай: всего (23)',
      ]);
      assertStatistics();

      await setLanguage('en');
      rerender(graph());
      expect(screen.getByRole('list', { name: 'Yaku collected over all time' })).toBe(chart);
      expect(labels()).toEqual(englishLabels);
      assertStatistics();
    }
  );
});
