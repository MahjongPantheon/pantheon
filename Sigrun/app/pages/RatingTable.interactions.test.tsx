import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { EventType } from 'tsclients/proto/atoms.pb';
import { RatingTable } from './RatingTable';
import { globals, globalsCtx } from '../hooks/globals';
import { auth, authCtx } from '../hooks/auth';
import type { RatingOrderBy } from '../helpers/ratingPlaces';

const f = vi.hoisted(() => ({
  players: [
    {
      id: 1,
      title: 'Alice',
      rating: 105000,
      gamesPlayed: 4,
      avgScore: 26250,
      avgPlace: 1.25,
      chips: 3,
      winnerZone: true,
      teamName: 'Team A',
      tenhouId: 'alice',
      penaltiesCount: 1,
      penaltiesAmount: 500,
    },
    {
      id: 2,
      title: 'Bob',
      rating: 95000,
      gamesPlayed: 4,
      avgScore: 23750,
      avgPlace: 2.75,
      chips: -3,
      winnerZone: false,
      teamName: '',
      tenhouId: 'bob',
      penaltiesCount: 0,
      penaltiesAmount: 0,
    },
  ],
  events: [{ id: 42, title: 'Club', isTeam: true, withChips: true, type: 'EVENT_TYPE_ONLINE' }] as
    | { id: number; title: string; isTeam: boolean; withChips: boolean; type: string }[]
    | null,
  missingPlayers: false,
  loading: false,
  dimmed: false,
  wide: true,
  navigate: vi.fn(),
  api: { setEventId: vi.fn(), getRatingTable: vi.fn().mockResolvedValue([]) },
}));
vi.mock('wouter', () => ({ useLocation: () => ['/', f.navigate] }));
vi.mock('../hooks/api', () => ({ useApi: () => f.api }));
vi.mock('../hooks/useEvent', () => ({ useEvent: () => f.events }));
vi.mock('../hooks/useIsomorphicState', () => ({
  useIsomorphicState: (_initial: unknown, _key: string, load: () => unknown) => {
    load();
    return [f.missingPlayers ? null : f.players, null, f.loading];
  },
}));
vi.mock('../hooks/i18n', () => ({ useI18n: () => ({ _t: (s: string) => s }) }));
vi.mock('../hooks/storage', () => ({ useStorage: () => ({ getDimmed: () => f.dimmed }) }));
vi.mock('../components/Meta', () => ({ Meta: () => <span data-testid='meta' /> }));
vi.mock('../components/PlayerAvatar', () => ({ PlayerAvatar: () => null }));
vi.mock('../components/EventTypeIcon', () => ({ EventTypeIcon: () => null }));
vi.mock('../components/TeamTable', () => ({ TeamTable: () => <div data-testid='team-table' /> }));

beforeEach(() => {
  vi.clearAllMocks();
  f.events = [
    { id: 42, title: 'Club', isTeam: true, withChips: true, type: EventType.EVENT_TYPE_ONLINE },
  ];
  f.missingPlayers = false;
  f.loading = false;
  f.dimmed = false;
  f.wide = true;
  vi.stubGlobal('matchMedia', () => ({
    matches: f.wide,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function view(
  params: Parameters<typeof RatingTable>[0]['params'] = { eventId: '42' },
  extra: Partial<typeof globals.data> = {},
  owner = false,
  admin = false,
  dark = false
) {
  return render(
    <MantineProvider forceColorScheme={dark ? 'dark' : 'light'}>
      <authCtx.Provider value={{ ...auth, ownEvents: owner ? [42] : [], isSuperadmin: admin }}>
        <globalsCtx.Provider
          value={{
            ...globals,
            data: { ...globals.data, isTeam: true, minGamesCount: 4, ...extra },
          }}
        >
          <RatingTable params={params} />
        </globalsCtx.Provider>
      </authCtx.Provider>
    </MantineProvider>
  );
}

it.each([
  'rating',
  'games_and_rating',
  'avg_score',
  'avg_place',
  'chips',
  'name',
  'team',
] as RatingOrderBy[])(
  'requests %s ordering and preserves date filters in navigation',
  (orderBy) => {
    view({
      eventId: '42',
      orderBy,
      minGamesSelector: 'min',
      dateFrom: '2026-10-01%2000%3A00',
      dateTo: '2026-10-28',
    });
    expect(f.api.setEventId).toHaveBeenCalledWith(42);
    expect(f.api.getRatingTable).toHaveBeenCalledWith(
      [42],
      ['avg_place', 'name'].includes(orderBy) ? 'asc' : 'desc',
      orderBy === 'team' ? 'rating' : orderBy,
      true,
      '2026-10-01 00:00',
      '2026-10-28'
    );
    for (const [id, order] of [
      ['rating', 'rating'],
      ['games-and-rating', 'games_and_rating'],
      ['average-score', 'avg_score'],
      ['average-place', 'avg_place'],
      ['chips', 'chips'],
      ['team', 'team'],
    ]) {
      fireEvent.click(screen.getByTestId(`sigrun-rating-sort-${id}`));
      expect(f.navigate).toHaveBeenLastCalledWith(
        `/event/42/order/${order}${order === 'team' ? '' : '/filter/min'}/from/2026-10-01%2000%3A00/to/2026-10-28`
      );
    }
    if (orderBy === 'team') expect(screen.getByTestId('team-table')).toBeTruthy();
    else {
      fireEvent.click(screen.getByTestId('sigrun-rating-filter-all-players'));
      expect(f.navigate).toHaveBeenLastCalledWith(
        `/event/42/order/${orderBy}/from/2026-10-01%2000%3A00/to/2026-10-28`
      );
      fireEvent.click(screen.getByTestId('sigrun-rating-filter-min-games'));
      expect(f.navigate).toHaveBeenLastCalledWith(
        `/event/42/order/${orderBy}/filter/min/from/2026-10-01%2000%3A00/to/2026-10-28`
      );
      fireEvent.click(screen.getByTestId('sigrun-rating-player-link-1'));
      expect(f.navigate).toHaveBeenLastCalledWith(
        '/event/42/player/1/from/2026-10-01%2000%3A00/to/2026-10-28'
      );
      expect(screen.getByText('Team A')).toBeTruthy();
      expect(screen.getByText('alice')).toBeTruthy();
    }
  }
);

it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])('renders dimmed=%s dark=%s responsive rows', (dimmed, dark) => {
  f.dimmed = dimmed;
  f.wide = false;
  f.loading = true;
  view({ eventId: '42' }, {}, false, false, dark);
  expect(screen.getAllByTestId(/sigrun-rating-player-row-/)).toHaveLength(2);
  fireEvent.click(screen.getByTestId('sigrun-rating-player-link-1'));
  expect(f.navigate).toHaveBeenCalledWith('/event/42/player/1');
});

it('requests aggregate event ratings without setting a single current event', () => {
  f.events!.push({
    id: 43,
    title: 'Another club',
    isTeam: false,
    withChips: false,
    type: EventType.EVENT_TYPE_LOCAL,
  });
  view({ eventId: '42.43' });
  expect(f.api.setEventId).not.toHaveBeenCalled();
  expect(f.api.getRatingTable).toHaveBeenCalledWith(
    [42, 43],
    'desc',
    'rating',
    false,
    undefined,
    undefined
  );
});

it.each([
  [false, false, false],
  [true, false, true],
  [false, true, true],
])('enforces hidden ratings for owner=%s admin=%s', (owner, admin, visible) => {
  view({ eventId: '42' }, { ratingHidden: true }, owner, admin);
  expect(!!screen.queryByTestId('sigrun-rating-player-row-1')).toBe(visible);
  if (!visible)
    expect(screen.getByText('Rating table is hidden by tournament administrator')).toBeTruthy();
});

it.each(['players', 'events', 'globals'])('waits for missing %s data', (missing) => {
  if (missing === 'players') f.missingPlayers = true;
  if (missing === 'events') f.events = null;
  view({ eventId: '42' }, { loading: missing === 'globals' });
  expect(screen.queryByTestId('sigrun-rating-player-row-1')).toBeNull();
  expect(screen.getByTestId('meta')).toBeTruthy();
});
