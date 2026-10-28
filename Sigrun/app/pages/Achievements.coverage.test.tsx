import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Achievements } from './Achievements';
import { auth, authCtx } from '../hooks/auth';
import { globals, globalsCtx } from '../hooks/globals';

const fixture = vi.hoisted(() => ({
  data: null as null | {
    players: { id: number; title: string }[];
    achievements: { achievementId: string; achievementData: string }[];
    lastUpdate: string;
  },
  events: [{ id: 42, title: 'Test event' }] as { id: number; title: string }[] | null,
}));
vi.mock('../hooks/api', () => ({ useApi: () => ({}) }));
vi.mock('../hooks/useEvent', () => ({ useEvent: () => fixture.events }));
vi.mock('../hooks/useIsomorphicState', () => ({ useIsomorphicState: () => [fixture.data] }));
vi.mock('../hooks/i18n', () => ({
  useI18n: () => ({
    _t: (s: string) => s,
    _pt: (_ctx: string, s: string, args: unknown[]) =>
      s.replace(/%(\d+)/g, (_, n) => String(args[Number(n) - 1])),
    _npt: (_ctx: string, forms: string[], n: number, args: unknown[]) =>
      forms[n === 1 ? 0 : 1].replace(/%(\d+)/g, (_, i) => String(args[Number(i) - 1])),
  }),
}));
vi.mock('../components/Meta', () => ({ Meta: () => <div data-testid='meta' /> }));
vi.mock('../components/EventTypeIcon', () => ({ EventTypeIcon: () => null }));

const grouped = [
  'bestHand',
  'bestFu',
  'bestTsumoist',
  'dieHard',
  'braveSapper',
  'dovakins',
  'bestDealer',
  'shithander',
  'justAsPlanned',
  'catchEmAll',
  'ninja',
  'riichiNomi',
];
const lists = [
  'honoredDonor',
  'carefulPlanning',
  'doraLord',
  'favoriteAsapinApprentice',
  'andYourRiichiBet',
  'covetousKnight',
  'needMoreGold',
  'favoriteTsuchidaApprentice',
];
function data(full: boolean) {
  const nominations: Record<string, unknown> = {};
  for (const name of grouped)
    nominations[name] = {
      playerIds: [1],
      han: 13,
      fu: 110,
      tsumo: 4,
      ...(full
        ? { count: 3, bestWinCount: 5, handsCount: 7, gamesByPlayer: { 1: ['game-one'] } }
        : {}),
    };
  for (const name of lists)
    nominations[name] = [
      { playerId: 1, count: full ? 3 : 0, score: full ? 8000 : 0, average: full ? 2.5 : 0 },
    ];
  nominations.yakumans = full
    ? [
        { playerId: 1, sessionHash: 'yakuman-game', yakuman: [30], kazoe: false },
        { playerId: 1, kazoe: true },
      ]
    : [];
  nominations.impossibleWait = [
    { playerId: 1, hand: { han: -1, fu: 0 }, amount: 32000, sessionHash: 'yakuman-game' },
    { playerId: 1, hand: { han: 3, fu: 40 }, amount: 5200 },
    { playerId: 1, hand: { han: 0, fu: 0 }, amount: 0 },
  ];
  return {
    players: [{ id: 1, title: 'Winner' }],
    lastUpdate: '2026-10-28 12:00:00',
    achievements: Object.entries(nominations).map(([achievementId, value]) => ({
      achievementId,
      achievementData: JSON.stringify(value),
    })),
  };
}
function view(hidden = false, owner = false, superadmin = false, loading = false) {
  return render(
    <MantineProvider>
      <authCtx.Provider value={{ ...auth, ownEvents: owner ? [42] : [], isSuperadmin: superadmin }}>
        <globalsCtx.Provider
          value={{ ...globals, data: { ...globals.data, achievementsHidden: hidden, loading } }}
        >
          <Achievements params={{ eventId: '42' }} />
        </globalsCtx.Provider>
      </authCtx.Provider>
    </MantineProvider>
  );
}
beforeEach(() => {
  fixture.events = [{ id: 42, title: 'Test event' }];
  fixture.data = data(true);
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

it.each([true, false])(
  'renders all nominations with optional game references=%s',
  (full) => {
    fixture.data = data(full);
    view();
    for (const name of [...grouped, ...lists, 'yakumans', 'impossibleWait']) {
      const control = screen.getByTestId(`sigrun-achievement-toggle-${name}`);
      fireEvent.click(control);
      expect(control.getAttribute('aria-expanded')).toBe('true');
      const panel = document.getElementById(control.getAttribute('aria-controls')!)!;
      if (name === 'yakumans' && !full)
        expect(within(panel).getByText('No yakumans have been collected')).toBeTruthy();
      else expect(panel.textContent).toContain('Winner');
    }
    expect(!!document.querySelector('a[href*="/game/"]')).toBe(true);
  },
  20000
);

it('shows a nomination error for invalid cached JSON', () => {
  fixture.data!.achievements = [{ achievementId: 'bestHand', achievementData: '{bad json' }];
  view();
  fireEvent.click(screen.getByTestId('sigrun-achievement-toggle-bestHand'));
  expect(screen.getAllByText("Couldn't get nomination details").length).toBeGreaterThan(0);
});

it.each([false, true])('waits for %s event data', (missingEvent) => {
  if (missingEvent) fixture.events = null;
  else fixture.data = null;
  view();
  expect(screen.getByTestId('meta')).toBeTruthy();
  expect(screen.queryByTestId('sigrun-achievement-toggle-bestHand')).toBeNull();
});

it.each([
  [false, false, false, false],
  [true, false, false, true],
  [false, true, false, true],
  [false, false, true, true],
])(
  'enforces hidden achievements with owner=%s admin=%s loading=%s',
  (owner, admin, loading, visible) => {
    view(true, owner, admin, loading);
    expect(!!screen.queryByTestId('sigrun-achievement-toggle-bestHand')).toBe(visible);
  }
);
