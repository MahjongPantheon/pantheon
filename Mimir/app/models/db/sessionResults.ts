import { getOka, getUma, Ruleset } from '../../rulesets/ruleset';
import { SessionState } from '../../helpers/SessionState';
import { SessionResults } from '../../database/schema';

export function calc(
  ruleset: Ruleset,
  state: SessionState,
  allPlayerIds: number[],
  event_id: number,
  session_id: number
): Array<Omit<SessionResults, 'id'>> {
  const placesMap = calcPlacesMap(state.getScores());
  const ratingDelta = calcRatingDelta(
    ruleset,
    placesMap,
    state.getScores(),
    state.getReplacements()
  );

  return allPlayerIds.map((currentPlayerId) => {
    const chips = ruleset.rules.chipsValue > 0 ? state.getChips()[currentPlayerId] : 0;
    const score = state.getScores()[currentPlayerId];
    const place = placesMap[currentPlayerId];

    let ratingDeltaForPlayer = ratingDelta[currentPlayerId];
    if (ruleset.rules.chipsValue > 0) {
      ratingDeltaForPlayer += chips * ruleset.rules.chipsValue;
    }
    if (state.getChombo()[currentPlayerId]) {
      ratingDeltaForPlayer += state.getChombo()[currentPlayerId];
    }
    if (ruleset.rules.withYakitori && state.getYakitori()[currentPlayerId]) {
      ratingDeltaForPlayer -= ruleset.rules.yakitoriPenalty;
    }

    return {
      event_id,
      session_id,
      player_id: currentPlayerId,
      score,
      place,
      rating_delta: ratingDeltaForPlayer,
      chips,
    };
  });
}

export function calcPlacesMap(scores: Record<number, number>) {
  const map = Object.entries(scores).map(([playerId, score]) => [
    parseInt(playerId.toString(), 10),
    score,
  ]);
  map.sort((a, b) => b[1] - a[1]);
  return map.reduce(
    (acc, [playerId], idx) => {
      acc[playerId] = idx + 1;
      return acc;
    },
    {} as Record<number, number>
  );
}

export function calcRatingDelta(
  ruleset: Ruleset,
  placesMap: Record<number, number>,
  scores: Record<number, number>,
  replacements: Record<number, number>
) {
  const ratingDelta: Record<number, number> = {};
  const umaList = getUma(Object.values(scores), ruleset);
  Object.entries(scores).forEach(([playerId, score], idx) => {
    const scoreSub =
      replacements[parseInt(playerId.toString(), 10)] &&
      ruleset.rules.replacementPlayerFixedPoints !== 0
        ? ruleset.rules.replacementPlayerFixedPoints
        : score - ruleset.rules.startPoints;
    const uma =
      replacements[parseInt(playerId.toString(), 10)] &&
      ruleset.rules.replacementPlayerOverrideUma !== 0
        ? ruleset.rules.replacementPlayerOverrideUma
        : umaList[idx];
    ratingDelta[parseInt(playerId.toString(), 10)] =
      scoreSub + getOka(placesMap[parseInt(playerId.toString(), 10)], ruleset) + uma;
  });
  return ratingDelta;
}
