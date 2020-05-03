import {IAppState} from '../interfaces';
import {AppOutcome, DrawOutcomeProps, LoseOutcomeProps, WinOutcomeProps, WinProps} from '../../../interfaces/app';
import {YakuId, yakuList} from '../../../primitives/yaku';
import {addYakuToList, limits, pack, unpack} from '../../../primitives/yaku-compat';
import {getFixedFu, getHan} from '../../../primitives/yaku-values';
import {Graph} from '../../../primitives/graph';
import {Yaku} from '../../../interfaces/common';

/**
 * Should be used only for common win props, like riichiBets! For all other things modifyWinOutcome should be used.
 * @param state
 * @param fields
 */
export function modifyWinOutcomeCommons(state: IAppState, fields: WinOutcomeProps): IAppState {
  switch (state.currentOutcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
    case 'multiron':
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields
        } as AppOutcome // hacked, ts does not understand this :(
      };
  }
}

export function modifyWinOutcome(state: IAppState, fields: WinOutcomeProps, winnerIdGetter?: () => number): IAppState {
  switch (state.currentOutcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields
        } as AppOutcome // hacked, ts does not understand this :(
      };
    case 'multiron':
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          wins: {
            ...state.currentOutcome.wins,
            [winnerIdGetter()]: {
              ...state.currentOutcome.wins[winnerIdGetter()],
              ...fields
            }
          }
        }
      };
    default:
      throw new Error('Wrong outcome modifier used');
  }
}

export function modifyLoseOutcome(state: IAppState, fields: LoseOutcomeProps): IAppState {
  switch (state.currentOutcome.selectedOutcome) {
    case 'ron':
    case 'multiron':
    case 'chombo':
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields
        } as AppOutcome // hacked, ts does not understand this :(
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
export function modifyMultiwin(state: IAppState, winnerId: number, winnerIsDealer: boolean, remove = false): IAppState {
  if (state.currentOutcome.selectedOutcome !== 'multiron') {
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
        wins
      }
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
            openHand: false
          }
        }
      }
    };
  }
}

export function modifyDrawOutcome(state: IAppState, fields: DrawOutcomeProps): IAppState {
  switch (state.currentOutcome.selectedOutcome) {
    case 'abort':
    case 'draw':
    case 'nagashi':
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields
        } as AppOutcome // hacked, ts does not understand this :(
      };
    default:
      throw new Error('Wrong outcome modifier used');
  }
}

type YakuModException = (outcome: AppOutcome['selectedOutcome'], winProps: WinProps, yakuList: YakuId[], yakuId: YakuId) => YakuId[];

const yakuModExceptions: YakuModException[] = [
  function ensureTsumoIfRiichi(outcome: AppOutcome['selectedOutcome'], winProps: WinProps, yList: YakuId[], yakuId: YakuId) {
    if (outcome === 'tsumo') {
      if ((yList.includes(YakuId.RIICHI) || yList.includes(YakuId.DOUBLERIICHI)) && !yList.includes(YakuId.MENZENTSUMO)) {
        yList.push(YakuId.MENZENTSUMO);
      }
    }
    return yList;
  },
  function tsumoOpenHandMutex(outcome: AppOutcome['selectedOutcome'], winProps: WinProps, yList: YakuId[], yakuId: YakuId) {
    // Remove open hand if we checked tsumo, and vice versa
    if (outcome === 'tsumo') {
      if (yakuId === YakuId.MENZENTSUMO) {
        const pIdx = yList.indexOf(YakuId.__OPENHAND);
        if (pIdx !== -1) {
          yList.splice(pIdx, 1);
        }
        if (yList.indexOf(YakuId.MENZENTSUMO) === -1) {
          yList.push(YakuId.__OPENHAND);
        }
      } else if (yakuId === YakuId.__OPENHAND) {
        const pIdx = yList.indexOf(YakuId.MENZENTSUMO);
        if (pIdx !== -1) {
          yList.splice(pIdx, 1);
        }
        if (yList.indexOf(YakuId.__OPENHAND) === -1) {
          yList.push(YakuId.MENZENTSUMO);
        }
      }
    }
    return yList;
  }
];

export function addYakuToProps(
  winProps: WinProps,
  selectedOutcome: AppOutcome['selectedOutcome'],
  yakuId: YakuId,
  enabledYaku: YakuId[],
  yakuGraph: Graph<Yaku>
): WinProps | null {

  let yList = unpack(winProps.yaku);
  if (yList.indexOf(yakuId) !== -1) {
    return null;
  }

  // reset dora count if limit is added
  if (limits.indexOf(yakuId) !== -1) {
    winProps = {
      ...winProps,
      dora: 0
    };
  }

  yList = addYakuToList(yakuGraph, yakuId, yList);
  yList = yakuModExceptions.reduce((list, ex) => ex(selectedOutcome, winProps, yList, yakuId), yList);

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
      possibleFu
    };
  }

  return winProps;
}

export function removeYakuFromProps(
  winProps: WinProps,
  selectedOutcome: AppOutcome['selectedOutcome'],
  yakuId: YakuId
): WinProps | null {

  let yList = unpack(winProps.yaku);
  if (yList.indexOf(yakuId) === -1) {
    return null;
  }

  const pIdx = yList.indexOf(yakuId);
  if (pIdx !== -1) {
    yList.splice(pIdx, 1);
  }

  yList = yakuModExceptions.reduce((list, ex) => ex(selectedOutcome, winProps, yList, yakuId), yList);

  const packedList = pack(yList);

  if (winProps.yaku !== packedList) {
    let fu = winProps.fu;
    const han = getHan(yList);
    const possibleFu = getFixedFu(yList, selectedOutcome);
    if (possibleFu.indexOf(fu) === -1) {
      fu = possibleFu[0];
    }

    winProps = {
      ...winProps,
      yaku: packedList,
      han,
      fu,
      possibleFu
    };
  }

  return winProps;
}

export function modifyArray<T>(arr: T[], index: number, value: T) {
  return [...(arr.slice(0, index)), value, ...(arr.slice(index + 1))];
}
