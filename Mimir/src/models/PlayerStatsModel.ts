import { GHOST_PLAYER_ID } from '../../../Common/constants.js';
import { Collection, TransactionPropagation } from '@mikro-orm/core';
import { JobsQueueEntity } from '../entities/JobsQueue.entity.js';
import { Model } from './Model.js';
import moment from 'moment';
import { PlayerStatsEntity } from '../entities/PlayerStats.entity.js';
import { EventRegistrationModel } from './EventRegistrationModel.js';
import {
  PlayersGetPlayerStatsPayload,
  PlayersGetPlayerStatsResponse,
} from 'tsclients/proto/mimir.pb.js';
import { EventEntity } from '../entities/Event.entity.js';
import { PlayerModel } from './PlayerModel.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { SessionResultsEntity } from '../entities/SessionResults.entity.js';
import { SessionModel } from './SessionModel.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { SessionPlayerEntity } from '../entities/SessionPlayer.entity.js';
import {
  HandValueStat,
  PersonEx,
  PlacesSummaryItem,
  RoundOutcome,
  YakuStat,
} from 'tsclients/proto/atoms.pb.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { PointsCalc, RiichiBetAssignment } from '../helpers/PointsCalc.js';
import { HandEntity } from '../entities/Hand.entity.js';
import { SessionState } from '../helpers/SessionState.js';

type OutcomeStats = {
  ron: number;
  tsumo: number;
  nagashi: number;
  chombo: number;
  feed: number;
  tsumofeed: number;
  winsWithOpen: number;
  winsWithRiichi: number;
  winsWithDama: number;
  unforcedFeedToOpen: number;
  unforcedFeedToRiichi: number;
  unforcedFeedToDama: number;
  draw: number;
  drawTempai: number;
  pointsWon: number;
  pointsLostRon: number;
  pointsLostTsumo: number;
};

type RiichiStats = {
  riichiWon: number;
  riichiLost: number;
  feedUnderRiichi: number;
};

export class PlayerStatsModel extends Model {
  async scheduleRebuildPlayersStats(eventId: number) {
    await this.repo.em.execute(`
      insert into jobs_queue (created_at, job_name, job_arguments)
      select now(), 'playerStats', '{"playerId":' || player_id || ',"eventId":' || event_id || '}'
      from event_registered_players where event_id = ${eventId}
    `);
  }

  async scheduleRebuildSinglePlayerStats(playerId: number, eventId: number) {
    const job = new JobsQueueEntity();
    job.createdAt = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    job.jobName = 'playerStats';
    job.jobArguments = JSON.stringify({ playerId, eventId });
    this.repo.em.persist(job);
  }

  async invalidatePlayerStats(playerId: number) {
    return this.repo.em.transactional(
      async () => {
        const registrations = await this.getModel(EventRegistrationModel).findByPlayerId(playerId);
        const eventIds = new Set(registrations.map((registration) => registration.event.id));
        await Promise.all(
          Array.from(eventIds, (eventId) =>
            this.scheduleRebuildSinglePlayerStats(playerId, eventId)
          )
        );
        return { success: true };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async getPlayerStats(
    input: PlayersGetPlayerStatsPayload,
    options: { forceRebuild?: boolean } = {}
  ): Promise<PlayersGetPlayerStatsResponse> {
    return this.repo.em.transactional(
      async () => {
        if (input.eventIdList.length === 0) {
          throw new Error('Event ID list cannot be empty');
        }

        // Find precalculated stats if any
        if (
          !options.forceRebuild &&
          input.eventIdList.length === 1 &&
          !input.dateFrom &&
          !input.dateTo
        ) {
          const stats = await this.repo.em.findAll(PlayerStatsEntity, {
            where: {
              event: input.eventIdList[0],
              playerId: input.playerId,
            },
          });
          // Older rebuilds stored empty summaries or null ratings even when games existed.
          const cachedData = stats[0]?.data;
          const incompleteCache =
            (cachedData?.ratingHistory?.some((rating) => !Number.isFinite(rating)) ?? false) ||
            ((cachedData?.totalPlayedGames ?? 0) > 0 &&
              (!cachedData?.playersInfo?.length ||
                !Object.keys(cachedData.scoreHistory ?? {}).length ||
                !Object.keys(cachedData.placesSummary ?? {}).length));
          if (stats.length > 0 && !incompleteCache) {
            return {
              ratingHistory: stats[0].data.ratingHistory ?? [],
              scoreHistory: (
                stats[0].data.scoreHistoryOrder ??
                Object.keys(stats[0].data.scoreHistory ?? {}).map(Number)
              ).map((sessionId) => ({
                tables: (stats[0].data.scoreHistory?.[sessionId] ?? []).map((item) => ({
                  ...item,
                  chips: item.chips ?? 0,
                })),
              })),
              playersInfo: (stats[0].data.playersInfo ?? []).map((i) => ({
                ...i,
                tenhouId: i.tenhouId ?? '',
              })),
              placesSummary: [1, 2, 3, 4].map((place) => ({
                place,
                count: stats[0].data.placesSummary?.[place] ?? 0,
              })),
              totalPlayedGames: stats[0].data.totalPlayedGames ?? 0,
              totalPlayedRounds: stats[0].data.totalPlayedRounds ?? 0,
              winSummary: stats[0].data.winSummary!,
              handsValueSummary: Object.entries(stats[0].data.handsValueSummary ?? {}).map(
                ([hanCount, count]) => ({
                  hanCount: +hanCount,
                  count,
                })
              ),
              yakuSummary: Object.entries(stats[0].data.yakuSummary ?? {}).map(
                ([yakuId, count]) => ({
                  yakuId: +yakuId,
                  count,
                })
              ),
              riichiSummary: stats[0].data.riichiSummary!,
              doraStat: stats[0].data.doraStat!,
              lastUpdate: stats[0].data.lastUpdate ?? new Date().toISOString(),
            };
          }
        }

        return this._calculateStat(
          input.eventIdList,
          input.playerId,
          input.dateFrom ?? undefined,
          input.dateTo ?? undefined
        );
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async _calculateStat(
    eventIdList: number[],
    playerId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<PlayersGetPlayerStatsResponse> {
    const events = await this.repo.em.findAll(EventEntity, {
      where: {
        id: { $in: eventIdList },
      },
    });
    if (events.length !== eventIdList.length) {
      throw new Error('Some of events were not found');
    }
    const [mainEvent] = events;

    const playerModel = this.getModel(PlayerModel);
    const player = await playerModel.findById([playerId]);
    if (player.length === 0) {
      throw new Error('Player not found');
    }

    const games = (
      await Promise.all(
        eventIdList.map((eventId) => this._fetchGamesHistory(eventId, playerId, dateFrom, dateTo))
      )
    ).reduce(
      (acc, items) => {
        items.entries().forEach(([key, value]) => {
          acc.set(key, value);
        });
        return acc;
      },
      new Map<
        number,
        {
          session: SessionEntity;
          results: Map<number, SessionResultsEntity>;
        }
      >()
    );

    const gameIds = Array.from(games.keys());

    const [rounds, playerInfo, playerBySession] = await Promise.all([
      this._fetchRounds(gameIds),
      this._fetchPlayerInfo(gameIds),
      playerModel.findPlayerIdsForSessions(gameIds),
    ]);
    const scoresAndPlayers = await this._getScoreHistoryAndPlayers(
      mainEvent.ruleset,
      playerBySession,
      games,
      playerInfo
    );

    const data: PlayersGetPlayerStatsResponse = {
      ratingHistory: this._getRatingHistorySequence(mainEvent.ruleset, playerId, games),
      scoreHistory: scoresAndPlayers.scores.map((s) => ({
        tables: s.map((t) => ({ ...t, sessionHash: t.sessionHash ?? '' })),
      })),
      playersInfo: Array.from(scoresAndPlayers.players.values()).map((p: PersonEx) => ({
        id: p.id,
        title: p.title,
        tenhouId: p.tenhouId,
        hasAvatar: p.hasAvatar,
        lastUpdate: p.lastUpdate,
      })),
      placesSummary: await this._getPlacesSummary(playerId, games),
      totalPlayedGames: games.size,
      totalPlayedRounds: rounds.length,
      winSummary: this._getOutcomeSummary(mainEvent.ruleset, playerId, rounds),
      handsValueSummary: this._getHanSummary(playerId, rounds),
      yakuSummary: this._getYakuSummary(playerId, rounds),
      riichiSummary: this._getRiichiSummary(mainEvent.ruleset, playerId, rounds),
      doraStat: this._getDoraStat(playerId, rounds),
      lastUpdate: moment().tz(mainEvent.timezone).format('YYYY-MM-DD HH:mm:ss'),
    };

    // Save precalculated stats; don't support aggregated events
    if (eventIdList.length === 1 && !dateFrom && !dateTo) {
      const stats = await this.repo.em.findOne(PlayerStatsEntity, {
        playerId,
        event: this.repo.em.getReference(EventEntity, eventIdList[0]),
      });

      const entity = stats ?? new PlayerStatsEntity();
      entity.data = {
        ...data,
        scoreHistoryOrder: gameIds,
        scoreHistory: Object.fromEntries(
          gameIds.map((id, index) => [id, data.scoreHistory[index].tables])
        ),
        placesSummary: Object.fromEntries(
          data.placesSummary.map(({ place, count }) => [place, count])
        ),
        handsValueSummary: Object.fromEntries(
          data.handsValueSummary.map(({ hanCount, count }) => [hanCount, count])
        ),
        yakuSummary: Object.fromEntries(
          data.yakuSummary.map(({ yakuId, count }) => [yakuId, count])
        ),
      };
      entity.event = this.repo.em.getReference(EventEntity, eventIdList[0]);
      entity.playerId = playerId;
      entity.lastUpdate = moment().format('YYYY-MM-DD HH:mm:ss');
      this.repo.em.persist(entity);
    }

    return data;
  }

  async _fetchGamesHistory(
    event: number,
    playerId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<Map<number, { session: SessionEntity; results: Map<number, SessionResultsEntity> }>> {
    const sessionModel = this.getModel(SessionModel);
    const games = await sessionModel.findByPlayerAndEvent(playerId, event, '*', dateFrom, dateTo);
    if (games.length === 0) {
      return new Map();
    }

    const gamesById = new Map<number, SessionEntity>();
    for (const game of games) {
      gamesById.set(game.id, game);
    }

    const results = await this.repo.em.findAll(SessionResultsEntity, {
      where: {
        session: games.map((game) => this.repo.em.getReference(SessionEntity, game.id)),
      },
    });

    const fullResults = new Map<
      number,
      { session: SessionEntity; results: Map<number, SessionResultsEntity> }
    >();
    results.forEach((result) => {
      if (!fullResults.has(result.session.id)) {
        fullResults.set(result.session.id, {
          session: gamesById.get(result.session.id)!,
          results: new Map(),
        });
      }
      fullResults.get(result.session.id)!.results.set(result.playerId, result);
    });
    return fullResults;
  }

  async _fetchRounds(gameIds: number[]) {
    const rounds = await this.repo.em.findAll(RoundEntity, {
      where: {
        session: gameIds.map((id) => this.repo.em.getReference(SessionEntity, id)),
      },
      populate: ['hands'],
    });
    return rounds.map((round) => ({
      ...round,
      hands: (round.hands as unknown as Collection<HandEntity>).getItems(),
    }));
  }

  async _fetchPlayerInfo(gameIds: number[]) {
    const players = await this.repo.em.findAll(SessionPlayerEntity, {
      where: {
        session: gameIds.map((id) => this.repo.em.getReference(SessionEntity, id)),
      },
    });
    const playerIds = players.map((sp) => sp.playerId).filter((id) => id !== GHOST_PLAYER_ID);
    const playerModel = this.getModel(PlayerModel);
    const playerInfo = await playerModel.findById(playerIds);
    return playerInfo.reduce((acc, player) => {
      acc.set(player.id, player);
      return acc;
    }, new Map<number, PersonEx>());
  }

  async _getScoreHistoryAndPlayers(
    ruleset: RulesetEntity,
    playerBySession: Array<[number, number]>,
    games: Map<
      number,
      {
        session: SessionEntity;
        results: Map<number, SessionResultsEntity>;
      }
    >,
    playerInfo: Map<number, PersonEx>
  ) {
    const withChips = ruleset.rules.chipsValue > 0;
    const playersBySessionGrouped = playerBySession.reduce((acc, [playerId, sessionId]) => {
      if (playerId === GHOST_PLAYER_ID) return acc;
      const players = acc.get(sessionId) ?? [];
      players.push(playerId);
      acc.set(sessionId, players);
      return acc;
    }, new Map<number, number[]>());

    const scoreHistory = Array.from(
      games.entries().map(([, game]) => {
        return (playersBySessionGrouped.get(game.session.id) ?? []).map((playerId) => {
          const result = {
            sessionHash: game.session.representationalHash,
            eventId: game.session.event.id,
            title: playerInfo.get(playerId)?.title ?? '',
            hasAvatar: playerInfo.get(playerId)?.hasAvatar ?? false,
            lastUpdate: playerInfo.get(playerId)?.lastUpdate ?? new Date().toString(),
            playerId: playerId,
            score: game.results.get(playerId)?.score ?? ruleset.rules.startRating ?? 0,
            ratingDelta: game.results.get(playerId)?.ratingDelta ?? 0,
            place: game.results.get(playerId)?.place ?? 0,
            chips: 0,
          };
          if (withChips) {
            result.chips = game.results.get(playerId)?.chips ?? 0;
          }
          return result;
        });
      })
    );

    return {
      scores: scoreHistory,
      players: playerInfo,
    };
  }

  _getRatingHistorySequence(
    ruleset: RulesetEntity,
    playerId: number,
    games: Map<number, { session: SessionEntity; results: Map<number, SessionResultsEntity> }>
  ) {
    let rating = ruleset.rules.startRating ?? 0;
    const ratingHistory = Array.from(
      games.values().map((game) => {
        const result = game.results.get(playerId);
        if (result) {
          rating += result.ratingDelta;
        }
        return rating;
      })
    );
    ratingHistory.unshift(ruleset.rules.startRating ?? 0);
    return ratingHistory;
  }

  async _getPlacesSummary(
    playerId: number,
    games: Map<number, { session: SessionEntity; results: Map<number, SessionResultsEntity> }>
  ): Promise<PlacesSummaryItem[]> {
    const summary = games.values().reduce(
      (acc, game) => {
        const result = game.results.get(playerId);
        if (result) {
          const place = result.place;
          acc.set(place, (acc.get(place) ?? 0) + 1);
        }
        return acc;
      },
      new Map<number, number>([1, 2, 3, 4].map((place) => [place, 0]))
    );
    return Array.from(summary, ([place, count]) => ({ place, count })).sort(
      (a, b) => a.place - b.place
    );
  }

  _getOutcomeSummary(
    ruleset: RulesetEntity,
    playerId: number,
    rounds: RoundEntity[]
  ): OutcomeStats {
    return rounds.reduce(
      (acc, round) => {
        if (round.hands.length === 0) {
          if (
            round.outcome === RoundOutcome.ROUND_OUTCOME_DRAW ||
            round.outcome === RoundOutcome.ROUND_OUTCOME_ABORT
          ) {
            acc.draw++;
          }
          return acc;
        }
        const riichiIds = round.riichi ?? [];
        switch (round.outcome) {
          case RoundOutcome.ROUND_OUTCOME_RON: {
            const pointsDelta = this._getPointsDeltaForRound(
              ruleset,
              round.hands[0],
              new SessionState(
                ruleset,
                round.lastSessionState?.playerIds ?? [], // TODO: check if last state is set initially
                round.lastSessionState
              ),
              riichiIds,
              playerId,
              false
            );
            if (round.hands[0].loserId === playerId) {
              acc.feed++;
              acc.pointsLostRon -= pointsDelta;
              if (!riichiIds.includes(playerId)) {
                if (round.hands[0].openHand) {
                  acc.unforcedFeedToOpen++;
                } else {
                  if (riichiIds.includes(round.hands[0].winnerId ?? -1)) {
                    acc.unforcedFeedToRiichi++;
                  } else {
                    acc.unforcedFeedToDama++;
                  }
                }
              }
            } else if (round.hands[0].winnerId === playerId) {
              acc.ron++;
              acc.pointsWon += pointsDelta;
              if (round.hands[0].openHand) {
                acc.winsWithOpen++;
              } else {
                if (riichiIds.includes(playerId)) {
                  acc.winsWithRiichi++;
                } else {
                  acc.winsWithDama++;
                }
              }
            }
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_TSUMO: {
            const pointsDelta = this._getPointsDeltaForRound(
              ruleset,
              round.hands[0],
              new SessionState(
                ruleset,
                round.lastSessionState?.playerIds ?? [], // TODO: check if last state is set initially
                round.lastSessionState
              ),
              riichiIds,
              playerId,
              true
            );
            if (round.hands[0].winnerId === playerId) {
              acc.tsumo++;
              acc.pointsWon += pointsDelta;
              if (round.hands[0].openHand) {
                acc.winsWithOpen++;
              } else {
                if (riichiIds.includes(playerId)) {
                  acc.winsWithRiichi++;
                } else {
                  acc.winsWithDama++;
                }
              }
            } else {
              acc.tsumofeed++;
              acc.pointsLostTsumo -= pointsDelta;
            }
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_ABORT:
          case RoundOutcome.ROUND_OUTCOME_DRAW: {
            acc.draw++;
            if (round.hands[0].tempai?.includes(playerId)) {
              acc.drawTempai++;
            }
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_CHOMBO: {
            if (round.hands.some((hand) => hand.loserId === playerId)) {
              acc.chombo++;
            }
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_MULTIRON: {
            const lastSessionState = round.lastSessionState;
            const multironRiichiWinners = this._getMultironRiichiAssignments(round);

            round.hands.forEach((hand) => {
              const pointsDelta = this._getPointsDeltaForRound(
                ruleset,
                hand,
                new SessionState(
                  ruleset,
                  round.lastSessionState?.playerIds ?? [], // TODO: check if last state is set initially
                  lastSessionState
                ),
                riichiIds,
                playerId,
                false,
                multironRiichiWinners
              );
              if (hand.loserId === playerId) {
                acc.feed++;
                acc.pointsLostRon -= pointsDelta;
                if (!riichiIds.includes(playerId)) {
                  if (hand.openHand) {
                    acc.unforcedFeedToOpen++;
                  } else {
                    if (riichiIds.includes(hand.winnerId ?? -1)) {
                      acc.unforcedFeedToRiichi++;
                    } else {
                      acc.unforcedFeedToDama++;
                    }
                  }
                }
              } else if (hand.winnerId === playerId) {
                acc.ron++;
                acc.pointsWon += pointsDelta;
                if (hand.openHand) {
                  acc.winsWithOpen++;
                } else {
                  if (riichiIds.includes(playerId)) {
                    acc.winsWithRiichi++;
                  } else {
                    acc.winsWithDama++;
                  }
                }
              }
            });
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_NAGASHI: {
            if (round.hands[0].nagashi?.includes(playerId)) {
              acc.nagashi++;
            }
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_UNSPECIFIED:
          default:
            break;
        }
        return acc;
      },
      {
        ron: 0,
        tsumo: 0,
        chombo: 0,
        nagashi: 0,
        feed: 0,
        tsumofeed: 0,
        winsWithOpen: 0,
        winsWithRiichi: 0, // not always equal to riichiWon below, riichiWon is for self sticks
        winsWithDama: 0,
        unforcedFeedToOpen: 0,
        unforcedFeedToRiichi: 0,
        unforcedFeedToDama: 0,
        draw: 0,
        drawTempai: 0,
        pointsWon: 0,
        pointsLostRon: 0,
        pointsLostTsumo: 0,
      }
    );
  }

  _getMultironRiichiAssignments(round: RoundEntity) {
    const state = round.lastSessionState;
    try {
      return new PointsCalc().assignRiichiBets(
        round.hands.map((hand) => hand.winnerId!),
        round.riichi ?? [],
        round.hands[0]?.loserId!,
        state?.riichiBets ?? 0,
        state?.honba ?? 0,
        state?.playerIds ?? []
      );
    } catch (error) {
      throw new Error(
        `Cannot calculate multiron statistics for round ${round.id}, ` +
          `session ${round.session?.id}, event ${round.event?.id}: ${String(error)}`,
        { cause: error }
      );
    }
  }

  _getPointsDeltaForRound(
    ruleset: RulesetEntity,
    hand: HandEntity,
    sessionState: SessionState,
    riichiIds: number[],
    playerId: number,
    isTsumo: boolean,
    multironRiichiWinners?: Record<number, RiichiBetAssignment>
  ) {
    const winnerId = hand.winnerId!;
    let closestWinnerForMultiron: number | null = null;
    let totalRiichiInRoundForMultiron = 0;
    let honba = sessionState.getHonba();
    let riichiBetsCount = sessionState.getRiichiBets();
    if (multironRiichiWinners !== undefined) {
      closestWinnerForMultiron = multironRiichiWinners[winnerId].closestWinner;
      totalRiichiInRoundForMultiron = riichiIds.length;
      riichiIds = multironRiichiWinners[winnerId].fromPlayers; // overwrite for one ron instance of multiron
      honba = multironRiichiWinners[winnerId].honba;
      riichiBetsCount = multironRiichiWinners[winnerId].fromTable;
    }

    if (winnerId !== playerId) {
      // if we deal-in or someone else takes tsumo, don't consider any riichi sticks in the current round
      // since we are interested only in deal-in cost
      riichiIds = [];
      totalRiichiInRoundForMultiron = 0;
    }

    return this._getPointsDelta(
      ruleset,
      sessionState.getScores(),
      hand.han!,
      hand.fu!,
      winnerId,
      hand.loserId!,
      riichiIds,
      playerId,
      sessionState.getCurrentDealer(),
      honba,
      riichiBetsCount,
      isTsumo,
      hand.paoPlayerId,
      closestWinnerForMultiron,
      totalRiichiInRoundForMultiron
    );
  }

  _getPointsDelta(
    ruleset: RulesetEntity,
    scores: Record<number, number>,
    han: number,
    fu: number,
    winnerId: number,
    loserId: number,
    riichiIds: number[],
    playerId: number,
    dealer: number,
    honba: number,
    riichiBetsCount: number,
    isTsumo: boolean,
    paoPlayerId: number | undefined,
    closestWinnerForMultiron: number | null,
    totalRiichiInRoundForMultiron: number
  ): number {
    if (isTsumo) {
      const newScores = new PointsCalc().tsumo(
        ruleset.rules,
        dealer,
        scores,
        winnerId,
        han,
        fu,
        riichiIds,
        honba,
        riichiBetsCount,
        paoPlayerId
      );
      return newScores[playerId] - scores[playerId];
    } else {
      const isDealer = dealer === winnerId;
      const newScores = new PointsCalc().ron(
        ruleset.rules,
        isDealer,
        scores,
        winnerId,
        loserId,
        han,
        fu,
        riichiIds,
        honba,
        riichiBetsCount,
        paoPlayerId,
        closestWinnerForMultiron,
        totalRiichiInRoundForMultiron
      );
      return newScores[playerId] - scores[playerId];
    }
  }

  _getHanSummary(playerId: number, rounds: RoundEntity[]): HandValueStat[] {
    const summary = new Map<number, number>();
    for (const round of rounds) {
      for (const hand of round.hands) {
        if (hand.winnerId === playerId && hand.han) {
          summary.set(hand.han, (summary.get(hand.han) ?? 0) + 1);
        }
      }
    }
    return Array.from(summary.entries())
      .sort(([a], [b]) => a - b)
      .map(([han, count]) => ({
        hanCount: han,
        count,
      }));
  }

  _getYakuSummary(playerId: number, rounds: RoundEntity[]): YakuStat[] {
    const summary = new Map<number, number>();
    for (const round of rounds) {
      for (const hand of round.hands) {
        if (hand.winnerId === playerId && hand.yaku) {
          for (const yaku of hand.yaku) {
            summary.set(yaku, (summary.get(yaku) ?? 0) + 1);
          }
        }
      }
    }
    return Array.from(summary.entries())
      .sort(([a], [b]) => a - b)
      .map(([yaku, count]) => ({
        yakuId: yaku,
        count,
      }));
  }

  _getRiichiSummary(ruleset: RulesetEntity, playerId: number, rounds: RoundEntity[]): RiichiStats {
    return rounds.reduce(
      (acc, round) => {
        round.hands.forEach((hand) => {
          if (
            (
              [RoundOutcome.ROUND_OUTCOME_RON, RoundOutcome.ROUND_OUTCOME_TSUMO] as RoundOutcome[]
            ).includes(round.outcome) &&
            round.riichi?.includes(playerId)
          ) {
            if (hand.winnerId === playerId) {
              acc.riichiWon++;
            } else {
              acc.riichiLost++;
            }
            if (hand.loserId === playerId) {
              acc.feedUnderRiichi++;
            }
          } else if (
            (
              [
                RoundOutcome.ROUND_OUTCOME_DRAW,
                RoundOutcome.ROUND_OUTCOME_ABORT,
                RoundOutcome.ROUND_OUTCOME_NAGASHI,
              ] as RoundOutcome[]
            ).includes(round.outcome) &&
            round.riichi?.includes(playerId)
          ) {
            acc.riichiLost++;
          } else if (round.outcome === RoundOutcome.ROUND_OUTCOME_MULTIRON) {
            const roundRiichi = round.riichi;
            const roundWinners = round.hands.map((h) => h.winnerId!);

            if (roundWinners.includes(playerId) && roundRiichi?.includes(playerId)) {
              const riichiWinners = this._getMultironRiichiAssignments(round);
              const closestWinner = riichiWinners[playerId]?.closestWinner;
              if (ruleset.rules.doubleronRiichiAtamahane && closestWinner) {
                if (closestWinner === playerId) {
                  acc.riichiWon++;
                } else {
                  acc.riichiLost++;
                }
              } else {
                acc.riichiWon++;
              }
            }

            if (!roundWinners.includes(playerId) && roundRiichi?.includes(playerId)) {
              acc.riichiLost++;
            }

            if (round.hands[0].loserId === playerId && roundRiichi?.includes(playerId)) {
              acc.feedUnderRiichi += round.hands.length;
            }
          }
        });
        return acc;
      },
      { riichiWon: 0, riichiLost: 0, feedUnderRiichi: 0 }
    );
  }

  _getDoraStat(playerId: number, rounds: RoundEntity[]) {
    let handsWon = 0;
    const doraCount = rounds.reduce((acc, round) => {
      if (
        round.outcome !== RoundOutcome.ROUND_OUTCOME_RON &&
        round.outcome !== RoundOutcome.ROUND_OUTCOME_MULTIRON &&
        round.outcome !== RoundOutcome.ROUND_OUTCOME_TSUMO
      ) {
        return acc;
      }
      round.hands.forEach((hand) => {
        if (hand.winnerId === playerId) {
          acc += hand.dora ?? 0;
          handsWon++;
        }
      });
      return acc;
    }, 0);
    const average = handsWon > 0 ? +(doraCount / handsWon).toFixed(2) : 0;
    return { count: doraCount, average };
  }
}
