/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { IAppState } from '../interfaces';
import {
  AppOutcome,
  AppOutcomeRon,
  DrawOutcomeProps,
  LoseOutcomeProps,
  WinOutcomeProps,
  WinProps,
} from '#/interfaces/app';
import { YakuId } from '#/primitives/yaku';
import { addYakuToList, limits, pack, unpack } from '#/primitives/yaku-compat';
import { getFixedFu, getHan } from '#/primitives/yaku-values';
import { Graph } from '#/primitives/graph';
import { Yaku } from '#/interfaces/common';
import { RoundOutcome } from '#/clients/proto/atoms.pb';

/**
 * Should be used only for common win props, like riichiBets! For all other things modifyWinOutcome should be used.
 * @param state
 * @param fields
 */
export function modifyWinOutcomeCommons(state: IAppState, fields: WinOutcomeProps): IAppState {
  switch (state.currentOutcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields,
        } as AppOutcome, // hacked, ts does not understand this :(
      };
    default:
      return state;
  }
}

export function modifyWinOutcome(
  state: IAppState,
  fields: WinOutcomeProps,
  winnerIdGetter?: () => number | undefined
): IAppState {
  switch (state.currentOutcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields,
        } as AppOutcome, // hacked, ts does not understand this :(
      };
    case RoundOutcome.ROUND_OUTCOME_RON:
      if (!winnerIdGetter) {
        throw new Error('No winner getter provided');
      }
      const winnerId = winnerIdGetter();
      if (!winnerId) {
        throw new Error('No winner provided');
      }

      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          wins: {
            ...state.currentOutcome.wins,
            [winnerId]: {
              ...state.currentOutcome.wins[winnerId],
              ...fields,
            },
          },
        } as AppOutcomeRon,
      };
    default:
      throw new Error('Wrong outcome modifier used');
  }
}

export function modifyLoseOutcome(state: IAppState, fields: LoseOutcomeProps): IAppState {
  switch (state.currentOutcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields,
        } as AppOutcome, // hacked, ts does not understand this :(
      };
    default:
      throw new Error('Wrong outcome modifier used');
  }
}

/**
 * This is to modify multiwin outcome winners count and init their data. To modify winner data use modifyWinProps.
 * @param state
 * @param winnerId
 * @param winnerIsDealer
 * @param remove  do not replace, but remove the entry
 */
export function modifyMultiwin(
  state: IAppState,
  winnerId: number,
  winnerIsDealer: boolean,
  remove = false
): IAppState {
  if (state.currentOutcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_RON) {
    throw new Error('Wrong outcome modifier used');
  }

  if (remove) {
    const wins = { ...state.currentOutcome.wins };
    delete wins[winnerId];

    return {
      ...state,
      currentOutcome: {
        ...state.currentOutcome,
        multiRon: state.currentOutcome.wins[winnerId]
          ? state.currentOutcome.multiRon - 1
          : state.currentOutcome.multiRon,
        wins,
      },
    };
  } else {
    return {
      ...state,
      currentOutcome: {
        ...state.currentOutcome,
        multiRon: state.currentOutcome.wins[winnerId]
          ? state.currentOutcome.multiRon
          : state.currentOutcome.multiRon + 1,
        wins: {
          ...state.currentOutcome.wins,
          [winnerId]: {
            winner: winnerId,
            winnerIsDealer,
            han: 0,
            fu: 0,
            possibleFu: [],
            yaku: '',
            dora: 0,
            openHand: false,
          },
        },
      },
    };
  }
}

export function modifyDrawOutcome(state: IAppState, fields: DrawOutcomeProps): IAppState {
  switch (state.currentOutcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_ABORT:
    case RoundOutcome.ROUND_OUTCOME_DRAW:
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields,
        } as AppOutcome, // hacked, ts does not understand this :(
      };
    default:
      throw new Error('Wrong outcome modifier used');
  }
}

type YakuModException = (
  outcome: AppOutcome['selectedOutcome'],
  winProps: WinProps,
  yakuList: YakuId[],
  yakuId: YakuId,
  riichiBets: number[]
) => YakuId[];

const yakuModAfterExceptions: YakuModException[] = [
  function ensureTsumoIfRiichi(outcome, winProps, yList) {
    if (outcome === RoundOutcome.ROUND_OUTCOME_TSUMO) {
      if (
        (yList.includes(YakuId.RIICHI) || yList.includes(YakuId.DOUBLERIICHI)) &&
        !yList.includes(YakuId.MENZENTSUMO)
      ) {
        yList.push(YakuId.MENZENTSUMO);
      }
    }
    return yList;
  },
  function tsumoOpenHandMutex(outcome, winProps, yList, yakuId) {
    // Remove open hand if we checked tsumo, and vice versa
    if (outcome === RoundOutcome.ROUND_OUTCOME_TSUMO) {
      if (yakuId === YakuId.MENZENTSUMO) {
        const pIdx = yList.indexOf(YakuId.__OPENHAND);
        if (pIdx !== -1) {
          yList.splice(pIdx, 1);
        }
        if (!yList.includes(YakuId.MENZENTSUMO)) {
          yList.push(YakuId.__OPENHAND);
        }
      } else if (yakuId === YakuId.__OPENHAND) {
        const pIdx = yList.indexOf(YakuId.MENZENTSUMO);
        if (pIdx !== -1) {
          yList.splice(pIdx, 1);
        }
        if (!yList.includes(YakuId.__OPENHAND)) {
          yList.push(YakuId.MENZENTSUMO);
        }
      }
    }
    return yList;
  },
];

const yakuModBeforeExceptions: YakuModException[] = [
  function doubleRiichiSelect(outcome, winProps, yList, yakuId, riichiBets) {
    if (yakuId === YakuId.DOUBLERIICHI && winProps.winner && riichiBets.includes(winProps.winner)) {
      if (yList.includes(YakuId.DOUBLERIICHI) && !yList.includes(YakuId.RIICHI)) {
        yList.push(YakuId.RIICHI);
      }
    }
    return yList;
  },
];

export function addYakuToProps(
  winProps: WinProps,
  selectedOutcome: AppOutcome['selectedOutcome'],
  yakuId: YakuId,
  enabledYaku: YakuId[],
  yakuGraph: Graph<Yaku> | undefined,
  riichiPlayers: number[]
): WinProps | undefined {
  if (!yakuGraph) {
    return;
  }

  let yList = unpack(winProps.yaku);
  if (yList.includes(yakuId)) {
    return undefined;
  }

  // reset dora count if limit is added
  if (limits.includes(yakuId)) {
    winProps = {
      ...winProps,
      dora: 0,
    };
  }

  yList = yakuModBeforeExceptions.reduce(
    (list, ex) => ex(selectedOutcome, winProps, yList, yakuId, riichiPlayers),
    yList
  );
  yList = addYakuToList(yakuGraph, yakuId, yList);
  yList = yakuModAfterExceptions.reduce(
    (list, ex) => ex(selectedOutcome, winProps, yList, yakuId, riichiPlayers),
    yList
  );

  const packedList = pack(yList);

  if (winProps.yaku !== packedList) {
    let fu = winProps.fu;
    const han = getHan(yList);
    const possibleFu = getFixedFu(yList, selectedOutcome);
    if (
      -1 === possibleFu.indexOf(winProps.fu) ||
      yakuId === YakuId.__OPENHAND // if open hand added, 40 fu must become 30 by default
    ) {
      fu = possibleFu[0];
    }

    winProps = {
      ...winProps,
      yaku: packedList,
      han,
      fu,
      possibleFu,
    };
  }

  return winProps;
}

export function removeYakuFromProps(
  winProps: WinProps,
  selectedOutcome: AppOutcome['selectedOutcome'],
  yakuId: YakuId,
  riichiPlayers: number[]
): WinProps | undefined {
  let yList = unpack(winProps.yaku);
  if (!yList.includes(yakuId)) {
    return undefined;
  }

  yList = yakuModBeforeExceptions.reduce(
    (list, ex) => ex(selectedOutcome, winProps, yList, yakuId, riichiPlayers),
    yList
  );

  const pIdx = yList.indexOf(yakuId);
  if (pIdx !== -1) {
    yList.splice(pIdx, 1);
  }

  yList = yakuModAfterExceptions.reduce(
    (list, ex) => ex(selectedOutcome, winProps, yList, yakuId, riichiPlayers),
    yList
  );

  const packedList = pack(yList);

  if (winProps.yaku !== packedList) {
    let fu = winProps.fu;
    const han = getHan(yList);
    const possibleFu = getFixedFu(yList, selectedOutcome);
    if (!possibleFu.includes(fu)) {
      fu = possibleFu[0];
    }

    winProps = {
      ...winProps,
      yaku: packedList,
      han,
      fu,
      possibleFu,
    };
  }

  return winProps;
}

export function modifyArray<T>(arr: T[], index: number, value: T) {
  return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
}
