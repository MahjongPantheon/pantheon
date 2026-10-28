import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PlayerStats } from './PlayerStats';
import { Isomorphic } from '../hooks/isomorphic';

const f = vi.hoisted(() => ({
  navigate: vi.fn(),
  api: { getPlayer: vi.fn(), getPlayerStat: vi.fn() },
}));
vi.mock('wouter', () => ({ useLocation: () => ['/', f.navigate] }));
vi.mock('../hooks/api', () => ({ useApi: () => f.api }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => ({ _t: (s: string) => s }) }));
vi.mock('../hooks/storage', () => ({ useStorage: () => ({ getDimmed: () => false }) }));
vi.mock('../hooks/useEvent', () => ({ useEvent: () => [{ id: 42, title: 'Club' }] }));
vi.mock('../components/Meta', () => ({ Meta: () => null }));
vi.mock('../components/PlayerAvatar', () => ({ PlayerAvatar: () => null }));
vi.mock('../components/EventTypeIcon', () => ({ EventTypeIcon: () => null }));
vi.mock('../components/PlayerStatsListing', () => ({
  PlayerStatsListing: () => <div>Player summary</div>,
}));
vi.mock('../components/HandsGraph', () => ({ default: () => <div>Hands graph</div> }));
vi.mock('../components/YakuGraph', () => ({ default: () => <div>Yaku graph</div> }));
vi.mock('../components/RatingGraph', () => ({
  default: (props: {
    playerStats: { scoreHistory: unknown[] };
    setLastSelectionX: (x: number) => void;
    setLastSelectionHash: (hash: string) => void;
    onSelectGame: (game: unknown) => void;
  }) => (
    <button
      onClick={() => {
        props.setLastSelectionX(1);
        props.setLastSelectionHash('first');
        props.onSelectGame(props.playerStats.scoreHistory[0]);
      }}
    >
      Rating graph
    </button>
  ),
}));

const game = (hash: string) => ({
  tables: [1, 2].map((playerId) => ({
    playerId,
    title: `Player ${playerId}`,
    sessionHash: hash,
    score: 25000,
    ratingDelta: playerId === 1 ? 10 : -10,
  })),
});
const stats = { scoreHistory: [game('first'), game('second')], lastUpdate: 'Today' };
const context = {
  PlayerStats_player_421: { id: 1, title: 'Alice' },
  PlayerStats_playerstats_42_1_fundefined_tundefined: stats,
};
function view(playerId: string, dates = false, dark = false) {
  return (
    <Isomorphic.Provider value={context}>
      <MantineProvider forceColorScheme={dark ? 'dark' : 'light'}>
        <PlayerStats
          params={{
            eventId: '42',
            playerId,
            ...(dates ? { dateFrom: '2026-01-01', dateTo: '2026-10-29' } : {}),
          }}
        />
      </MantineProvider>
    </Isomorphic.Provider>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('shows title and chart skeletons while switching players and replaces them as requests settle', async () => {
  let resolvePlayer!: (value: unknown) => void;
  let resolveStats!: (value: unknown) => void;
  f.api.getPlayer.mockReturnValue(
    new Promise((resolve) => {
      resolvePlayer = resolve;
    })
  );
  f.api.getPlayerStat.mockReturnValue(
    new Promise((resolve) => {
      resolveStats = resolve;
    })
  );
  const { rerender } = render(view('1'));
  await screen.findByRole('button', { name: 'Rating graph' });
  fireEvent.click(screen.getByRole('button', { name: 'Rating graph' }));
  expect(screen.getByTestId('sigrun-player-stats-selected-game-link')).toBeTruthy();
  const openedGame = screen.getByTestId('sigrun-player-stats-selected-game-link');
  rerender(view('2'));
  expect(screen.queryByText('Alice')).toBeNull();
  expect(screen.getByTestId('sigrun-player-stats-selected-game-link')).toBe(openedGame);
  expect(screen.getByTestId('sigrun-player-stats-next-game').hasAttribute('disabled')).toBe(true);
  expect(screen.getByTestId('sigrun-player-stats-previous-game').hasAttribute('disabled')).toBe(
    true
  );
  for (const part of ['title', 'rating', 'summary', 'hands', 'yaku']) {
    expect(screen.getByTestId(`sigrun-player-stats-${part}-skeleton`)).toBeTruthy();
  }
  expect(screen.getByTestId('sigrun-player-stats-page').getAttribute('aria-busy')).toBe('true');
  await act(async () => resolvePlayer({ id: 2, title: 'Bob' }));
  expect(screen.getByText('Bob')).toBeTruthy();
  expect(screen.queryByTestId('sigrun-player-stats-title-skeleton')).toBeNull();
  expect(screen.getByTestId('sigrun-player-stats-rating-skeleton')).toBeTruthy();
  await act(async () => resolveStats(stats));
  expect(screen.getByTestId('sigrun-player-stats-selected-game-link')).toBe(openedGame);
  expect(openedGame.getAttribute('href')).toBe('/event/42/game/first');
  expect(screen.getByTestId('sigrun-player-stats-next-game').hasAttribute('disabled')).toBe(false);
  expect(screen.getByText('Hands graph')).toBeTruthy();
  expect(screen.getByText('Yaku graph')).toBeTruthy();
  expect(screen.queryByTestId('sigrun-player-stats-rating-skeleton')).toBeNull();
  expect(screen.getByTestId('sigrun-player-stats-page').getAttribute('aria-busy')).toBe('false');
});

it.each([false, true])('retains game preview navigation and date filters=%s', async (dates) => {
  f.api.getPlayerStat.mockResolvedValue(stats);
  render(view('1', dates, dates));
  await screen.findByRole('button', { name: 'Rating graph' });
  fireEvent.click(screen.getByRole('button', { name: 'Rating graph' }));
  fireEvent.click(screen.getByTestId('sigrun-player-stats-next-game'));
  expect(screen.getByTestId('sigrun-player-stats-selected-game-link').getAttribute('href')).toBe(
    '/event/42/game/second'
  );
  fireEvent.click(screen.getByTestId('sigrun-player-stats-previous-game'));
  fireEvent.click(screen.getByTestId('sigrun-player-stats-selected-game-link'));
  expect(f.navigate).toHaveBeenLastCalledWith('/event/42/game/first');
  fireEvent.click(screen.getByTestId('sigrun-player-stats-preview-player-link-2'));
  expect(f.navigate).toHaveBeenLastCalledWith(
    '/event/42/player/2' + (dates ? '/from/2026-01-01/to/2026-10-29' : '')
  );
  fireEvent.click(screen.getByTestId('sigrun-player-stats-close-game-preview'));
  expect(screen.queryByTestId('sigrun-player-stats-selected-game-link')).toBeNull();
});
