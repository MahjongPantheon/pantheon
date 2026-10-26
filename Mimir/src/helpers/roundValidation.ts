import { HandEntity } from '../entities/Hand.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import {
  AbortResult,
  ChomboResult,
  DrawResult,
  MultironResult,
  NagashiResult,
  RonResult,
  Round,
  RoundOutcome,
  TsumoResult,
} from 'tsclients/proto/atoms.pb.js';

// Validate only newly submitted outcomes; imported historical rounds retain their original accounting.
export function checkRiichiPoints(
  ruleset: RulesetEntity,
  scores: Record<number, number>,
  round: RoundEntity
): void {
  if (ruleset.rules.withTobi) {
    for (const playerId of round.riichi ?? []) {
      if (scores[playerId] < 1000) {
        throw new Error(
          `Player #${playerId} needs at least 1000 points to declare riichi with tobi`
        );
      }
    }
  }
}

export function checkRound(
  players: number[],
  allRegisteredPlayersIds: number[],
  ruleset: RulesetEntity,
  roundData: Round
): void {
  _checkPlayers(players, allRegisteredPlayersIds);
  const yakuList = ruleset.rules.allowedYaku;
  if (roundData.ron) {
    _checkRon(players, yakuList, roundData.ron);
  } else if (roundData.multiron) {
    _checkMultiRon(players, yakuList, roundData.multiron);
  } else if (roundData.tsumo) {
    _checkTsumo(players, yakuList, roundData.tsumo);
  } else if (roundData.draw) {
    _checkDraw(players, roundData.draw);
  } else if (roundData.abort) {
    _checkAbortiveDraw(players, roundData.abort);
  } else if (roundData.chombo) {
    _checkChombo(players, roundData.chombo);
  } else if (roundData.nagashi) {
    _checkNagashi(players, roundData.nagashi);
  } else {
    throw new Error('Unrecognized outcome');
  }
}

export function _checkRon(players: number[], yakuList: number[], roundData: RonResult): void {
  _checkNumericArray(roundData, 'riichi', players);
  _checkOneOf(roundData, 'winnerId', players);
  _checkOneOf(roundData, 'loserId', players);
  if (roundData.paoPlayerId !== 0) {
    _checkOneOf(roundData, 'paoPlayerId', players);
  }
  _checkHan(roundData);
  // 0 for 5+ han
  _checkOneOf(roundData, 'fu', [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 0]);

  if (!roundData.yaku) {
    throw new Error('Field #yaku should contain comma-separated ids of yaku as string');
  }
  _checkYaku(roundData.yaku, yakuList);

  _checkOneOf(roundData, 'dora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]); // TODO: shrink to 0..5 if following is ok
  _checkOneOf(roundData, 'uradora', [0, 1, 2, 3, 4]); // TODO: not sure if we really need these guys
  _checkOneOf(roundData, 'kandora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  _checkOneOf(roundData, 'kanuradora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
}

export function _checkMultiRon(
  players: number[],
  yakuList: number[],
  roundData: MultironResult
): void {
  _checkOneOf(roundData, 'loserId', players);
  if (!roundData.wins) {
    throw new Error('Field #wins is required for multiron');
  }
  _checkOneOf(roundData, 'multiRon', [roundData.wins.length]);
  _checkNumericArray(roundData, 'riichi', players);

  for (const ron of roundData.wins) {
    _checkOneOf(ron, 'winnerId', players);
    if (ron.paoPlayerId !== 0) {
      _checkOneOf(ron, 'paoPlayerId', players);
    }

    _checkHan(ron);
    // 0 for 5+ han
    _checkOneOf(ron, 'fu', [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 0]);

    if (!ron.yaku) {
      throw new Error('Field #yaku should contain comma-separated ids of yaku as string');
    }
    _checkYaku(ron.yaku, yakuList);

    _checkOneOf(ron, 'dora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]); // TODO: shrink to 0..5 if following is ok
    _checkOneOf(ron, 'uradora', [0, 1, 2, 3, 4]); // TODO: not sure if we really need these guys
    _checkOneOf(ron, 'kandora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    _checkOneOf(ron, 'kanuradora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  }
}

export function _checkTsumo(players: number[], yakuList: number[], roundData: TsumoResult): void {
  _checkNumericArray(roundData, 'riichi', players);
  _checkOneOf(roundData, 'winnerId', players);
  if (roundData.paoPlayerId !== 0) {
    _checkOneOf(roundData, 'paoPlayerId', players);
  }
  _checkHan(roundData);
  // 0 for 5+ han
  _checkOneOf(roundData, 'fu', [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 0]);

  if (!roundData.yaku) {
    throw new Error('Field #yaku should contain comma-separated ids of yaku as string');
  }
  _checkYaku(roundData.yaku, yakuList);

  _checkOneOf(roundData, 'dora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]); // TODO: shrink to 0..5 if following is ok
  _checkOneOf(roundData, 'uradora', [0, 1, 2, 3, 4]); // TODO: not sure if we really need these guys
  _checkOneOf(roundData, 'kandora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  _checkOneOf(roundData, 'kanuradora', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
}

export function _checkDraw(players: number[], roundData: DrawResult): void {
  _checkNumericArray(roundData, 'riichi', players);
  _checkNumericArray(roundData, 'tempai', players);
}

export function _checkNagashi(players: number[], roundData: NagashiResult): void {
  _checkNumericArray(roundData, 'riichi', players);
  _checkNumericArray(roundData, 'tempai', players);
  _checkNumericArray(roundData, 'nagashi', players);
}

export function _checkAbortiveDraw(players: number[], roundData: AbortResult): void {
  _checkNumericArray(roundData, 'riichi', players);
}

export function _checkChombo(players: number[], roundData: ChomboResult): void {
  _checkOneOf(roundData, 'loserId', players);
}

export function _checkPlayers(playersInGame: number[], playersRegisteredInEvent: number[]): void {
  for (const playerId of playersInGame) {
    if (!playersRegisteredInEvent.includes(playerId)) {
      throw new Error(`Player id #${playerId} is not registered for this event`);
    }
  }
}

export function _checkHan(data: { han: number }): void {
  const value = data.han;
  if (typeof value !== 'number' || value === 0 || value < -6 || value > 32) {
    // don't allow more than 32 han or 6x yakuman
    throw new Error(`Field #han should be valid han count, but is "${value}"`);
  }
}

// === Generic checkers ===

export function _checkOneOf<T>(data: any, key: string, values: T[]): void {
  if (!values.includes(data[key])) {
    throw new Error(`Field #${key} should be one of [${values.join(', ')}], but is "${data[key]}"`);
  }
}

export function _checkNumericArray(data: any, key: string, values: number[]): void {
  const redundantVals = data[key]?.filter((val: number) => !values.includes(val)) ?? [];

  if (redundantVals.length > 0) {
    throw new Error(
      `Field #${key} should contain zero or more of [${data[key]}], but also contains [${redundantVals.join(',')}]`
    );
  }
}

export function _checkYaku(yakuList: number[], possibleYakuList: number[]): void {
  const invalidYaku = yakuList.filter((id) => !possibleYakuList.includes(id));
  if (invalidYaku.length > 0) {
    throw new Error(
      `Some yaku are not allowed in current game rules! ${JSON.stringify(invalidYaku)}`
    );
  }
}

export function validateAndCreateFromOnlineData(
  players: number[],
  allPlayers: number[],
  session: SessionEntity,
  round: Round
): RoundEntity {
  checkRound(players, allPlayers, session.event.ruleset, round);
  const roundEntity = new RoundEntity();
  roundEntity.session = session;
  roundEntity.event = session.event;

  if (round.ron) {
    roundEntity.outcome = RoundOutcome.ROUND_OUTCOME_RON;
    roundEntity.riichi = round.ron.riichiBets;
    roundEntity.hands = [HandEntity.fromMessage(round.ron, roundEntity)];
    roundEntity.round = round.ron.roundIndex;
    roundEntity.honba = round.ron.honba;
  } else if (round.tsumo) {
    roundEntity.outcome = RoundOutcome.ROUND_OUTCOME_TSUMO;
    roundEntity.riichi = round.tsumo.riichiBets;
    roundEntity.hands = [HandEntity.fromMessage(round.tsumo, roundEntity)];
    roundEntity.round = round.tsumo.roundIndex;
    roundEntity.honba = round.tsumo.honba;
  } else if (round.draw) {
    roundEntity.outcome = RoundOutcome.ROUND_OUTCOME_DRAW;
    roundEntity.riichi = round.draw.riichiBets;
    roundEntity.hands = [HandEntity.fromMessage(round.draw, roundEntity)];
    roundEntity.round = round.draw.roundIndex;
    roundEntity.honba = round.draw.honba;
  } else if (round.abort) {
    roundEntity.outcome = RoundOutcome.ROUND_OUTCOME_ABORT;
    roundEntity.riichi = round.abort.riichiBets;
    roundEntity.hands = [HandEntity.fromMessage(round.abort, roundEntity)];
    roundEntity.round = round.abort.roundIndex;
    roundEntity.honba = round.abort.honba;
  } else if (round.nagashi) {
    roundEntity.outcome = RoundOutcome.ROUND_OUTCOME_NAGASHI;
    roundEntity.riichi = round.nagashi.riichiBets;
    roundEntity.hands = [HandEntity.fromMessage(round.nagashi, roundEntity)];
    roundEntity.round = round.nagashi.roundIndex;
    roundEntity.honba = round.nagashi.honba;
  } else if (round.chombo) {
    roundEntity.outcome = RoundOutcome.ROUND_OUTCOME_CHOMBO;
    roundEntity.hands = [HandEntity.fromMessage(round.chombo, roundEntity)];
    roundEntity.round = round.chombo.roundIndex;
    roundEntity.honba = round.chombo.honba;
  } else if (round.multiron) {
    roundEntity.outcome = RoundOutcome.ROUND_OUTCOME_MULTIRON;
    roundEntity.riichi = round.multiron.riichiBets;
    roundEntity.hands = round.multiron.wins.map((win) => {
      const e = HandEntity.fromMessage(win, roundEntity);
      e.loserId = round.multiron?.loserId;
      return e;
    });
    roundEntity.round = round.multiron.roundIndex;
    roundEntity.honba = round.multiron.honba;
  }

  return roundEntity;
}
