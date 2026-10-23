import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { AchievementPlayer } from './AchievementPlayer';

const player = (sessionHashes?: string[]) => (
  <MantineProvider>
    <AchievementPlayer
      eventId='42'
      title='Player'
      sessionHashes={sessionHashes}
      gameLabel='View game'
    />
  </MantineProvider>
);

describe('achievement game references', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders old cached results and event aggregates without links', () => {
    render(player());
    expect(screen.getByText('Player')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders every distinct tied game as an internal link', () => {
    render(player(['first', 'second', 'first']));
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/event/42/game/first',
      '/event/42/game/second',
    ]);
    expect(links.map((link) => link.textContent)).toEqual(['Player (1)', 'Player (2)']);
    expect(links[1].getAttribute('title')).toBe('View game (2)');
  });

  it('renders game links on the server and treats hashes as opaque route segments', () => {
    const html = renderToString(player(['game/with?separators']));
    expect(html).toContain('href="/event/42/game/game%2Fwith%3Fseparators"');
    expect(html).toContain('Player</a>');
  });
});
