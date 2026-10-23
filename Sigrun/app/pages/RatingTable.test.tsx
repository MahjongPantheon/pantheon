import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { RatingTable } from './RatingTable';
import { RatingOrderBy } from '../helpers/ratingPlaces';

const fixture = vi.hoisted(() => ({
  players: [105000, 100000, 100000, 95000].map((rating, index) => ({
    id: index + 1,
    title: `Player ${index + 1}`,
    rating,
    gamesPlayed: index === 0 ? 5 : 4,
    avgPlace: 1.5 + index * 0.25,
    avgScore: 25000,
    chips: 0,
    penaltiesCount: 0,
  })),
}));

vi.mock('../hooks/useIsomorphicState', () => ({
  useIsomorphicState: () => [fixture.players, null, false],
}));
vi.mock('../hooks/useEvent', () => ({
  useEvent: () => [{ id: 1, title: 'Test event', isTeam: false, withChips: false }],
}));
vi.mock('../hooks/api', () => ({ useApi: () => ({}) }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => ({ _t: (text: string) => text }) }));
vi.mock('../hooks/storage', () => ({ useStorage: () => ({ getDimmed: () => false }) }));
vi.mock('../components/Meta', () => ({ Meta: () => null }));
vi.mock('../components/PlayerAvatar', () => ({ PlayerAvatar: () => null }));
vi.mock('../components/EventTypeIcon', () => ({ EventTypeIcon: () => null }));
vi.mock('../components/TeamTable', () => ({ TeamTable: () => null }));

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('rating table places and CSV export', () => {
  it('includes shared place labels in server-rendered markup', () => {
    const markup = renderToString(
      <MantineProvider>
        <RatingTable params={{ eventId: '1' }} />
      </MantineProvider>
    );
    const page = new DOMParser().parseFromString(markup, 'text/html');

    expect(
      fixture.players.map(
        (player) =>
          page.querySelector(`[data-testid="sigrun-rating-player-place-${player.id}"]`)?.textContent
      )
    ).toEqual(['1', '2-3', '2-3', '4']);
  });

  it.each<[RatingOrderBy | undefined, string[]]>([
    [undefined, ['1', '2-3', '2-3', '4']],
    ['games_and_rating', ['1', '2-3', '2-3', '4']],
    ['avg_place', ['1', '2', '3', '4']],
  ])('uses the same places in the %s view and downloaded CSV', async (orderBy, expected) => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:test-rating');
    vi.stubGlobal('URL', Object.assign(class extends URL {}, { createObjectURL }));
    render(
      <MantineProvider>
        <RatingTable params={{ eventId: '1', orderBy }} />
      </MantineProvider>
    );

    expect(
      fixture.players.map(
        (player) => screen.getByTestId(`sigrun-rating-player-place-${player.id}`).textContent
      )
    ).toEqual(expected);
    expect(
      screen.getAllByTestId(/sigrun-rating-player-link-/).map((link) => link.textContent)
    ).toEqual(fixture.players.map((player) => player.title));

    fireEvent.click(screen.getByTestId('sigrun-rating-download-csv'));
    const csv = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(createObjectURL.mock.calls[0][0]);
    });
    const rows = csv
      .split('\n')
      .slice(1)
      .map((line) => line.split(','));
    expect(rows.map((row) => row[0])).toEqual(expected);
    expect(rows.map((row) => row[2])).toEqual(fixture.players.map((player) => player.title));
  });
});
