import { expect, it } from 'vitest';
import {
  calcDimmedBackground,
  calcDimmedText,
  dimmedColors,
  getThemeOptions,
  themeOptions,
} from './theme';

it('uses the standard palette by default and swaps in the dimmed palette on request', () => {
  expect(getThemeOptions()).toBe(themeOptions);
  expect(getThemeOptions(true)).toEqual({ ...themeOptions, colors: dimmedColors });
  expect(calcDimmedBackground()).toBe('#e3fafc');
  expect(calcDimmedText()).toBe('#228be6');
});

it.each([
  [false, false, '#e3fafc', '#228be6'],
  [true, false, '#edf2f7', '#40678c'],
  [false, true, '#14283a', '#228be6'],
  [true, true, '#14283a', '#40678c'],
] as const)('uses dimmed=%s dark=%s colors consistently', (dimmed, dark, background, text) => {
  expect(calcDimmedBackground(dimmed, dark)).toBe(background);
  expect(calcDimmedText(dimmed, dark)).toBe(text);
  expect(calcDimmedBackground(dimmed, dark, '#123456')).toBe(
    !dimmed && !dark ? '#123456' : background
  );
  expect(calcDimmedText(dimmed, dark, '#654321')).toBe(!dimmed && !dark ? '#654321' : text);
});
