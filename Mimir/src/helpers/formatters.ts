import {
  GameResult,
  PlatformType,
  RoundOutcome,
  Round as RoundResult,
} from 'tsclients/proto/atoms.pb.js';
import { base64decode } from './crypto.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { SessionResultsEntity } from 'src/entities/SessionResults.entity.js';
import { RoundEntity } from 'src/entities/Round.entity.js';
import { SessionStateEntity } from 'src/entities/SessionState.entity.js';

export function formatGameResult(
  session: SessionEntity,
  sessionPlatform: PlatformType,
  playerIds: number[],
  results: SessionResultsEntity[],
  rounds: RoundEntity[]
): GameResult {
  return {
    sessionHash: session.representationalHash!,
    date: session.endDate,
    replayLink: makeReplayLink(session.replayHash!, sessionPlatform),
    players: playerIds,
    finalResults: results.map((result) => ({
      playerId: result.playerId,
      score: result.score,
      ratingDelta: result.ratingDelta,
      place: result.place,
    })),
    rounds: rounds.map((round: RoundEntity) => formatRound(round, session.intermediateResults!)),
  };
}

export function formatRound(round: RoundEntity, sessionState: SessionStateEntity): RoundResult {
  switch (round.outcome) {
    case RoundOutcome.ROUND_OUTCOME_MULTIRON:
      return {
        multiron: {
          roundIndex: round.round,
          honba: sessionState.honba,
          loserId: round.hands[0].loserId!,
          multiRon: round.hands.length,
          riichiBets: round.riichi!,
          wins: round.hands.map((r) => ({
            winnerId: r.winnerId!,
            paoPlayerId: r.paoPlayerId!,
            han: r.han!,
            fu: r.fu!,
            yaku: r.yaku!,
            dora: r.dora ?? 0,
            uradora: r.uradora ?? 0,
            kandora: r.kandora ?? 0,
            kanuradora: r.kanuradora ?? 0,
            openHand: r.openHand!,
          })),
        },
      };
    case RoundOutcome.ROUND_OUTCOME_RON:
      return {
        ron: {
          roundIndex: round.round,
          honba: sessionState.honba,
          winnerId: round.hands[0].winnerId!,
          loserId: round.hands[0].loserId!,
          paoPlayerId: round.hands[0].paoPlayerId!,
          han: round.hands[0].han!,
          fu: round.hands[0].fu!,
          yaku: round.hands[0].yaku!,
          riichiBets: round.riichi!,
          dora: round.hands[0].dora ?? 0,
          uradora: round.hands[0].uradora ?? 0,
          kandora: round.hands[0].kandora ?? 0,
          kanuradora: round.hands[0].kanuradora ?? 0,
          openHand: round.hands[0].openHand!,
        },
      };
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return {
        tsumo: {
          roundIndex: round.round,
          honba: sessionState.honba,
          winnerId: round.hands[0].winnerId!,
          paoPlayerId: round.hands[0].paoPlayerId!,
          han: round.hands[0].han!,
          fu: round.hands[0].fu!,
          yaku: round.hands[0].yaku!,
          riichiBets: round.riichi!,
          dora: round.hands[0].dora ?? 0,
          uradora: round.hands[0].uradora ?? 0,
          kandora: round.hands[0].kandora ?? 0,
          kanuradora: round.hands[0].kanuradora ?? 0,
          openHand: round.hands[0].openHand!,
        },
      };
    case RoundOutcome.ROUND_OUTCOME_DRAW:
      return {
        draw: {
          roundIndex: round.round,
          honba: sessionState.honba,
          riichiBets: round.riichi!,
          tempai: round.hands[0].tempai!,
        },
      };
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      return {
        abort: {
          roundIndex: round.round,
          honba: sessionState.honba,
          riichiBets: round.riichi!,
        },
      };
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      return {
        chombo: {
          roundIndex: round.round,
          honba: sessionState.honba,
          loserId: round.hands[0].loserId!,
        },
      };
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return {
        nagashi: {
          roundIndex: round.round,
          honba: sessionState.honba,
          riichiBets: round.riichi!,
          tempai: round.hands[0].tempai!,
          nagashi: round.hands[0].nagashi!,
        },
      };
    case RoundOutcome.ROUND_OUTCOME_UNSPECIFIED:
    default:
      throw new Error('Wrong outcome detected');
  }
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
