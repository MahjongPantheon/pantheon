import { PlayerHistory } from '../../database/schema';
import { Ruleset } from '../../rulesets/ruleset';

export type PlayerHistoryItem = Omit<PlayerHistory, 'id'> & { id?: number };

export function makeNewHistoryItemsForSession(
  lastResultsMap: Record<number, PlayerHistoryItem>,
  ruleset: Ruleset,
  eventId: number,
  sessionId: number,
  playersData: Record<
    number, // playerId
    {
      ratingDelta: number;
      place: number;
      chips?: number;
    }
  >
): Record<number, PlayerHistoryItem> {
  const lastResults: Record<number, PlayerHistoryItem> = {};
  for (const playerId in lastResultsMap) {
    lastResults[parseInt(playerId, 10)] = updateAvgPlaceAndGamesCount(
      {
        player_id: parseInt(playerId, 10),
        event_id: eventId,
        session_id: sessionId,
        games_played: lastResultsMap[playerId].games_played,
        avg_place: lastResultsMap[playerId].avg_place,
        rating: lastResultsMap[playerId].rating + playersData[playerId].ratingDelta,
        chips:
          ruleset.rules.chipsValue > 0
            ? (lastResultsMap[playerId].chips ?? 0) + (playersData[playerId].chips ?? 0)
            : 0,
      },
      playersData[playerId].place
    );
  }

  return lastResults;
}

export function updateAvgPlaceAndGamesCount(item: PlayerHistoryItem, place: number) {
  item = { ...item };
  let placesSum = item.games_played * item.avg_place;
  placesSum += place;
  item.games_played += 1;
  item.avg_place = placesSum / item.games_played;
  return item;
}

export function makeHistoryItemsSum(
  source: PlayerHistoryItem,
  add: PlayerHistoryItem,
  ruleset: Ruleset
): PlayerHistoryItem {
  return {
    player_id: source.player_id,
    event_id: source.event_id,
    session_id: source.session_id,
    games_played: source.games_played + add.games_played,
    avg_place:
      (source.avg_place * source.games_played + add.avg_place * add.games_played) /
      (source.games_played + add.games_played),
    rating: source.rating + (add.rating - ruleset.rules.startRating),
    chips: source.chips === null ? null : source.chips + (add.chips ?? 0),
  };
}

export function makeHistoryItemsDiff(
  source: PlayerHistoryItem,
  sub: PlayerHistoryItem,
  ruleset: Ruleset
): PlayerHistoryItem {
  return {
    player_id: source.player_id,
    event_id: source.event_id,
    session_id: source.session_id,
    games_played: Math.abs(source.games_played - sub.games_played),
    avg_place:
      Math.abs(source.avg_place * source.games_played - sub.avg_place * sub.games_played) /
      Math.abs(source.games_played - sub.games_played),
    rating: source.rating - (sub.rating - ruleset.rules.startRating),
    chips: source.chips === null ? null : source.chips - (sub.chips ?? 0),
  };
}

export function calculateHistory(
  itemsFrom: Array<PlayerHistoryItem>,
  itemsTo: Array<PlayerHistoryItem>,
  ruleset: Ruleset
) {
  const fromMap = new Map<string, PlayerHistoryItem>();
  for (const item of itemsFrom) {
    fromMap.set(item.player_id + '_' + item.event_id, item);
  }
  const result = [];
  for (const item of itemsTo) {
    const fromItem = fromMap.get(item.player_id + '_' + item.event_id);
    if (fromItem) {
      if (fromItem.games_played === item.games_played) {
        result.push(makeHistoryItemsDiff(item, fromItem, ruleset));
      }
    } else {
      result.push(item);
    }
  }
  return result;
}
