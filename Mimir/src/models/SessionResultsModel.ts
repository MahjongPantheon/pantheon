import { TransactionPropagation } from '@mikro-orm/core';
import { Model } from './Model.js';
import { SessionResultsEntity } from '../entities/SessionResults.entity.js';
import { EventEntity } from '../entities/Event.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionState } from '../helpers/SessionState.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import {
  PlayersGetLastResultsPayload,
  PlayersGetLastResultsResponse,
} from 'tsclients/proto/mimir.pb.js';
import { PlayerModel } from './PlayerModel.js';
import { PersonEx, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { EventModel } from './EventModel.js';
import { SessionModel } from './SessionModel.js';

export class SessionResultsModel extends Model {
  findBySession(sessionId: number[]): Promise<SessionResultsEntity[]> {
    return this.repo.em.find(
      SessionResultsEntity,
      {
        session: { id: { $in: sessionId } },
      },
      { populate: ['session'] }
    );
  }

  findByEvent(eventId: number[]): Promise<SessionResultsEntity[]> {
    return this.repo.em.find(SessionResultsEntity, {
      event: { id: { $in: eventId } },
    });
  }

  public calc(
    ruleset: RulesetEntity,
    state: SessionState,
    allPlayerIds: number[],
    eventId: number,
    sessionId: number
  ): SessionResultsEntity[] {
    const placesMap = this.calcPlacesMap(state.getScores());
    const ratingDelta = this.calcRatingDelta(
      state.state.playerIds,
      ruleset,
      placesMap,
      state.getScores(),
      state.getReplacements() ?? {}
    );

    return allPlayerIds.map((currentPlayerId) => {
      const chips = ruleset.rules.chipsValue > 0 ? (state.getChips()[currentPlayerId] ?? 0) : 0;
      const score = state.getScores()[currentPlayerId];
      const place = placesMap[currentPlayerId];

      const isReplaced = !!state.getReplacements()?.[currentPlayerId];
      let ratingDeltaForPlayer = ratingDelta[currentPlayerId];
      if (!isReplaced && ruleset.rules.chipsValue > 0) {
        ratingDeltaForPlayer += chips * ruleset.rules.chipsValue;
      }
      if (!isReplaced && state.getChombo()[currentPlayerId]) {
        ratingDeltaForPlayer += state.getChombo()[currentPlayerId];
      }
      if (!isReplaced && ruleset.rules.withYakitori && state.getYakitori()[currentPlayerId]) {
        ratingDeltaForPlayer -= ruleset.rules.yakitoriPenalty;
      }

      const entity = new SessionResultsEntity();
      entity.event = this.repo.em.getReference(EventEntity, eventId);
      entity.session = this.repo.em.getReference(SessionEntity, sessionId);
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
        acc[+playerId] = idx + 1;
        return acc;
      },
      {} as Record<number, number>
    );
  }

  // for a single table
  public calcRatingDelta(
    orderedPlayers: number[],
    ruleset: RulesetEntity,
    placesMap: Record<number, number>,
    scores: Record<number, number>,
    replacements: Record<number, number>
  ) {
    const ratingDelta: Record<number, number> = {};
    const umaList = ruleset.getUma(Object.values(scores));
    Object.entries(scores)
      .sort(
        (a, b) =>
          orderedPlayers.indexOf(parseInt(a[0].toString(), 10)) -
          orderedPlayers.indexOf(parseInt(b[0].toString(), 10))
      )
      .sort((a, b) => b[1] - a[1])
      .forEach(([playerId, score], idx) => {
        const pId = parseInt(playerId.toString(), 10);
        const scoreSub = replacements[pId]
          ? (ruleset.rules.replacementPlayerFixedPoints ?? 0)
          : score - ruleset.rules.startPoints;
        const uma = replacements[pId]
          ? (ruleset.rules.replacementPlayerOverrideUma ?? 0)
          : umaList[idx];
        ratingDelta[pId] =
          scoreSub + (replacements[pId] ? 0 : ruleset.getOka(placesMap[pId])) + uma;
      });
    return ratingDelta;
  }

  public getUnfinishedSessionResults(
    ruleset: RulesetEntity,
    eventId: number,
    sessionId: number,
    sessionState: SessionState,
    playerIds: number[]
  ): SessionResultsEntity[] {
    const scores = sessionState.getScores();
    if (ruleset.rules.riichiGoesToWinner) {
      const highestScore = Math.max(...playerIds.map((playerId) => scores[playerId]));
      const winners = playerIds.filter((playerId) => scores[playerId] === highestScore);
      // Scores are whole points; leave any indivisible remainder on the table.
      const riichiBetAmount = Math.floor((sessionState.getRiichiBets() * 1000) / winners.length);

      for (const playerId of winners) {
        sessionState.giveRiichiBetsToPlayer(playerId, riichiBetAmount);
      }
    }

    return this.calc(ruleset, sessionState, playerIds, eventId, sessionId);
  }

  async getFinishedSessionResults(
    input: PlayersGetLastResultsPayload
  ): Promise<[SessionResultsEntity[], Record<number, PersonEx>]> {
    const playerHistoryModel = this.getModel(PlayerHistoryModel);
    const lastPlayerResult = await playerHistoryModel.findLastByEventAndPlayer(
      input.eventId,
      input.playerId
    );

    if (lastPlayerResult) {
      const results = await this.findBySession([lastPlayerResult.sessionId]);
      if (results.length === 0) {
        return [[], {}];
      }
      const playerModel = this.getModel(PlayerModel);
      const { playersData } = await playerModel.findPlayersForSessions(
        [results[0].session.representationalHash!],
        true
      );
      const players = playerModel
        .substituteReplacements(playersData.players, playersData.replaceMap)
        .reduce(
          (acc, p) => {
            acc[p.id] = p;
            return acc;
          },
          {} as Record<number, PersonEx>
        );
      return [results, players];
    }
    return [[], {}];
  }

  async getPrefinishedSessionResults(
    input: PlayersGetLastResultsPayload,
    event: EventEntity
  ): Promise<[SessionResultsEntity[], Record<number, PersonEx>]> {
    const sessionModel = this.getModel(SessionModel);
    const lastSession = await sessionModel.findLastByPlayerAndEvent(
      input.playerId,
      input.eventId,
      SessionStatus.SESSION_STATUS_PREFINISHED
    );
    await this.repo.em.populate(lastSession, ['players']);
    if (lastSession.length > 0) {
      const playerIds = lastSession[0].players.map((player) => player.playerId);
      const sessionState = new SessionState(
        event.ruleset,
        playerIds,
        lastSession[0].intermediateResults
      );
      const playerModel = this.getModel(PlayerModel);
      const { playersData } = await playerModel.findPlayersForSessions(
        [lastSession[0].representationalHash!],
        true
      );
      sessionState.setReplacements(
        Object.fromEntries([...playersData.replaceMap].map(([id, player]) => [id, player.id]))
      );
      const players = playerModel
        .substituteReplacements(playersData.players, playersData.replaceMap)
        .reduce(
          (acc, p) => {
            acc[p.id] = p;
            return acc;
          },
          {} as Record<number, PersonEx>
        );
      return [
        this.getUnfinishedSessionResults(
          event.ruleset,
          event.id,
          lastSession[0].id,
          sessionState,
          playerIds
        ),
        players,
      ];
    }
    return [[], {}];
  }

  async getLastResults(
    input: PlayersGetLastResultsPayload
  ): Promise<PlayersGetLastResultsResponse> {
    return this.repo.em.transactional(
      async () => {
        const eventModel = this.getModel(EventModel);
        const event = await eventModel.findById([input.eventId]);
        if (event.length === 0) {
          return {
            results: [],
          };
        }

        let results: SessionResultsEntity[] = [];
        let players: Record<number, PersonEx> = {};
        if (event[0].syncEnd) {
          // try to get prefinished results
          [results, players] = await this.getPrefinishedSessionResults(input, event[0]);
          if (results.length === 0) {
            // fallback to finished results
            [results, players] = await this.getFinishedSessionResults(input);
          }
        } else {
          [results, players] = await this.getFinishedSessionResults(input);
        }

        if (results.length > 0) {
          return {
            results: results.map((result) => ({
              sessionHash: result.session.representationalHash ?? '',
              eventId: result.event.id,
              playerId: result.playerId,
              score: result.score,
              ratingDelta: result.ratingDelta,
              place: result.place,
              title: players[result.playerId]?.title,
              hasAvatar: players[result.playerId]?.hasAvatar,
              lastUpdate: players[result.playerId]?.lastUpdate,
            })),
          };
        }
        return {
          results: [],
        };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }
}
