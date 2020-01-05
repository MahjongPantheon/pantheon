import { IAppState } from "../interfaces";
import { AppOutcome, DrawOutcomeProps, LoseOutcomeProps, WinOutcomeProps, WinProps } from "../../../interfaces/app";
import { YakuId } from "../../../primitives/yaku";
import { addYakuToList, limits, pack, unpack } from "../../../primitives/yaku-compat";
import { getFixedFu, getHan } from "../../../primitives/yaku-values";

export function modifyWinOutcome(state: IAppState, fields: WinOutcomeProps, winnerIdGetter?: () => number): IAppState {
  switch (state.currentOutcome.selectedOutcome) {
    case "ron":
    case "tsumo":
      return {
        ...state,
        currentOutcome: {
          ...state.currentOutcome,
          ...fields
        } as AppOutcome // hacked, ts does not understand this :(
      };
    case "multiron":
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
    case "ron":
    case "multiron":
    case "chombo":
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
export function modifyMultiwin(state: IAppState, winnerId: number, winnerIsDealer: boolean, remove: boolean = false): IAppState {
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
    case "abort":
    case "draw":
    case "nagashi":
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


export function addYakuToProps(
  winProps: WinProps,
  selectedOutcome: AppOutcome['selectedOutcome'],
  yakuId: YakuId
): WinProps | null {

  let yakuList = unpack(winProps.yaku);
  if (yakuList[yakuId]) {
    return null;
  }

  // reset dora count if limit is added
  if (limits.indexOf(yakuId) !== -1) {
    winProps = {
      ...winProps,
      dora: 0
    };
  }

  yakuList = addYakuToList(yakuId, yakuList);

  if (selectedOutcome === 'tsumo') {
    if (
      (yakuId === YakuId.MENZENTSUMO && yakuList.indexOf(YakuId.__OPENHAND) !== -1) ||
      (yakuId === YakuId.__OPENHAND && yakuList.indexOf(YakuId.MENZENTSUMO) !== -1)
    ) {
      // Remove open hand if we checked tsumo, and vice versa
      const pIdx = yakuList.indexOf(yakuId);
      if (pIdx !== -1) {
        yakuList.splice(pIdx, 1);
      }
    }
  }

  const packedList = pack(yakuList);

  if (winProps.yaku !== packedList) {
    let fu = winProps.fu;
    const han = getHan(yakuList);
    const possibleFu = getFixedFu(yakuList, selectedOutcome);
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

  let yakuList = unpack(winProps.yaku);
  if (!yakuList[yakuId]) {
    return null;
  }

  const pIdx = yakuList.indexOf(yakuId);
  if (pIdx !== -1) {
    yakuList.splice(pIdx, 1);
  }

  const packedList = pack(yakuList);

  if (winProps.yaku !== packedList) {
    let fu = winProps.fu;
    const han = getHan(yakuList);
    const possibleFu = getFixedFu(yakuList, selectedOutcome);
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
