import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Achievements } from './Achievements';

vi.mock('../hooks/api', () => ({ useApi: () => ({}) }));
vi.mock('../hooks/useEvent', () => ({ useEvent: () => [{ id: 42, title: 'Example event' }] }));
vi.mock('../hooks/i18n', () => ({
  useI18n: () => ({
    _t: (message: string) => message,
    _pt: (_context: string, message: string) => message,
  }),
}));
vi.mock('../hooks/useIsomorphicState', () => ({
  useIsomorphicState: () => [
    {
      players: [{ id: 1, title: 'Winner' }],
      achievements: [
        { achievementId: 'bestHand', achievementData: JSON.stringify({ playerIds: [1], han: 13 }) },
      ],
      lastUpdate: '2026-10-27 12:00:00',
    },
  ],
}));
vi.mock('../components/Meta', () => ({ Meta: () => null }));
vi.mock('../components/EventTypeIcon', () => ({ EventTypeIcon: () => null }));

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('expands achievement lists without placing block content inside a paragraph', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <MantineProvider>
      <Achievements params={{ eventId: '42' }} />
    </MantineProvider>
  );
  fireEvent.click(screen.getByTestId('sigrun-achievement-toggle-bestHand'));
  const winner = await screen.findByText('Winner');
  expect(winner.closest('ul')).not.toBeNull();
  expect(winner.closest('p')).toBeNull();
  expect(errors).not.toHaveBeenCalled();
});
