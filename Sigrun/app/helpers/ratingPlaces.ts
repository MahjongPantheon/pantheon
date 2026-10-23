import type { PlayerInRating } from 'tsclients/proto/atoms.pb';

type RatingPlayer = Pick<PlayerInRating, 'rating' | 'gamesPlayed'>;

export type RatingOrderBy =
  | 'name'
  | 'rating'
  | 'games_and_rating'
  | 'avg_place'
  | 'avg_score'
  | 'team'
  | 'chips';

// Keep the API's ordering (including its secondary average-place sort) intact.
// Only rating-based views share places; other views retain their row numbers.
export function getRatingPlaces(
  players: readonly RatingPlayer[],
  orderBy: RatingOrderBy
): string[] {
  const places = players.map((_, index) => String(index + 1));
  if (orderBy !== 'rating' && orderBy !== 'games_and_rating') {
    return places;
  }

  const sharesPlace = (first: RatingPlayer, other: RatingPlayer) =>
    Math.abs(first.rating - other.rating) < 0.0001 &&
    (orderBy !== 'games_and_rating' || first.gamesPlayed === other.gamesPlayed);

  for (let start = 0; start < players.length;) {
    let end = start + 1;
    while (end < players.length && sharesPlace(players[start], players[end])) {
      end++;
    }
    if (end - start > 1) {
      places.fill(`${start + 1}-${end}`, start, end);
    }
    start = end;
  }
  return places;
}
