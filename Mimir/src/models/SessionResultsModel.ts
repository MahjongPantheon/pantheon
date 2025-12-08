import { Model } from './Model.js';
import { SessionResultsEntity } from 'src/entities/db/SessionResults.entity.js';
import { EventEntity } from 'src/entities/db/Event.entity.js';
import { SessionEntity } from 'src/entities/db/Session.entity.js';
import { RulesetEntity } from 'src/entities/db/Ruleset.entity.js';
import { SessionState } from 'src/aggregates/SessionState.js';

export class SessionResultsModel extends Model {
  findBySession(session_id: number): Promise<SessionResultsEntity[]> {
    return this.repo.db.em.find(SessionResultsEntity, { session: session_id });
  }

  public calc(
    ruleset: RulesetEntity,
    state: SessionState,
    allPlayerIds: number[],
    event_id: number,
    session_id: number
  ): SessionResultsEntity[] {
    const placesMap = this.calcPlacesMap(state.getScores());
    const ratingDelta = this.calcRatingDelta(
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

      const entity = new SessionResultsEntity();
      entity.event = this.repo.db.em.getReference(EventEntity, event_id);
      entity.session = this.repo.db.em.getReference(SessionEntity, session_id);
      entity.playerId = currentPlayerId;
      entity.score = score;
      entity.place = place;
      entity.ratingDelta = ratingDeltaForPlayer;
      entity.chips = chips;

      return entity;
    });
  }

  public calcPlacesMap(scores: Record<number, number>) {
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

  // for a single table
  public calcRatingDelta(
    ruleset: RulesetEntity,
    placesMap: Record<number, number>,
    scores: Record<number, number>,
    replacements: Record<number, number>
  ) {
    const ratingDelta: Record<number, number> = {};
    const umaList = ruleset.getUma(Object.values(scores));
    Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .forEach(([playerId, score], idx) => {
        const pId = parseInt(playerId.toString(), 10);
        const scoreSub =
          replacements[pId] && ruleset.rules.replacementPlayerFixedPoints !== 0
            ? ruleset.rules.replacementPlayerFixedPoints
            : score - ruleset.rules.startPoints;
        const uma =
          replacements[pId] && ruleset.rules.replacementPlayerOverrideUma !== 0
            ? ruleset.rules.replacementPlayerOverrideUma
            : umaList[idx];
        ratingDelta[pId] = scoreSub + ruleset.getOka(placesMap[pId]) + uma;
      });
    return ratingDelta;
  }

  public getUnfinishedSessionResults(
    ruleset: RulesetEntity,
    eventId: number,
    sessionId: number,
    sessionState: SessionState,
    playerIds: number[]
  ) {
    const scores = sessionState.getScores();
    if (ruleset.rules.riichiGoesToWinner) {
      const placesMap = this.calcPlacesMap(scores);
      let firstPlacesCount = 1;
      if (scores[playerIds[0]] === scores[playerIds[1]]) {
        firstPlacesCount = 2;
        if (scores[playerIds[1]] === scores[playerIds[2]]) {
          firstPlacesCount = 3;
          if (scores[playerIds[2]] === scores[playerIds[3]]) {
            // oh wow lol
            firstPlacesCount = 4;
          }
        }
      }

      const riichiBetAmount =
        100 * Math.floor((sessionState.getRiichiBets() * 10) / firstPlacesCount);

      for (const playerId of playerIds) {
        if (placesMap[playerId] <= firstPlacesCount) {
          sessionState.giveRiichiBetsToPlayer(playerId, riichiBetAmount);
        }
      }
    }

    return this.calc(ruleset, sessionState, playerIds, eventId, sessionId);
  }
}
