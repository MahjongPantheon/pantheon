import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { afterEach, expect, it, vi } from 'vitest';
import { EventType, type Event, type PlayerInRating } from 'tsclients/proto/atoms.pb';
import { TeamTable } from './TeamTable';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('wouter', () => ({ useLocation: () => ['/', navigate] }));
vi.mock('./PlayerAvatar', () => ({ PlayerAvatar: () => null }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('hydrates team names and ratings without browser repairs to nested paragraphs', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const tree = (
    <MantineProvider>
      <TeamTable
        events={[{ id: 42 } as Event]}
        players={[{ id: 1, title: 'Alice', teamName: 'Team A', rating: 15 } as PlayerInRating]}
      />
    </MantineProvider>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(tree);
  document.body.append(container);
  const row = container.querySelector('[data-testid="sigrun-rating-team-row-0"]');
  const errors = vi.fn();
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, tree, { onRecoverableError: errors });
    });
    expect(container.querySelector('[data-testid="sigrun-rating-team-row-0"]')).toBe(row);
    expect(row?.textContent).toContain('Team A15Alice15');
    expect(errors).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    container.remove();
  }
});

it.each([false, true])(
  'ranks teams and preserves player links with a wide dark layout=%s',
  (wide) => {
    vi.stubGlobal('matchMedia', () => ({
      matches: wide,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const events = [42, 43].map((id) => ({ id, type: EventType.EVENT_TYPE_ONLINE }) as Event);
    const players = [
      {
        id: 1,
        title: 'Alice',
        teamName: 'Team A',
        rating: 15,
        winnerZone: true,
        tenhouId: 'alice-id',
      },
      { id: 2, title: 'Bob', teamName: 'Team A', rating: -5, winnerZone: false },
      { id: 3, title: 'Carol', teamName: 'Team B', rating: 20, winnerZone: true },
      { id: 4, title: 'Dan', teamName: 'Team C', rating: 0, winnerZone: false },
      { id: 5, title: 'No team', rating: 1000 },
    ] as PlayerInRating[];
    render(
      <MantineProvider forceColorScheme={wide ? 'dark' : 'light'}>
        <TeamTable events={events} players={players} />
      </MantineProvider>
    );
    const rows = screen.getAllByTestId(/sigrun-rating-team-row-/);
    expect(rows).toHaveLength(3);
    expect(rows[0].textContent).toContain('Team B20');
    expect(rows[1].textContent).toContain('Team A10');
    expect(rows[2].textContent).toContain('Team C0');
    expect(screen.queryByText('No team')).toBeNull();
    expect(screen.getByText('alice-id')).toBeTruthy();
    const link = screen.getByTestId('sigrun-rating-team-player-link-1');
    expect(link.getAttribute('href')).toBe('/event/42.43/player/1');
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith('/event/42.43/player/1');
  }
);
