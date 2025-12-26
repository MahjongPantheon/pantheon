import { JobsQueueEntity } from 'src/entities/JobsQueue.entity.js';
import { Model } from './Model.js';
import moment from 'moment';
import { PlayerStatsEntity } from 'src/entities/PlayerStats.entity.js';
import {
  PlayersGetPlayerStatsPayload,
  PlayersGetPlayerStatsResponse,
} from 'tsclients/proto/mimir.pb.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { PlayerModel } from './PlayerModel.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { SessionResultsEntity } from 'src/entities/SessionResults.entity.js';
import { SessionModel } from './SessionModel.js';
import { RoundEntity } from 'src/entities/Round.entity.js';
import { SessionPlayerEntity } from 'src/entities/SessionPlayer.entity.js';
import { PersonEx, RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { PointsCalc, RiichiBetAssignment } from 'src/helpers/PointsCalc.js';
import { HandEntity } from 'src/entities/Hand.entity.js';
import { SessionState } from 'src/aggregates/SessionState.js';

type OutcomeStats = {
  ron: number;
  tsumo: number;
  nagashi: number;
  chombo: number;
  feed: number;
  tsumofeed: number;
  wins_with_open: number;
  wins_with_riichi: number;
  wins_with_dama: number;
  unforced_feed_to_open: number;
  unforced_feed_to_riichi: number;
  unforced_feed_to_dama: number;
  draw: number;
  draw_tempai: number;
  points_won: number;
  points_lost_ron: number;
  points_lost_tsumo: number;
};

type RiichiStats = {
  riichi_won: number;
  riichi_lost: number;
  feed_under_riichi: number;
};

export class PlayerStatsModel extends Model {
  async scheduleRebuildPlayersStats(eventId: number) {
    await this.repo.db.em.execute(`
      insert into jobs_queue (created_at, job_name, job_arguments)
      select now(), 'playerStats', '{"playerId":' || player_id || ',"eventId":' || event_id || '}'
      from event_registered_players where event_id = ${eventId}
    `);
  }

  async scheduleRebuildSinglePlayerStats(playerId: number) {
    const job = new JobsQueueEntity();
    job.createdAt = moment.utc().format('YYYY-MM-DD hh:mm:ss');
    job.jobName = 'playerStats';
    job.jobArguments = JSON.stringify({ playerId });
    await this.repo.db.em.persistAndFlush(job);
  }

  async invalidateByPlayer(playerId: number) {
    const statsCnt = await this.repo.db.em.count(PlayerStatsEntity, { playerId });
    if (statsCnt > 0) {
      await this.scheduleRebuildSinglePlayerStats(playerId);
    }
  }

  async getPlayerStats(
    input: PlayersGetPlayerStatsPayload
  ): Promise<PlayersGetPlayerStatsResponse> {
    if (input.eventIdList.length === 0) {
      throw new Error('Event ID list cannot be empty');
    }

    // Find precalculated stats if any
    if (input.eventIdList.length === 1 && !input.dateFrom && !input.dateTo) {
      const stats = await this.repo.db.em.findAll(PlayerStatsEntity, {
        where: {
          event: input.eventIdList[0],
          playerId: input.playerId,
        },
      });
      if (stats.length > 0) {
        return {
          ratingHistory: stats[0].data.rating_history ?? [],
          scoreHistory: Object.entries(stats[0].data.score_history ?? {}).map(
            ([_sessionId, data]) => ({
              tables: data.map((item) => ({
                sessionHash: item.session_hash,
                eventId: item.event_id,
                playerId: item.player_id,
                score: item.score,
                ratingDelta: item.rating_delta,
                place: item.place,
                title: item.title,
                hasAvatar: item.has_avatar,
                lastUpdate: item.last_update,
              })),
            })
          ),
          playersInfo: stats[0].data.players_info!,
          placesSummary: Object.entries(stats[0].data.places_summary ?? {}).map(
            ([place, count]) => ({
              place,
              count,
            })
          ),
          totalPlayedGames: stats[0].data.total_played_games ?? 0,
          totalPlayedRounds: stats[0].data.total_played_rounds ?? 0,
          winSummary: stats[0].data.win_summary,
          handsValueSummary: Object.entries(stats[0].data.hands_value_summary ?? {}).map(
            ([handValue, count]) => ({
              handValue,
              count,
            })
          ),
          yakuSummary: Object.entries(stats[0].data.yaku_summary ?? {}).map(([yaku, count]) => ({
            yaku,
            count,
          })),
          riichiSummary: stats[0].data.riichi_summary,
          doraStat: stats[0].data.dora_stat,
          lastUpdate: stats[0].data.last_update ?? new Date().toISOString(),
        };
      }
    }

    return this._calculateStat(
      input.eventIdList,
      input.playerId,
      input.dateFrom ?? undefined,
      input.dateTo ?? undefined
    );
  }

  async _calculateStat(
    eventIdList: number[],
    playerId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<PlayersGetPlayerStatsResponse> {
    const events = await this.repo.db.em.findAll(EventEntity, { where: { id: eventIdList } });
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

    const rounds = await this._fetchRounds(gameIds);
    const playerInfo = await this._fetchPlayerInfo(gameIds);
    const playerBySession = await playerModel.findPlayerIdsForSessions(gameIds);
    const scoresAndPlayers = await this._getScoreHistoryAndPlayers(
      mainEvent.ruleset,
      playerBySession,
      games,
      playerInfo
    );

    const data = {
      rating_history: this._getRatingHistorySequence(mainEvent.ruleset, playerId, games),
      score_history: scoresAndPlayers.scores,
      players_info: scoresAndPlayers.players,
      places_summary: await this._getPlacesSummary(playerId, games),
      total_played_games: games.size,
      total_played_rounds: rounds.length,
      win_summary: this._getOutcomeSummary(mainEvent.ruleset, playerId, rounds),
      hands_value_summary: this._getHanSummary(playerId, rounds),
      yaku_summary: this._getYakuSummary(playerId, rounds),
      riichi_summary: this._getRiichiSummary(mainEvent.ruleset, playerId, rounds),
      dora_stat: this._getDoraStat(playerId, rounds),
      last_update: moment().tz(mainEvent.timezone).format('YYYY-MM-DD HH:mm:ss'),
    };

    // Save precalculated stats; don't support aggregated events
    if (eventIdList.length === 1 && !dateFrom && !dateTo) {
      const stats = await this.repo.db.em.findOne(PlayerStatsEntity, {
        playerId,
        event: this.repo.db.em.getReference(EventEntity, eventIdList[0]),
      });

      if (!stats) {
        const entity = new PlayerStatsEntity();
        entity.data = {
          ...data,
          score_history: {},
          players_info: [],
          places_summary: {},
          hands_value_summary: {},
          yaku_summary: {},
        };
        entity.event = this.repo.db.em.getReference(EventEntity, eventIdList[0]);
        entity.playerId = playerId;
        entity.lastUpdate = moment().format('YYYY-MM-DD HH:mm:ss');
        this.repo.db.em.persist(PlayerStatsEntity);
      } else {
        stats.data = {
          ...data,
          score_history: {},
          players_info: [],
          places_summary: {},
          hands_value_summary: {},
          yaku_summary: {},
        };
        stats.event = this.repo.db.em.getReference(EventEntity, eventIdList[0]);
        stats.playerId = playerId;
        stats.lastUpdate = moment().format('YYYY-MM-DD HH:mm:ss');
        this.repo.db.em.persist(stats);
      }

      await this.repo.db.em.flush();
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
    const games = await sessionModel.findByPlayerAndEvent(event, playerId, '*', dateFrom, dateTo);
    if (games.length === 0) {
      return new Map();
    }

    const gamesById = new Map<number, SessionEntity>();
    for (const game of games) {
      gamesById.set(game.id, game);
    }

    const results = await this.repo.db.em.findAll(SessionResultsEntity, {
      where: { session: games.map((game) => this.repo.db.em.getReference(SessionEntity, game.id)) },
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
    const rounds = await this.repo.db.em.findAll(RoundEntity, {
      where: { session: gameIds.map((id) => this.repo.db.em.getReference(SessionEntity, id)) },
      populate: ['hands'],
    });
    return rounds;
  }

  async _fetchPlayerInfo(gameIds: number[]) {
    const players = await this.repo.db.em.findAll(SessionPlayerEntity, {
      where: { session: gameIds.map((id) => this.repo.db.em.getReference(SessionEntity, id)) },
    });
    const playerIds = players.map((sp) => sp.playerId);
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
    const playersBySessionGrouped = playerBySession.reduce((acc, [sessionId, playerId]) => {
      const players = acc.get(sessionId) ?? [];
      players.push(playerId);
      acc.set(sessionId, players);
      return acc;
    }, new Map<number, number[]>());

    const scoreHistory = Array.from(
      games.entries().map(([, game]) => {
        return (playersBySessionGrouped.get(game.session.id) ?? []).map((playerId) => {
          const result = {
            session_hash: game.session.representationalHash,
            event_id: game.session.event.id,
            title: playerInfo.get(playerId)?.title ?? '',
            has_avatar: playerInfo.get(playerId)?.hasAvatar ?? false,
            last_update: playerInfo.get(playerId)?.lastUpdate ?? new Date(),
            player_id: playerId,
            score: game.results.get(playerId)?.score ?? ruleset.rules.startRating,
            rating_delta: game.results.get(playerId)?.ratingDelta ?? 0,
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
      players: await this._fetchPlayerInfo(Array.from(games.keys())),
    };
  }

  _getRatingHistorySequence(
    ruleset: RulesetEntity,
    playerId: number,
    games: Map<number, { session: SessionEntity; results: Map<number, SessionResultsEntity> }>
  ) {
    let rating = ruleset.rules.startRating;
    const ratingHistory = Array.from(
      games.values().map((game) => {
        const result = game.results.get(playerId);
        if (result) {
          rating += result.ratingDelta;
        }
        return rating;
      })
    );
    ratingHistory.unshift(ruleset.rules.startRating);
    return ratingHistory;
  }

  async _getPlacesSummary(
    playerId: number,
    games: Map<number, { session: SessionEntity; results: Map<number, SessionResultsEntity> }>
  ) {
    return games.values().reduce((acc, game) => {
      const result = game.results.get(playerId);
      if (result) {
        acc.set(result.place, (acc.get(result.place) ?? 0) + 1);
      }
      return acc;
    }, new Map<number, number>());
  }

  _getOutcomeSummary(
    ruleset: RulesetEntity,
    playerId: number,
    rounds: RoundEntity[]
  ): OutcomeStats {
    return rounds.reduce(
      (acc, round) => {
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
              acc.points_lost_ron -= pointsDelta;
              if (!riichiIds.includes(playerId)) {
                if (round.hands[0].openHand) {
                  acc.unforced_feed_to_open++;
                } else {
                  if (riichiIds.includes(round.hands[0].winnerId ?? -1)) {
                    acc.unforced_feed_to_riichi++;
                  } else {
                    acc.unforced_feed_to_dama++;
                  }
                }
              }
            } else if (round.hands[0].winnerId === playerId) {
              acc.ron++;
              acc.points_won += pointsDelta;
              if (round.hands[0].openHand) {
                acc.wins_with_open++;
              } else {
                if (riichiIds.includes(playerId)) {
                  acc.wins_with_riichi++;
                } else {
                  acc.wins_with_dama++;
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
              acc.points_won += pointsDelta;
              if (round.hands[0].openHand) {
                acc.wins_with_open++;
              } else {
                if (riichiIds.includes(playerId)) {
                  acc.wins_with_riichi++;
                } else {
                  acc.wins_with_dama++;
                }
              }
            } else {
              acc.tsumofeed++;
              acc.points_lost_tsumo -= pointsDelta;
            }
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_ABORT:
          case RoundOutcome.ROUND_OUTCOME_DRAW: {
            acc.draw++;
            if (round.hands[0].tempai?.includes(playerId)) {
              acc.draw_tempai++;
            }
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_CHOMBO: {
            if (round.hands[0].loserId === playerId) {
              acc.chombo++;
            }
            break;
          }
          case RoundOutcome.ROUND_OUTCOME_MULTIRON: {
            const lastSessionState = round.lastSessionState;
            const multironRiichiWinners = new PointsCalc().assignRiichiBets(
              round.hands.map((hand) => hand.winnerId!),
              round.riichi ?? [],
              round.hands[0].loserId!,
              lastSessionState?.riichiBets ?? 0,
              lastSessionState?.honba ?? 0,
              lastSessionState?.playerIds ?? [] // TODO: check if last state is set initially
            );

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
                acc.points_lost_ron -= pointsDelta;
                if (!riichiIds.includes(playerId)) {
                  if (hand.openHand) {
                    acc.unforced_feed_to_open++;
                  } else {
                    if (riichiIds.includes(hand.winnerId ?? -1)) {
                      acc.unforced_feed_to_riichi++;
                    } else {
                      acc.unforced_feed_to_dama++;
                    }
                  }
                }
              } else if (hand.winnerId === playerId) {
                acc.ron++;
                acc.points_won += pointsDelta;
                if (hand.openHand) {
                  acc.wins_with_open++;
                } else {
                  if (riichiIds.includes(playerId)) {
                    acc.wins_with_riichi++;
                  } else {
                    acc.wins_with_dama++;
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
        wins_with_open: 0,
        wins_with_riichi: 0, // not always equal to riichi_won below, riichi_won is for self sticks
        wins_with_dama: 0,
        unforced_feed_to_open: 0,
        unforced_feed_to_riichi: 0,
        unforced_feed_to_dama: 0,
        draw: 0,
        draw_tempai: 0,
        points_won: 0,
        points_lost_ron: 0,
        points_lost_tsumo: 0,
      }
    );
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
      closestWinnerForMultiron = multironRiichiWinners[winnerId].closest_winner;
      totalRiichiInRoundForMultiron = riichiIds.length;
      riichiIds = multironRiichiWinners[winnerId].from_players; // overwrite for one ron instance of multiron
      honba = multironRiichiWinners[winnerId].honba;
      riichiBetsCount = multironRiichiWinners[winnerId].from_table;
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
      const isDealer = dealer === playerId;
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

  _getHanSummary(playerId: number, rounds: RoundEntity[]) {
    return rounds.reduce((acc, round) => {
      round.hands.forEach((hand) => {
        if (hand.winnerId === playerId) {
          acc += hand.han ?? 0;
        }
      });
      return acc;
    }, 0);
  }

  _getYakuSummary(playerId: number, rounds: RoundEntity[]) {
    return rounds.reduce((acc, round) => {
      round.hands.forEach((hand) => {
        if (hand.winnerId === playerId) {
          (hand.yaku ?? []).forEach((yaku) => {
            acc.set(yaku, (acc.get(yaku) ?? 0) + 1);
          });
        }
      });
      return acc;
    }, new Map<number, number>());
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
              acc.riichi_won++;
            } else {
              acc.riichi_lost++;
            }
            if (hand.loserId === playerId) {
              acc.feed_under_riichi++;
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
            acc.riichi_lost++;
          } else if (round.outcome === RoundOutcome.ROUND_OUTCOME_MULTIRON) {
            const roundRiichi = round.riichi;
            const roundWinners = round.hands.map((h) => h.winnerId!);

            if (roundWinners.includes(playerId) && roundRiichi?.includes(playerId)) {
              const lastSessionState = round.lastSessionState;
              const riichiWinners = new PointsCalc().assignRiichiBets(
                roundWinners,
                roundRiichi,
                round.hands[0].loserId!,
                lastSessionState?.riichiBets ?? 0,
                lastSessionState?.honba ?? 0,
                lastSessionState?.playerIds ?? [] // TODO: check if last state is set initially
              );
              const closestWinner = riichiWinners[playerId]?.closest_winner;
              if (ruleset.rules.doubleronRiichiAtamahane && closestWinner) {
                if (closestWinner === playerId) {
                  acc.riichi_won++;
                } else {
                  acc.riichi_lost++;
                }
              } else {
                acc.riichi_won++;
              }
            }

            if (!roundWinners.includes(playerId) && roundRiichi?.includes(playerId)) {
              acc.riichi_lost++;
            }

            if (round.hands[0].loserId === playerId && roundRiichi?.includes(playerId)) {
              acc.feed_under_riichi += round.hands.length;
            }
          }
        });
        return acc;
      },
      { riichi_won: 0, riichi_lost: 0, feed_under_riichi: 0 }
    );
  }

  _getDoraStat(playerId: number, rounds: RoundEntity[]) {
    const doraCount = rounds.reduce((acc, round) => {
      round.hands.forEach((hand) => {
        if (hand.winnerId === playerId) {
          acc +=
            (hand.dora ?? 0) + (hand.uradora ?? 0) + (hand.kandora ?? 0) + (hand.kanuradora ?? 0);
        }
      });
      return acc;
    }, 0);
    const average = doraCount > 0 ? doraCount / rounds.length : 0;
    return { count: doraCount, average };
  }
}
