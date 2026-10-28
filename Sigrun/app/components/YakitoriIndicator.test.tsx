import { cleanup, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { afterEach, expect, it, vi } from 'vitest';
import { YakitoriIndicator } from './YakitoriIndicator';

vi.mock('../hooks/i18n', () => ({
  useI18n: () => ({ _t: (text: string) => `Translated ${text}` }),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('gives the yakitori status image a translated accessible name', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(
    <MantineProvider>
      <YakitoriIndicator />
    </MantineProvider>
  );
  expect(screen.getByRole('img', { name: 'Translated Yakitori' })).toBeTruthy();
});
