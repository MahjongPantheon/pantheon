import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Router } from 'wouter';
import {
  ChomboResult,
  DrawResult,
  EventType,
  FinalResultOfSession,
  GameResult,
  MultironResult,
  MultironWin,
  NagashiResult,
  PersonEx,
  PlatformType,
  RonResult,
  Round,
  TsumoResult,
} from 'tsclients/proto/atoms.pb';
import { getOnlineIdGetter } from '../helpers/onlineId';
import { GameListing } from './GameListing';

vi.mock('../hooks/i18n', () => ({
  useI18n: () => ({
    _t: (message: string) => message,
    _pt: (_ctx: string, message: string) => message,
  }),
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

const renderGame = (replayLink: string) =>
  render(
    <MantineProvider env='test'>
      <Router hook={() => ['/', vi.fn()]}>
        <GameListing
          eventId='42'
          onlineId={null}
          isDimmed={false}
          withYakitori={false}
          game={GameResult.initialize({ sessionHash: 'session', replayLink })}
          players={{}}
          rowStyle={{}}
          showShareLink={false}
        />
      </Router>
    </MantineProvider>
  );

it('hides the replay link when the replay has no link', () => {
  renderGame('');
  expect(screen.queryByTestId('sigrun-game-replay-link-session')).toBeNull();
});

it('shows the replay link when the replay has a link', () => {
  renderGame('https://tenhou.net/0/?log=x');
  expect(screen.getByTestId('sigrun-game-replay-link-session').getAttribute('href')).toBe(
    'https://tenhou.net/0/?log=x'
  );
});

it('shows each player Ronin ID, the outcome counts and the share link for a Ronin game', () => {
  const ids = [1, 2, 3, 4];
  const players = Object.fromEntries(
    ids.map((id) => [
      id,
      PersonEx.initialize({ id, title: `Player ${id}`, roninId: `ronin_${id}` }),
    ])
  );
  const rounds = [
    Round.initialize({ ron: RonResult.initialize({ roundIndex: 1, winnerId: 1, loserId: 2 }) }),
    Round.initialize({
      multiron: MultironResult.initialize({
        roundIndex: 2,
        loserId: 3,
        multiRon: 2,
        wins: [MultironWin.initialize({ winnerId: 1 }), MultironWin.initialize({ winnerId: 2 })],
      }),
    }),
    Round.initialize({ tsumo: TsumoResult.initialize({ roundIndex: 3, winnerId: 3 }) }),
    Round.initialize({ draw: DrawResult.initialize({ roundIndex: 4, tempai: [1] }) }),
    Round.initialize({ chombo: ChomboResult.initialize({ roundIndex: 5, loserIds: [4] }) }),
    Round.initialize({ nagashi: NagashiResult.initialize({ roundIndex: 6, nagashi: [3] }) }),
  ];
  render(
    <MantineProvider env='test'>
      <Router hook={() => ['/', vi.fn()]}>
        <GameListing
          eventId='42'
          onlineId={getOnlineIdGetter({
            type: EventType.EVENT_TYPE_ONLINE,
            platformId: PlatformType.PLATFORM_TYPE_RONIN,
          })}
          isDimmed
          withYakitori
          game={GameResult.initialize({
            sessionHash: 'session',
            date: '2026-11-17 10:00:00',
            rounds,
            finalResults: ids.map((playerId, idx) =>
              FinalResultOfSession.initialize({ playerId, score: 25000, ratingDelta: idx - 1 })
            ),
          })}
          players={players}
          rowStyle={{}}
          showShareLink
        />
      </Router>
    </MantineProvider>
  );

  for (const id of ids) expect(screen.getByText(`ronin_${id}`)).toBeTruthy();
  expect(screen.getByText('Chombo: %1')).toBeTruthy();
  expect(screen.getByText('Nagashi: %1')).toBeTruthy();
  expect(screen.getByTestId('sigrun-game-details-link-session').getAttribute('href')).toBe(
    '/event/42/game/session'
  );
});
