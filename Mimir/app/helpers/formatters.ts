import { Penalty, Round, SessionResults } from 'database/schema';
import { SessionItem } from '../models/session';
import { GameResult, PersonEx, PlatformType, Round as RoundResult } from 'tsclients/proto/atoms.pb';
import { SessionState } from './SessionState';
import { base64decode } from './crypto';

type GroupedRounds = Array<Array<Omit<Round, 'id'> & { id: number }>>;

export function formatGameResult(
  session: SessionItem,
  sessionState: SessionState,
  sessionPlatform: PlatformType,
  playerIds: number[],
  results: Array<Omit<SessionResults, 'id'> & { id: number }>,
  penalties: Array<Omit<Penalty, 'id'> & { id: number }>,
  rounds: Array<Omit<Round, 'id'> & { id: number }>,
  replacements: Map<number, PersonEx>
): GameResult {
  return {
    sessionHash: session.representational_hash!,
    date: session.end_date,
    replayLink: makeReplayLink(session.replay_hash, sessionPlatform),
    players: playerIds.map((id) => (replacements.has(id) ? replacements.get(id)!.id : id)),
    finalResults: results.map((result) => ({
      playerId: result.player_id,
      score: result.score,
      ratingDelta: result.rating_delta,
      place: result.place,
    })),
    rounds: groupByMultiron(rounds).map((round) => formatRound(round, sessionState, replacements)),
  };
}

export function groupByMultiron(rounds: Array<Omit<Round, 'id'> & { id: number }>): GroupedRounds {
  const result: GroupedRounds = [];
  let group = [];
  for (const round of rounds) {
    if (round.multi_ron && round.multi_ron > 1) {
      group.push(round);
    } else {
      if (group.length > 0) {
        result.push(group);
        group = [];
      }
      result.push([round]);
    }
  }
  if (group.length > 0) {
    result.push(group);
  }
  return result;
}

export function formatRound(
  round: Array<Omit<Round, 'id'> & { id: number }>,
  sessionState: SessionState,
  replacements: Map<number, PersonEx>
): RoundResult {
  if (round.length > 1) {
    return {
      multiron: {
        roundIndex: round[0].round,
        honba: sessionState.getHonba(),
        loserId: replaceOne(round[0].loser_id!, replacements),
        multiRon: round[0].multi_ron!,
        riichiBets: round
          .map((r) => replaceMany(r.riichi!.split(',').map(Number), replacements))
          .flat(),
        wins: round.map((r) => ({
          winnerId: replaceOne(r.winner_id!, replacements),
          paoPlayerId: replaceOne(r.pao_player_id!, replacements),
          han: r.han!,
          fu: r.fu!,
          yaku: r.yaku!.split(',').map(Number),
          dora: r.dora ?? 0,
          uradora: r.uradora ?? 0,
          kandora: r.kandora ?? 0,
          kanuradora: r.kanuradora ?? 0,
          openHand: r.open_hand === 1,
        })),
      },
    };
  }
  const singleRound = round[0];
  switch (singleRound.outcome) {
    case 'ron':
      return {
        ron: {
          roundIndex: singleRound.round,
          honba: sessionState.getHonba(),
          winnerId: replaceOne(singleRound.winner_id!, replacements),
          loserId: replaceOne(singleRound.loser_id!, replacements),
          paoPlayerId: replaceOne(singleRound.pao_player_id!, replacements),
          han: singleRound.han!,
          fu: singleRound.fu!,
          yaku: singleRound.yaku!.split(',').map(Number),
          riichiBets: replaceMany(singleRound.riichi!.split(',').map(Number), replacements),
          dora: singleRound.dora ?? 0,
          uradora: singleRound.uradora ?? 0,
          kandora: singleRound.kandora ?? 0,
          kanuradora: singleRound.kanuradora ?? 0,
          openHand: singleRound.open_hand === 1,
        },
      };
    case 'tsumo':
      return {
        tsumo: {
          roundIndex: singleRound.round,
          honba: sessionState.getHonba(),
          winnerId: replaceOne(singleRound.winner_id!, replacements),
          paoPlayerId: replaceOne(singleRound.pao_player_id!, replacements),
          han: singleRound.han!,
          fu: singleRound.fu!,
          yaku: singleRound.yaku!.split(',').map(Number),
          riichiBets: replaceMany(singleRound.riichi!.split(',').map(Number), replacements),
          dora: singleRound.dora ?? 0,
          uradora: singleRound.uradora ?? 0,
          kandora: singleRound.kandora ?? 0,
          kanuradora: singleRound.kanuradora ?? 0,
          openHand: singleRound.open_hand === 1,
        },
      };
    case 'draw':
      return {
        draw: {
          roundIndex: singleRound.round,
          honba: sessionState.getHonba(),
          riichiBets: replaceMany(singleRound.riichi!.split(',').map(Number), replacements),
          tempai: replaceMany(singleRound.tempai!.split(',').map(Number), replacements),
        },
      };
    case 'abort':
      return {
        abort: {
          roundIndex: singleRound.round,
          honba: sessionState.getHonba(),
          riichiBets: replaceMany(singleRound.riichi!.split(',').map(Number), replacements),
        },
      };
    case 'chombo':
      return {
        chombo: {
          roundIndex: singleRound.round,
          honba: sessionState.getHonba(),
          loserId: singleRound.loser_id!,
        },
      };
    case 'nagashi':
      return {
        nagashi: {
          roundIndex: singleRound.round,
          honba: sessionState.getHonba(),
          riichiBets: replaceMany(singleRound.riichi!.split(',').map(Number), replacements),
          tempai: replaceMany(singleRound.tempai!.split(',').map(Number), replacements),
          nagashi: replaceMany(singleRound.nagashi!.split(',').map(Number), replacements),
        },
      };
    default:
      throw new Error('Wrong outcome detected');
  }
}

export function replaceMany(ids: number[], replacements: Map<number, PersonEx>) {
  return ids.map((id) => replaceOne(id, replacements));
}

export function replaceOne(id: number, replacements: Map<number, PersonEx>) {
  return replacements.has(id) ? replacements.get(id)!.id : id;
}

export function makeReplayLink(hash: string | null, platform: PlatformType) {
  if (!hash) {
    return '';
  }

  if (platform === PlatformType.PLATFORM_TYPE_MAHJONGSOUL) {
    return base64decode('aHR0cDovL3RlbmhvdS5uZXQv') + '0/?log=' + hash;
  }

  if (platform === PlatformType.PLATFORM_TYPE_TENHOUNET) {
    return base64decode('aHR0cHM6Ly9tYWhqb25nc291bC5nYW1lLnlvLXN0YXIuY29t') + '/?paipu=' + hash;
  }

  return '';
}
