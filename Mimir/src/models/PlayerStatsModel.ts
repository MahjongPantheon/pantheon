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
import { RoundEntity } from '../entities/Round.entity.js';
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

const roundBatchSize = 256;
const sessionBatchSize = 128;

type StatsSession = Pick<SessionEntity, 'id' | 'event' | 'representationalHash'>;
type StatsResult = Pick<
  SessionResultsEntity,
  'id' | 'session' | 'playerId' | 'score' | 'ratingDelta' | 'place' | 'chips'
>;
type StatsRound = Pick<
  RoundEntity,
  'id' | 'session' | 'event' | 'outcome' | 'riichi' | 'lastSessionState' | 'hands'
>;

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
            disableIdentityMap: true,
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
                roninId: i.roninId ?? '',
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
          session: StatsSession;
          results: Map<number, StatsResult>;
        }
      >()
    );

    const gameIds = Array.from(games.keys());

    const playerBySession = await playerModel.findPlayerIdsForSessions(gameIds, {
      disableIdentityMap: true,
    });
    const [roundSummaries, playerInfo] = await Promise.all([
      this._getRoundSummaries(mainEvent.ruleset, playerId, gameIds),
      this._fetchPlayerInfo(gameIds, playerBySession),
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
        roninId: p.roninId,
        hasAvatar: p.hasAvatar,
        lastUpdate: p.lastUpdate,
      })),
      placesSummary: await this._getPlacesSummary(playerId, games),
      totalPlayedGames: games.size,
      ...roundSummaries,
      lastUpdate: moment().tz(mainEvent.timezone).format('YYYY-MM-DD HH:mm:ss'),
    };

    // Save precalculated stats; don't support aggregated events
    if (eventIdList.length === 1 && !dateFrom && !dateTo) {
      const stats = await this.repo.em.findOne(
        PlayerStatsEntity,
        { playerId, event: eventIdList[0] },
        { fields: ['id'], disableIdentityMap: true }
      );

      const entity = new PlayerStatsEntity();
      if (stats) entity.id = stats.id;
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
      // Write within the caller's transaction without retaining every rebuilt JSON
      // history in a cron batch's unit of work until its final commit.
      await this.repo.em.upsert(entity, undefined, { disableIdentityMap: true });
    }

    return data;
  }

  async _fetchGamesHistory(
    event: number,
    playerId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<Map<number, { session: StatsSession; results: Map<number, StatsResult> }>> {
    const games = await this.repo.em.findAll(SessionEntity, {
      where: {
        players: { playerId },
        event,
        ...(dateFrom
          ? { startDate: { $gte: moment(dateFrom).utc().format('YYYY-MM-DD HH:mm:ss') } }
          : {}),
        ...(dateTo ? { endDate: { $lt: moment(dateTo).utc().format('YYYY-MM-DD HH:mm:ss') } } : {}),
      },
      fields: ['id', 'event', 'representationalHash'],
      disableIdentityMap: true,
    });
    if (games.length === 0) {
      return new Map();
    }

    const gamesById = new Map<number, StatsSession>();
    for (const game of games) {
      gamesById.set(game.id, game);
    }

    const results = await this.repo.em.findAll(SessionResultsEntity, {
      where: {
        session: { $in: games.map((game) => game.id) },
      },
      fields: ['session', 'playerId', 'score', 'ratingDelta', 'place', 'chips'],
      disableIdentityMap: true,
    });

    const fullResults = new Map<
      number,
      { session: StatsSession; results: Map<number, StatsResult> }
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

  async _fetchRounds(gameIds: number[], afterId = 0) {
    const rounds = await this.repo.em.findAll(RoundEntity, {
      where: { session: { $in: gameIds }, id: { $gt: afterId } },
      populate: ['hands'],
      fields: ['id', 'session', 'event', 'outcome', 'riichi', 'lastSessionState', 'hands.*'],
      orderBy: { id: 'asc', hands: { id: 'asc' } },
      limit: roundBatchSize,
      disableIdentityMap: true,
    });
    return rounds.map((round) => ({
      ...round,
      hands: (round.hands as unknown as Collection<HandEntity>).getItems(),
    }));
  }

  async _getRoundSummaries(ruleset: RulesetEntity, playerId: number, gameIds: number[]) {
    const winSummary = this._getOutcomeSummary(ruleset, playerId, []);
    const riichiSummary = this._getRiichiSummary(ruleset, playerId, []);
    const handsValueSummary = new Map<number, number>();
    const yakuSummary = new Map<number, number>();
    let totalPlayedRounds = 0;
    let doraCount = 0;
    let handsWon = 0;
    // Release each detached page after folding it into fixed-size summaries.
    // The full per-game histories remain in the response, but round snapshots do not.
    for (let offset = 0; offset < gameIds.length; offset += sessionBatchSize) {
      const ids = gameIds.slice(offset, offset + sessionBatchSize);
      let afterId = 0;
      while (true) {
        const rounds = await this._fetchRounds(ids, afterId);
        totalPlayedRounds += rounds.length;
        const outcomes = this._getOutcomeSummary(ruleset, playerId, rounds);
        for (const key of Object.keys(winSummary) as (keyof OutcomeStats)[]) {
          winSummary[key] += outcomes[key];
        }
        const riichi = this._getRiichiSummary(ruleset, playerId, rounds);
        for (const key of Object.keys(riichiSummary) as (keyof RiichiStats)[]) {
          riichiSummary[key] += riichi[key];
        }
        for (const { hanCount, count } of this._getHanSummary(playerId, rounds)) {
          handsValueSummary.set(hanCount, (handsValueSummary.get(hanCount) ?? 0) + count);
        }
        for (const { yakuId, count } of this._getYakuSummary(playerId, rounds)) {
          yakuSummary.set(yakuId, (yakuSummary.get(yakuId) ?? 0) + count);
        }
        const dora = this._getDoraTotals(playerId, rounds);
        doraCount += dora.count;
        handsWon += dora.handsWon;
        if (rounds.length < roundBatchSize) break;
        afterId = rounds[rounds.length - 1].id;
      }
    }
    return {
      totalPlayedRounds,
      winSummary,
      riichiSummary,
      handsValueSummary: Array.from(handsValueSummary, ([hanCount, count]) => ({
        hanCount,
        count,
      })).sort((a, b) => a.hanCount - b.hanCount),
      yakuSummary: Array.from(yakuSummary, ([yakuId, count]) => ({ yakuId, count })).sort(
        (a, b) => a.yakuId - b.yakuId
      ),
      doraStat: {
        count: doraCount,
        average: handsWon > 0 ? +(doraCount / handsWon).toFixed(2) : 0,
      },
    };
  }

  async _fetchPlayerInfo(gameIds: number[], playerBySession?: Array<[number, number]>) {
    const playerModel = this.getModel(PlayerModel);
    const seating =
      playerBySession ??
      (await playerModel.findPlayerIdsForSessions(gameIds, {
        disableIdentityMap: true,
      }));
    const playerIds = [
      ...new Set(seating.map(([id]) => id).filter((id) => id !== GHOST_PLAYER_ID)),
    ];
    const playerInfo = await playerModel.findById(playerIds);
    return new Map(playerInfo.map((player) => [player.id, player]));
  }

  async _getScoreHistoryAndPlayers(
    ruleset: RulesetEntity,
    playerBySession: Array<[number, number]>,
    games: Map<
      number,
      {
        session: StatsSession;
        results: Map<number, StatsResult>;
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
    games: Map<number, { session: StatsSession; results: Map<number, StatsResult> }>
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
    games: Map<number, { session: StatsSession; results: Map<number, StatsResult> }>
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

  _getOutcomeSummary(ruleset: RulesetEntity, playerId: number, rounds: StatsRound[]): OutcomeStats {
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

  _getMultironRiichiAssignments(round: StatsRound) {
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

  _getHanSummary(playerId: number, rounds: StatsRound[]): HandValueStat[] {
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

  _getYakuSummary(playerId: number, rounds: StatsRound[]): YakuStat[] {
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

  _getRiichiSummary(ruleset: RulesetEntity, playerId: number, rounds: StatsRound[]): RiichiStats {
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

  _getDoraTotals(playerId: number, rounds: StatsRound[]) {
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
    return { count: doraCount, handsWon };
  }

  _getDoraStat(playerId: number, rounds: StatsRound[]) {
    const { count, handsWon } = this._getDoraTotals(playerId, rounds);
    return { count, average: handsWon > 0 ? +(count / handsWon).toFixed(2) : 0 };
  }
}
