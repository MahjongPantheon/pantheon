import { StrictMode, type ReactNode } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PlayerSeating } from 'tsclients/proto/atoms.pb';
import type { EventsGetTimerStateResponse } from 'tsclients/proto/mimir.pb';
import { Timer } from './Timer';

const { api, fixture } = vi.hoisted(() => ({
  api: { getTimerState: vi.fn() },
  fixture: { large: true, seating: [] as PlayerSeating[] },
}));
const i18n = { _t: (text: string) => text };
const events = [{ title: 'Tournament' }];
vi.mock('../hooks/api', () => ({ useApi: () => api }));
vi.mock('../hooks/useEvent', () => ({ useEvent: () => events }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../hooks/useIsomorphicState', () => ({ useIsomorphicState: () => [fixture.seating] }));
vi.mock('../components/Meta', () => ({ Meta: () => null }));
vi.mock('../components/EventTypeIcon', () => ({ EventTypeIcon: () => null }));
vi.mock('@mantine/hooks', async (original) => ({
  ...(await original<typeof import('@mantine/hooks')>()),
  useMediaQuery: () => fixture.large,
}));
vi.mock('@mantine/core', async (original) => ({
  ...(await original<typeof import('@mantine/core')>()),
  Text: ({ fz, children }: { fz?: number; children?: ReactNode }) => (
    <span data-font-size={fz}>{children}</span>
  ),
}));

type Sound = { src: string; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn> };
let sounds: Sound[];

function state(values: Partial<EventsGetTimerStateResponse>): EventsGetTimerStateResponse {
  return {
    started: false,
    finished: false,
    timeRemaining: 0,
    waitingForTimer: false,
    hideSeatingAfter: 0,
    ...values,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  fixture.large = true;
  fixture.seating = [];
  sounds = [];
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    'Audio',
    vi.fn(function (src: string) {
      const audio = { src, play: vi.fn().mockResolvedValue(undefined), pause: vi.fn() };
      sounds.push(audio);
      return audio;
    })
  );
  api.getTimerState.mockResolvedValue(
    state({ started: true, timeRemaining: 125, hideSeatingAfter: 2000 })
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const tree = (eventId: string) => (
  <StrictMode>
    <MantineProvider env='test'>
      <Timer params={{ eventId }} />
    </MantineProvider>
  </StrictMode>
);
async function advance(seconds: number) {
  for (let second = 0; second < seconds; second++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  }
}

it('keeps countdown updates pure in StrictMode and responds to viewport changes', async () => {
  const view = render(tree('1'));
  await advance(1);
  expect(screen.getByText('2:05')).toBeTruthy();
  await advance(1);
  const timer = screen.getByText('2:04');
  expect(timer.dataset.fontSize).toBe('240');
  fixture.large = false;
  view.rerender(tree('1'));
  expect(screen.getByText('2:04').dataset.fontSize).toBe('100');
  expect(api.getTimerState).toHaveBeenCalledExactlyOnceWith(1);
  await advance(5);
  expect(sounds.reduce((count, sound) => count + sound.play.mock.calls.length, 0)).toBe(1);
});

it('does not overlap slow polls and retries a failed request', async () => {
  let reject!: (error: Error) => void;
  api.getTimerState.mockReturnValueOnce(
    new Promise((_resolve, fail) => {
      reject = fail;
    })
  );
  render(tree('1'));
  await advance(5);
  expect(api.getTimerState).toHaveBeenCalledOnce();
  await act(async () => reject(new Error('Offline')));
  await advance(1);
  expect(api.getTimerState).toHaveBeenCalledTimes(2);
  expect(screen.getByText('2:05')).toBeTruthy();
});

it('ignores old event responses and clears polling and audio on unmount', async () => {
  let resolve!: (state: EventsGetTimerStateResponse) => void;
  api.getTimerState.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    })
  );
  const view = render(tree('1'));
  await advance(1);
  api.getTimerState.mockResolvedValue(state({ timeRemaining: 62 }));
  view.rerender(tree('2'));
  await advance(1);
  expect(screen.getByText('1:02')).toBeTruthy();
  await act(async () => resolve(state({ timeRemaining: 999 })));
  expect(screen.getByText('1:02')).toBeTruthy();
  view.unmount();
  api.getTimerState.mockClear();
  await advance(5);
  expect(api.getTimerState).not.toHaveBeenCalled();
  expect(sounds.every((sound) => sound.pause.mock.calls.length === 1)).toBe(true);
});

it('plays the start sound once across periodic refreshes and handles blocked playback', async () => {
  render(tree('1'));
  for (const sound of sounds) sound.play.mockRejectedValue(new Error('Autoplay blocked'));
  await advance(70);
  expect(api.getTimerState.mock.calls.length).toBeGreaterThan(1);
  expect(sounds.reduce((count, sound) => count + sound.play.mock.calls.length, 0)).toBe(1);
});

it('waits for the new timer start before replaying the gong for the next seating', async () => {
  api.getTimerState.mockResolvedValue(
    state({ started: true, waitingForTimer: true, timeRemaining: 100 })
  );
  render(tree('1'));
  await advance(3);
  expect(sounds.every((sound) => sound.play.mock.calls.length === 0)).toBe(true);
  api.getTimerState.mockResolvedValue(state({ started: true, timeRemaining: 100 }));
  await advance(2);
  expect(sounds.reduce((count, sound) => count + sound.play.mock.calls.length, 0)).toBe(1);
});

it('groups seating by table and orders players by their wind position', async () => {
  fixture.seating = [
    PlayerSeating.initialize({ tableIndex: 2, order: 1, playerId: 2, playerTitle: 'Third player' }),
    PlayerSeating.initialize({
      tableIndex: 1,
      order: 2,
      playerId: 3,
      playerTitle: 'Second player',
    }),
    PlayerSeating.initialize({ tableIndex: 1, order: 1, playerId: 1, playerTitle: 'First player' }),
  ];
  api.getTimerState.mockResolvedValue(state({ waitingForTimer: true }));
  const view = render(tree('1'));
  await advance(1);
  const text = view.container.textContent;
  expect(text.indexOf('First player')).toBeGreaterThanOrEqual(0);
  expect(text.indexOf('First player')).toBeLessThan(text.indexOf('Second player'));
  expect(text.indexOf('Second player')).toBeLessThan(text.indexOf('Third player'));
});
