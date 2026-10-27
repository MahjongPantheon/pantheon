import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Router } from 'wouter';
import { MainMenuLink, ExternalTarget } from './MainMenuLink';
import { RecentPublicGames } from './RecentPublicGames';

vi.mock('../hooks/api', () => ({ useApi: () => ({}) }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => ({ _t: (message: string) => message }) }));
vi.mock('../hooks/useIsomorphicState', () => ({
  useIsomorphicState: () => [
    {
      games: [
        {
          eventId: 42,
          eventTitle: 'Example event',
          sessionHash: 'example-session',
          date: '2026-10-27 12:00:00',
          startPoints: 25000,
          players: [{ playerId: 1, title: 'Player', score: -1089100 }],
        },
      ],
    },
  ],
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Sigrun navigation', () => {
  it('renders one accessible anchor per menu entry and closes the menu on SPA navigation', () => {
    const navigate = vi.fn();
    const closeMenu = vi.fn();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <MantineProvider>
        <Router hook={() => ['/', navigate]}>
          <MainMenuLink
            href='/event/42/info'
            icon={null}
            text='Event'
            testId='menu-event'
            onClick={closeMenu}
          />
          <MainMenuLink
            href='https://example.com'
            icon={null}
            text='Assistant'
            testId='menu-external'
            external={ExternalTarget.TYR}
          />
        </Router>
      </MantineProvider>
    );
    expect(container.querySelector('a a')).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Assistant' }).getAttribute('target')).toBe('_blank');
    expect(fireEvent.click(screen.getByRole('link', { name: 'Event' }))).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/event/42/info');
    expect(closeMenu).toHaveBeenCalledOnce();
    expect(errors).not.toHaveBeenCalled();
  });

  it('routes recent event titles without allowing a document navigation', () => {
    const navigate = vi.fn();
    render(
      <MantineProvider>
        <Router hook={() => ['/', navigate]}>
          <RecentPublicGames />
        </Router>
      </MantineProvider>
    );
    const link = screen.getByRole('link', { name: 'Example event' });
    expect(link.getAttribute('href')).toBe('/event/42/info');
    expect(fireEvent.click(link)).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/event/42/info', expect.anything());
    expect(screen.getByTestId('sigrun-recent-game-score').textContent).toBe('-1089100');
  });
});
