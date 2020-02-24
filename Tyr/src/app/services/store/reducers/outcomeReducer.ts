import {initBlankOutcome, initialState} from "../state";
import {
  ADD_YAKU, AppActionTypes,
  INIT_BLANK_OUTCOME,
  REMOVE_YAKU,
  SET_DORA_COUNT,
  SET_FU_COUNT,
  TOGGLE_DEADHAND,
  TOGGLE_LOSER,
  TOGGLE_NAGASHI,
  TOGGLE_PAO,
  TOGGLE_RIICHI,
  TOGGLE_WINNER
} from "../actions/interfaces";
import { IAppState } from "../interfaces";
import {
  addYakuToProps,
  modifyDrawOutcome,
  modifyLoseOutcome,
  modifyMultiwin,
  modifyWinOutcome,
  removeYakuFromProps
} from "./util";
import { AppOutcome } from "../../../interfaces/app";
import { Player } from "../../../interfaces/common";
import { intersection } from "lodash";
import { unpack } from "../../../primitives/yaku-compat";
import { getRequiredYaku } from "../selectors/yaku";

/**
 * Get id of player who is dealer in this round
 */
function getDealerId(outcome: AppOutcome, playersList: Player[]): number {
  let players = [playersList[0], playersList[1], playersList[2], playersList[3]];
  for (let i = 1; i < outcome.roundIndex; i++) {
    players = [players.pop()].concat(players);
  }

  return players[0].id;
}

export function outcomeReducer(
  state = initialState,
  action: AppActionTypes
): IAppState {
  let winProps;
  switch (action.type) {
    case INIT_BLANK_OUTCOME:
      return {
        ...state,
        currentOutcome: initBlankOutcome(state.currentRound, action.payload)
      };
    case SET_DORA_COUNT:
      return modifyWinOutcome(state, { 'dora': action.payload.count }, () => action.payload.winner);
    case SET_FU_COUNT:
      return modifyWinOutcome(state, { 'fu': action.payload.count }, () => action.payload.winner);
    case ADD_YAKU:
      // TODO: riichi and double-riichi checks; should be done in UI
      /*
       if (!bypassChecks && id === YakuId.RIICHI && props.yaku.indexOf(YakuId.RIICHI) === -1) {
          alert(i18n._t('If you want to select a riichi, return back and press riichi button for the winner'));
          return false;
        }

        if (
          !bypassChecks &&
          id === YakuId.DOUBLERIICHI && (
            outcome.selectedOutcome === 'ron' ||
            outcome.selectedOutcome === 'tsumo' ||
            outcome.selectedOutcome === 'multiron'
          ) &&
          outcome.riichiBets.indexOf(props.winner) === -1
        ) {
          alert(i18n._t('If you want to select a riichi, return back and press riichi button for the winner'));
          return false;
        }
      */

      switch (state.currentOutcome.selectedOutcome) {
        case "ron":
        case "tsumo":
          winProps = addYakuToProps(
            state.currentOutcome,
            state.currentOutcome.selectedOutcome,
            action.payload.id
          );
          if (!winProps) {
            return state;
          }
          break;
        case "multiron":
          winProps = addYakuToProps(
            state.currentOutcome.wins[action.payload.winner],
            state.currentOutcome.selectedOutcome,
            action.payload.id
          );
          if (!winProps) {
            return state;
          }
          break;
        default:
          return state;
      }

      return modifyWinOutcome(state, winProps, () => action.payload.winner);
    case REMOVE_YAKU:
      if (getRequiredYaku(state).indexOf(action.payload.id) !== -1) {
        // do not allow to disable required yaku
        return state;
      }

      switch (state.currentOutcome.selectedOutcome) {
        case "ron":
        case "tsumo":
          winProps = removeYakuFromProps(
            state.currentOutcome,
            state.currentOutcome.selectedOutcome,
            action.payload.id
          );
          if (!winProps) {
            return state;
          }
          break;
        case "multiron":
          winProps = removeYakuFromProps(
            state.currentOutcome.wins[action.payload.winner],
            state.currentOutcome.selectedOutcome,
            action.payload.id
          );
          if (!winProps) {
            return state;
          }
          break;
        default:
          return state;
      }

      return modifyWinOutcome(state, winProps, () => action.payload.winner);
    case TOGGLE_RIICHI:
      const outcome = state.currentOutcome;
      const playerId = action.payload;

      switch (outcome.selectedOutcome) {
        case 'ron':
        case 'tsumo':
        case 'abort':
        case 'draw':
        case 'nagashi':
        case 'multiron':
          const riichiList = outcome.riichiBets.indexOf(playerId) === -1
            ? [ ...outcome.riichiBets, playerId ]
            : outcome.riichiBets.filter((id) => id !== playerId);

          // add tempai on riichi click
          if (
            (
              outcome.selectedOutcome === 'draw' &&
              outcome.tempai.indexOf(playerId) === -1 &&
              outcome.deadhands.indexOf(playerId) === -1
            ) || (
              outcome.selectedOutcome === 'nagashi' &&
              outcome.tempai.indexOf(playerId) === -1
            )
          ) {
            return modifyDrawOutcome(state, {
              tempai: [ ...outcome.tempai, playerId ],
              riichiBets: riichiList
            });
          }

          return modifyDrawOutcome(state, { riichiBets: riichiList });
      }

      return state;
    case TOGGLE_WINNER:
      switch (state.currentOutcome.selectedOutcome) {
        case 'ron':
        case 'tsumo':
          return modifyWinOutcome(state, {
            winner: state.currentOutcome.winner === action.payload
              ? null
              : action.payload,
            winnerIsDealer: state.currentOutcome.winner === null &&
              getDealerId(state.currentOutcome, state.players) === action.payload
          });
        case 'draw':
        case 'nagashi': // select tempai players for nagashi or draw
          return state.currentOutcome.tempai.indexOf(action.payload) === -1
            ? modifyDrawOutcome(state, {
              tempai: [ ...state.currentOutcome.tempai, action.payload ]
            })
            : modifyDrawOutcome(state, {
              tempai: state.currentOutcome.tempai.filter((id) => id !== action.payload),
              riichiBets: state.currentOutcome.riichiBets.indexOf(action.payload) === -1
                ? state.currentOutcome.riichiBets
                : state.currentOutcome.riichiBets.filter((id) => id !== action.payload)
            });
        case 'multiron':
          return modifyMultiwin(
            state,
            action.payload,
            getDealerId(state.currentOutcome, state.players) === action.payload,
            !!state.currentOutcome.wins[action.payload]
          );
        default:
          throw new Error('No winners exist on this outcome');
      }
    case TOGGLE_LOSER:
      switch (state.currentOutcome.selectedOutcome) {
        case 'ron':
        case 'multiron':
        case 'chombo':
          return modifyLoseOutcome(state, {
            loser: state.currentOutcome.loser === action.payload
              ? null
              : action.payload,
            loserIsDealer: state.currentOutcome.loser === null
              && getDealerId(state.currentOutcome, state.players) === action.payload
          });
        default:
          throw new Error('No losers exist on this outcome');
      }
    case TOGGLE_PAO:
      switch (state.currentOutcome.selectedOutcome) {
        case 'ron':
        case 'tsumo':
          return modifyWinOutcome(state, {
            paoPlayerId: state.currentOutcome.paoPlayerId === action.payload.id
              ? null
              : action.payload.id
          });
        case 'multiron':
          let newState = state;
          for (let playerId in state.currentOutcome.wins) {
            if (intersection(unpack(state.currentOutcome.wins[playerId].yaku), action.payload.yakuWithPao).length !== 0) {
              newState = modifyWinOutcome(newState, {
                paoPlayerId: state.currentOutcome.wins[playerId].paoPlayerId === action.payload.id ? null : action.payload.id
              }, () => parseInt(playerId.toString()));
            }
          }
          return newState;
        default:
          throw new Error('No pao exist on this outcome');
      }
    case TOGGLE_DEADHAND:
      switch (state.currentOutcome.selectedOutcome) {
        case 'draw':
        case 'nagashi':
          if (state.currentOutcome.deadhands.indexOf(action.payload) === -1) {
            let tempai = state.currentOutcome.tempai;
            if (tempai.indexOf(action.payload) !== -1) { // remove tempai of dead user
              tempai = tempai.filter((id) => id !== action.payload);
            }
            return modifyDrawOutcome(state, {
              tempai,
              deadhands: [ ...state.currentOutcome.deadhands, action.payload ]
            });
          } else {
            let tempai = state.currentOutcome.tempai;
            if (state.currentOutcome.riichiBets.indexOf(action.payload) !== -1) {
              // if we remove dead hand from riichi user, he should become tempai
              tempai = [ ...state.currentOutcome.tempai, action.payload ];
            }
            return modifyDrawOutcome(state, {
              tempai,
              deadhands: state.currentOutcome.deadhands.filter((id) => id !== action.payload)
            });
          }
        default:
          throw new Error('No losers exist on this outcome');
      }
    case TOGGLE_NAGASHI:
      switch (state.currentOutcome.selectedOutcome) {
        case 'nagashi':
          if (state.currentOutcome.nagashi.indexOf(action.payload) !== -1) {
            return modifyDrawOutcome(state, {
              nagashi: [ ...state.currentOutcome.nagashi, action.payload ]
            });
          } else {
            return modifyDrawOutcome(state, {
              nagashi: state.currentOutcome.nagashi.filter((id) => id !== action.payload)
            });
          }
        default:
          throw new Error('No nagashi exist on this outcome');
      }
    default:
      return state;
  }
}
