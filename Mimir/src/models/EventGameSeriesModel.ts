import { EventEntity } from 'src/entities/Event.entity.js';
import { Model } from './Model.js';
import { SessionModel } from './SessionModel.js';
import { PersonEx, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { SessionResultsModel } from './SessionResultsModel.js';
import { SessionResultsEntity } from 'src/entities/SessionResults.entity.js';
import { SessionEntity } from 'src/entities/Session.entity.js';

type SeriesResult = {
  placesSum: number;
  scoresSum: number;
  sessionIds: number[];
  playerId?: number;
  currentSeries?: number[];
  currentSeriesScores?: number;
  currentSeriesPlaces?: number;
};

export class EventGameSeriesModel extends Model {
  async getGamesSeries(event: EventEntity) {
    if (event.seriesLength < 1) {
      throw new Error('This event does not support series');
    }

    const sessionModel = this.getModel(SessionModel);
    const sessionResultsModel = this.getModel(SessionResultsModel);

    const games = await sessionModel.findByEventAndStatus(
      [event.id],
      [SessionStatus.SESSION_STATUS_FINISHED]
    );
    const sessionResults = await sessionResultsModel.findByEvent([event.id]);
    const playersData = this.getPlayersData(sessionResults, event.seriesLength);
    const series = this.findBestSeriesResults(playersData, event.seriesLength);
    const { players } = await sessionModel.getPlayersOfGames(games, false);
    return this.formatSeriesResults(players, games, sessionResults, series);
  }

  protected getPlayersData(sessionResults: SessionResultsEntity[], seriesLength: number) {
    const playersData: Record<
      number,
      Array<{ sessionId: number; score: number; place: number }>
    > = {};
    sessionResults.forEach((sessionResult) => {
      if (!playersData[sessionResult.playerId]) {
        playersData[sessionResult.playerId] = [];
      }
      playersData[sessionResult.playerId].push({
        sessionId: sessionResult.id,
        score: sessionResult.score,
        place: 0,
      });
    });
    // filter out players with incomplete series
    for (const playerId in playersData) {
      if (playersData[playerId].length < seriesLength) {
        delete playersData[playerId];
      }
    }
    return playersData;
  }

  protected findBestSeriesResults(
    playerData: ReturnType<typeof this.getPlayersData>,
    seriesLength: number
  ): SeriesResult[] {
    const results: SeriesResult[] = [];

    for (const playerId in playerData) {
      let offset = 0;
      const id = parseInt(playerId);
      const gamesCount = playerData[id].length;
      // make sure that games were sorted (newest goes first)
      const playerGames = playerData[id].toSorted((a, b) => a.sessionId - b.sessionId);

      let bestSeries: SeriesResult | null = null;
      while (offset + seriesLength <= gamesCount) {
        const series = playerGames.slice(offset, offset + seriesLength);
        const places = series.reduce((acc, game) => {
          return acc + game.place;
        }, 0);
        const scores = series.reduce((acc, game) => {
          return acc + game.score;
        }, 0);
        const sessionIds = series.map((game) => game.sessionId);

        if (!bestSeries) {
          // for the first iteration we should get the first series
          bestSeries = {
            placesSum: places,
            scoresSum: scores,
            sessionIds,
          };
        } else {
          // the less places the better
          if (places <= bestSeries.placesSum) {
            // we can have multiple series with same places sum
            // let's get the one with better scores in that case
            if (places === bestSeries.placesSum) {
              // the bigger scores the better
              if (scores > bestSeries.scoresSum) {
                bestSeries = {
                  placesSum: places,
                  scoresSum: scores,
                  sessionIds,
                };
              }
            } else {
              bestSeries = {
                placesSum: places,
                scoresSum: scores,
                sessionIds,
              };
            }
          }
        }
        offset++;
      }

      // It's implied that $bestSeries is not null after the loop, so we add guard here by continue otherwise
      if (!bestSeries) {
        continue;
      }

      // it is useful to know current player series
      offset = gamesCount - seriesLength;
      const currentSeries = playerGames.slice(offset);
      const currentSeriesScores = currentSeries.reduce((acc, game) => {
        return acc + game.score;
      }, 0);
      const currentSeriesPlaces = currentSeries.reduce((acc, game) => {
        return acc + game.place;
      }, 0);
      const currentSeriesSessionIds = currentSeries.map((game) => game.sessionId);

      bestSeries.playerId = id;
      bestSeries.currentSeries = currentSeriesSessionIds;
      bestSeries.currentSeriesScores = currentSeriesScores;
      bestSeries.currentSeriesPlaces = currentSeriesPlaces;

      results.push(bestSeries);
    }

    results.sort((a, b) => {
      const diff = a.placesSum - b.placesSum;
      if (diff) {
        return diff > 0 ? 1 : -1;
      }
      const scoreDiff = b.scoresSum - a.scoresSum;
      if (Math.abs(scoreDiff) < 0.00001) {
        return 0;
      } else if (scoreDiff > 0) {
        return 1;
      } else {
        return -1;
      }
    });

    return results;
  }

  protected formatSeriesResults(
    players: PersonEx[],
    games: SessionEntity[],
    sessionResults: SessionResultsEntity[],
    results: SeriesResult[]
  ) {
    const hashes = games.reduce(
      (acc, game) => {
        if (game.representationalHash) {
          acc[game.id] = game.representationalHash;
        }
        return acc;
      },
      {} as Record<number, string>
    );

    const places = sessionResults.reduce(
      (acc, result) => {
        if (!acc[result.session.id]) {
          acc[result.session.id] = {};
        }
        acc[result.session.id][result.playerId] = result.place;
        return acc;
      },
      {} as Record<number, Record<number, number>>
    );

    return results.map((result) => ({
      player: players.find((player) => player.id === result.playerId)!,
      bestSeries: this.formatSeries(result.sessionIds, result.playerId ?? 0, hashes, places),
      bestSeriesScores: result.scoresSum,
      bestSeriesPlaces: result.placesSum,
      bestSeriesAvgPlace: this.formatAvgPlace(result.placesSum, result.sessionIds.length),
      currentSeries: this.formatSeries(
        result.currentSeries ?? [],
        result.playerId ?? 0,
        hashes,
        places
      ),
      currentSeriesScores: result.currentSeriesScores,
      currentSeriesPlaces: result.currentSeriesPlaces,
      currentSeriesAvgPlace: this.formatAvgPlace(
        result.currentSeriesPlaces!,
        result.currentSeries?.length ?? 0
      ),
    }));
  }

  protected formatSeries(
    seriesIds: number[],
    playerId: number,
    hashes: Record<number, string>,
    places: Record<number, Record<number, number>>
  ) {
    const result = [];
    for (const seriesId of seriesIds) {
      result.push({
        hash: hashes[playerId],
        place: places[seriesId][playerId],
      });
    }
    return result;
  }

  protected formatAvgPlace(placesSum: number, gamesCount: number) {
    return (gamesCount === 0 ? 0 : (1.0 * placesSum) / gamesCount).toFixed(2);
  }
}
