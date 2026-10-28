import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Isomorphic } from '../hooks/isomorphic';
import { EventList } from './EventList';
import { RecentGames } from './RecentGames';

const f = vi.hoisted(() => ({
  navigate: vi.fn(),
  events: [{ id: 42, title: 'Club' }] as { id: number; title: string }[] | null,
  api: { getEvents: vi.fn(), getRecentGames: vi.fn() },
}));
vi.mock('wouter', () => ({ useLocation: () => ['/', f.navigate] }));
vi.mock('../hooks/api', () => ({ useApi: () => f.api }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => ({ _t: (s: string) => s }) }));
vi.mock('../hooks/useEvent', () => ({
  useEvent: () => f.events,
}));
vi.mock('../hooks/storage', () => ({ useStorage: () => ({ getDimmed: () => false }) }));
vi.mock('../components/Meta', () => ({ Meta: () => null }));
vi.mock('../components/RecentPublicGames', () => ({ RecentPublicGames: () => null }));
vi.mock('../components/EventTypeIcon', () => ({ EventTypeIcon: () => null }));
vi.mock('../components/GameListing', () => ({
  GameListing: ({ game }: { game: { sessionHash: string } }) => <div>{game.sessionHash}</div>,
}));
vi.mock('react-remark', () => ({ useRemarkSync: (text: string) => <span>{text}</span> }));

beforeEach(() => {
  vi.clearAllMocks();
  f.events = [{ id: 42, title: 'Club' }];
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('scrollTo', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(['events', 'games'] as const)(
  'keeps the %s content under a loading overlay while smoothly scrolling to the next page',
  async (kind) => {
    const isEvents = kind === 'events';
    const context = {
      [isEvents ? 'EventList_events_1_' : 'RecentGames_games_42_1']: isEvents
        ? { events: [{ id: 42, title: 'First event', description: 'Description' }], total: 40 }
        : { games: [{ sessionHash: 'First game', players: [] }], totalGames: 20 },
    };
    let resolve!: (data: unknown) => void;
    const pending = new Promise((done) => {
      resolve = done;
    });
    (isEvents ? f.api.getEvents : f.api.getRecentGames).mockReturnValue(pending);
    const view = (page: string) => (
      <Isomorphic.Provider value={context}>
        <MantineProvider>
          {isEvents ? (
            <EventList params={{ page }} />
          ) : (
            <RecentGames params={{ eventId: '42', page }} />
          )}
        </MantineProvider>
      </Isomorphic.Provider>
    );
    const { container, rerender } = render(view('1'));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(f.navigate).toHaveBeenCalledWith(isEvents ? '/page/2' : '/event/42/games/page/2');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    rerender(view('2'));
    expect(screen.getByText(isEvents ? 'First event' : 'First game')).toBeTruthy();
    expect(container.querySelector('[aria-busy="true"] .mantine-LoadingOverlay-root')).toBeTruthy();
    await act(async () => {
      resolve(
        isEvents
          ? { events: [{ id: 43, title: 'Next event', description: '' }], total: 40 }
          : { games: [{ sessionHash: 'Next game', players: [] }], totalGames: 20 }
      );
    });
    expect(screen.getByText(isEvents ? 'Next event' : 'Next game')).toBeTruthy();
    expect(screen.queryByText(isEvents ? 'First event' : 'First game')).toBeNull();
    expect(container.querySelector('[aria-busy="true"]')).toBeNull();
  }
);

it.each([false, true])('supports event filtering and navigation in dark mode=%s', (dark) => {
  const context = {
    EventList_events_1_Club: {
      events: [
        { id: 42, title: 'First club', description: '' },
        { id: 43, title: 'Second club', description: '' },
      ],
      total: 40,
    },
  };
  render(
    <Isomorphic.Provider value={context}>
      <MantineProvider forceColorScheme={dark ? 'dark' : 'light'}>
        <EventList params={{ filter: 'Club' }} />
      </MantineProvider>
    </Isomorphic.Provider>
  );
  fireEvent.click(screen.getByTestId('sigrun-event-info-link-42'));
  expect(f.navigate).toHaveBeenLastCalledWith('/event/42/info');
  fireEvent.click(screen.getByTestId('sigrun-event-rating-link-42'));
  expect(f.navigate).toHaveBeenLastCalledWith('/event/42/order/rating');
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  expect(f.navigate).toHaveBeenLastCalledWith('/filter/Club/page/2');
  const input = screen.getByTestId('sigrun-events-filter-input');
  fireEvent.change(input, { target: { value: 'Next club' } });
  fireEvent.keyDown(input, { key: 'a' });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(f.navigate).toHaveBeenLastCalledWith('/filter/Next club');
  fireEvent.click(screen.getByTestId('sigrun-events-filter-submit'));
  expect(f.navigate).toHaveBeenLastCalledWith('/filter/Next club');
  fireEvent.click(screen.getByTestId('sigrun-events-filter-clear'));
  expect(f.navigate).toHaveBeenLastCalledWith('/');
});

it.each([
  { events: null },
  {
    events: [
      { id: 42, title: 'Club' },
      { id: 43, title: 'Other club' },
    ],
  },
])('handles recent games when event details are $events', ({ events }) => {
  f.events = events;
  render(
    <Isomorphic.Provider
      value={{
        RecentGames_games_42_1: {
          games: [
            { sessionHash: 'First game', players: [{ id: 1 }] },
            { sessionHash: 'Second game', players: [] },
          ],
          totalGames: 20,
        },
      }}
    >
      <MantineProvider forceColorScheme='dark'>
        <RecentGames params={{ eventId: '42' }} />
      </MantineProvider>
    </Isomorphic.Provider>
  );
  expect(screen.queryByTestId('sigrun-recent-games-page') !== null).toBe(events !== null);
});
