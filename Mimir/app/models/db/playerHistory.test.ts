import { createRuleset } from '../../rulesets/ruleset';
import {
  makeHistoryItemsDiff,
  makeHistoryItemsSum,
  makeNewHistoryItemsForSession,
  updateAvgPlaceAndGamesCount,
} from './playerHistory';

describe('PlayerHistory', () => {
  it('should update history item', () => {
    const modified = updateAvgPlaceAndGamesCount(
      {
        player_id: 2,
        event_id: 3,
        session_id: 4,
        avg_place: 2.5,
        games_played: 4,
        rating: 1500,
        chips: 1,
      },
      2
    );
    expect(modified).toEqual({
      player_id: 2,
      event_id: 3,
      session_id: 4,
      avg_place: 2.4,
      games_played: 5,
      rating: 1500,
      chips: 1,
    });
  });

  it('should make new item for session', () => {
    const ruleset = createRuleset('ema');
    ruleset.rules.chipsValue = 1;
    const newItems = makeNewHistoryItemsForSession(
      {
        5: {
          player_id: 5,
          event_id: 2,
          session_id: 3,
          avg_place: 2.4,
          chips: 1,
          games_played: 5,
          rating: 1540,
        },
        6: {
          player_id: 6,
          event_id: 2,
          session_id: 3,
          avg_place: 2.4,
          chips: 1,
          games_played: 5,
          rating: 1540,
        },
        7: {
          player_id: 7,
          event_id: 2,
          session_id: 3,
          avg_place: 2.4,
          chips: 1,
          games_played: 5,
          rating: 1540,
        },
        8: {
          player_id: 8,
          event_id: 2,
          session_id: 3,
          avg_place: 2.4,
          chips: 1,
          games_played: 5,
          rating: 1540,
        },
      },
      ruleset,
      2,
      3,
      {
        5: { ratingDelta: 10, place: 1, chips: 1 },
        6: { ratingDelta: 5, place: 2, chips: 2 },
        7: { ratingDelta: -5, place: 3, chips: -1 },
        8: { ratingDelta: -10, place: 4, chips: -2 },
      }
    );

    expect(newItems).toEqual({
      5: {
        player_id: 5,
        event_id: 2,
        session_id: 3,
        avg_place: 2.1666666666666665,
        chips: 2,
        games_played: 6,
        rating: 1550,
      },
      6: {
        player_id: 6,
        event_id: 2,
        session_id: 3,
        avg_place: 2.3333333333333335,
        chips: 3,
        games_played: 6,
        rating: 1545,
      },
      7: {
        player_id: 7,
        event_id: 2,
        session_id: 3,
        avg_place: 2.5,
        chips: 0,
        games_played: 6,
        rating: 1535,
      },
      8: {
        player_id: 8,
        event_id: 2,
        session_id: 3,
        avg_place: 2.6666666666666665,
        chips: -1,
        games_played: 6,
        rating: 1530,
      },
    });
  });

  it('should make a sum of two history items', () => {
    const ruleset = createRuleset('tenhounet');
    ruleset.rules.startRating = 1500;
    const item1 = {
      player_id: 7,
      event_id: 2,
      session_id: 3,
      avg_place: 2.6,
      chips: 1,
      games_played: 5,
      rating: 1540,
    };
    const item2 = {
      player_id: 7,
      event_id: 2,
      session_id: 3,
      avg_place: 2.2,
      chips: 1,
      games_played: 5,
      rating: 1540,
    };

    expect(makeHistoryItemsSum(item1, item2, ruleset)).toEqual({
      player_id: 7,
      event_id: 2,
      session_id: 3, // TODO: в этом поле нет смысла в данном случае
      avg_place: 2.4,
      chips: 2,
      games_played: 10,
      rating: 1580,
    });
  });

  it('should make a diff of two history items', () => {
    const ruleset = createRuleset('tenhounet');
    ruleset.rules.startRating = 1500;
    const item1 = {
      player_id: 7,
      event_id: 2,
      session_id: 3,
      avg_place: 2.6,
      chips: 1,
      games_played: 5,
      rating: 1540,
    };
    const item2 = {
      player_id: 7,
      event_id: 2,
      session_id: 3,
      avg_place: 2.2,
      chips: 1,
      games_played: 8,
      rating: 1540,
    };
    const expected = {
      player_id: 7,
      event_id: 2,
      session_id: 3, // TODO: в этом поле нет смысла в данном случае
      avg_place: 1.5333333333333339,
      chips: 0,
      games_played: 3,
      rating: 1500,
    };

    expect(makeHistoryItemsDiff(item2, item1, ruleset)).toEqual(expected);
    expect(makeHistoryItemsSum(item1, expected, ruleset)).toEqual(item2);
  });
});
