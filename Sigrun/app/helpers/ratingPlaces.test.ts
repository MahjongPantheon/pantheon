import { describe, expect, it } from 'vitest';
import { getRatingPlaces, RatingOrderBy } from './ratingPlaces';

const playersWithRatings = (ratings: number[]) =>
  ratings.map((rating) => ({ rating, gamesPlayed: 4 }));

describe('rating places', () => {
  it.each<[number[], string[]]>([
    [
      [105000, 100000, 100000, 95000],
      ['1', '2-3', '2-3', '4'],
    ],
    [
      [100000, 100000, 100000, 95000, 95000],
      ['1-3', '1-3', '1-3', '4-5', '4-5'],
    ],
    [
      [100000, 100000, 100000],
      ['1-3', '1-3', '1-3'],
    ],
    [
      [105000, 100000, 95000],
      ['1', '2', '3'],
    ],
    [[100000], ['1']],
    [
      [0.000099, 0],
      ['1-2', '1-2'],
    ],
    [
      [0.0001, 0],
      ['1', '2'],
    ],
    [
      [0.000101, 0],
      ['1', '2'],
    ],
    [[], []],
  ])('labels rating groups in %j as %j', (ratings, expected) => {
    expect(getRatingPlaces(playersWithRatings(ratings), 'rating')).toEqual(expected);
  });

  it('ignores games played and average place in the rating view without changing API order', () => {
    const players = Object.freeze([
      Object.freeze({ id: 3, rating: 100000, gamesPlayed: 3, avgPlace: 1.5 }),
      Object.freeze({ id: 1, rating: 100000, gamesPlayed: 4, avgPlace: 2.5 }),
    ]);
    const original = players.map((player) => ({ ...player }));

    expect(getRatingPlaces(players, 'rating')).toEqual(['1-2', '1-2']);
    expect(players).toEqual(original);
  });

  it('shares places only when both games played and rating match in games+rating view', () => {
    const players = [
      { rating: 100000, gamesPlayed: 5 },
      { rating: 100000, gamesPlayed: 4 },
      { rating: 100000, gamesPlayed: 4 },
      { rating: 95000, gamesPlayed: 4 },
      { rating: 95000, gamesPlayed: 3 },
    ];

    expect(getRatingPlaces(players, 'games_and_rating')).toEqual(['1', '2-3', '2-3', '4', '5']);
  });

  it.each<RatingOrderBy>(['name', 'avg_place', 'avg_score', 'chips', 'team'])(
    'keeps ordinal positions for %s ordering',
    (orderBy) => {
      expect(getRatingPlaces(playersWithRatings([100000, 100000]), orderBy)).toEqual(['1', '2']);
    }
  );
});
