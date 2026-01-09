import { RoundEntity } from 'src/entities/Round.entity.js';
import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import {
  AbortResult,
  ChomboResult,
  DrawResult,
  MultironResult,
  NagashiResult,
  RonResult,
  Round,
  TsumoResult,
} from 'tsclients/proto/atoms.pb.js';

export function checkRound(
  players: number[],
  allRegisteredPlayersIds: number[],
  ruleset: RulesetEntity,
  roundData: Round
): void {
  _checkOneOf(roundData, 'outcome', [
    'ron',
    'multiron',
    'tsumo',
    'draw',
    'abort',
    'chombo',
    'nagashi',
  ]);
  _checkPlayers(players, allRegisteredPlayersIds);
  const playerIds = players.join(',');
  const yakuList = ruleset.rules.allowedYaku;
  if (roundData.ron) {
    _checkRon(playerIds, yakuList, roundData.ron);
  }
  if (roundData.multiron) {
    _checkMultiRon(playerIds, yakuList, roundData.multiron);
  }
  if (roundData.tsumo) {
    _checkTsumo(playerIds, yakuList, roundData.tsumo);
  }
  if (roundData.draw) {
    _checkDraw(playerIds, roundData.draw);
  }
  if (roundData.abort) {
    _checkAbortiveDraw(playerIds, roundData.abort);
  }
  if (roundData.chombo) {
    _checkChombo(playerIds, roundData.chombo);
  }
  if (roundData.nagashi) {
    _checkNagashi(playerIds, roundData.nagashi);
  }
}

export function _checkRon(players: string, yakuList: number[], roundData: RonResult): void {
  _csvCheckZeroOrMoreOf(roundData, 'riichi', players);
  _checkOneOf(roundData, 'winnerId', players.split(',').map(Number));
  _checkOneOf(roundData, 'loserId', players.split(',').map(Number));
  if (roundData.paoPlayerId !== undefined) {
    _checkOneOf(roundData, 'paoPlayerId', players.split(',').map(Number));
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
  players: string,
  yakuList: number[],
  roundData: MultironResult
): void {
  _checkOneOf(roundData, 'loserId', players.split(',').map(Number));
  if (!roundData.wins) {
    throw new Error('Field #wins is required for multiron');
  }
  _checkOneOf(roundData, 'multiRon', [roundData.wins.length]);
  _csvCheckZeroOrMoreOf(roundData, 'riichi', players);

  for (const ron of roundData.wins) {
    _checkOneOf(ron, 'winnerId', players.split(',').map(Number));
    if (ron.paoPlayerId !== undefined) {
      _checkOneOf(ron, 'paoPlayerId', players.split(',').map(Number));
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

export function _checkTsumo(players: string, yakuList: number[], roundData: TsumoResult): void {
  _csvCheckZeroOrMoreOf(roundData, 'riichi', players);
  _checkOneOf(roundData, 'winner_id', players.split(',').map(Number));
  if (roundData.paoPlayerId !== undefined) {
    _checkOneOf(roundData, 'paoPlayerId', players.split(',').map(Number));
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

export function _checkDraw(players: string, roundData: DrawResult): void {
  _csvCheckZeroOrMoreOf(roundData, 'riichi', players);
  _csvCheckZeroOrMoreOf(roundData, 'tempai', players);
}

export function _checkNagashi(players: string, roundData: NagashiResult): void {
  _csvCheckZeroOrMoreOf(roundData, 'riichi', players);
  _csvCheckZeroOrMoreOf(roundData, 'tempai', players);
  _csvCheckZeroOrMoreOf(roundData, 'nagashi', players);
}

export function _checkAbortiveDraw(players: string, roundData: AbortResult): void {
  _csvCheckZeroOrMoreOf(roundData, 'riichi', players);
}

export function _checkChombo(players: string, roundData: ChomboResult): void {
  _checkOneOf(roundData, 'loserId', players.split(',').map(Number));
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

export function _csvCheckZeroOrMoreOf(data: any, key: string, csvValues: string): void {
  if (typeof data[key] !== 'string') {
    throw new Error(`Field #${key} should contain comma-separated string`);
  }

  const redundantVals = data[key]
    .split(',')
    .filter((val: string) => val.trim() !== '')
    .filter(
      (val: string) =>
        !csvValues
          .split(',')
          .filter((v) => v.trim() !== '')
          .includes(val)
    );

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

export function validateAndCreateFromOnlineData(session: SessionEntity, round: Round): RoundEntity {
  const roundEntity = new RoundEntity();
  roundEntity.session = session;
  roundEntity.event = session.event;

  // TODO

  return roundEntity;
}
