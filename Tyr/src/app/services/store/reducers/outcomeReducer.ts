import {initBlankOutcome} from '../state';
import {
  ADD_YAKU,
  AppActionTypes,
  INIT_BLANK_OUTCOME,
  INIT_REQUIRED_YAKU,
  REMOVE_YAKU,
  SET_DORA_COUNT,
  SET_FU_COUNT,
  TOGGLE_DEADHAND,
  TOGGLE_LOSER,
  TOGGLE_NAGASHI,
  TOGGLE_PAO,
  TOGGLE_RIICHI,
  TOGGLE_WINNER
} from '../actions/interfaces';
import {IAppState} from '../interfaces';
import {
  addYakuToProps,
  modifyDrawOutcome,
  modifyLoseOutcome,
  modifyMultiwin,
  modifyWinOutcome,
  modifyWinOutcomeCommons,
  removeYakuFromProps
} from './util';
import {AppOutcome} from '../../../interfaces/app';
import {Player} from '../../../interfaces/common';
import {intersection} from 'lodash';
import {unpack} from '../../../primitives/yaku-compat';
import {getRequiredYaku} from '../selectors/yaku';
import {YakuId} from '../../../primitives/yaku';

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

function addYakuList(state: IAppState, yakuToAdd: YakuId[], targetPlayer?: number) {
  let stateUpdated = state;
  let winProps;
  yakuToAdd.forEach((yId) => {
    switch (stateUpdated.currentOutcome.selectedOutcome) {
      case 'ron':
      case 'tsumo':
        winProps = addYakuToProps(
          stateUpdated.currentOutcome,
          stateUpdated.currentOutcome.selectedOutcome,
          yId,
          stateUpdated.gameConfig.allowedYaku,
          stateUpdated.yakuList,
          stateUpdated.currentOutcome.riichiBets
        );
        if (!winProps) {
          return;
        }
        break;
      case 'multiron':
        winProps = addYakuToProps(
          stateUpdated.currentOutcome.wins[targetPlayer],
          stateUpdated.currentOutcome.selectedOutcome,
          yId,
          stateUpdated.gameConfig.allowedYaku,
          stateUpdated.yakuList,
          stateUpdated.currentOutcome.riichiBets
        );
        if (!winProps) {
          return;
        }
        break;
      default:
        return;
    }

    stateUpdated = modifyWinOutcome(stateUpdated, winProps, () => targetPlayer);
  });
  return stateUpdated;
}

export function outcomeReducer(
  state: IAppState,
  action: AppActionTypes
): IAppState {
  let winProps;
  let playerId;
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
      return addYakuList(state, [action.payload.id].concat(getRequiredYaku(state)), action.payload.winner);
    case INIT_REQUIRED_YAKU:
      switch (state.currentOutcome.selectedOutcome) {
        case 'ron':
        case 'tsumo':
          return addYakuList(state, getRequiredYaku(state), state.multironCurrentWinner);
        case 'multiron':
          let stateModified = state;
          Object.keys(state.currentOutcome.wins).forEach((pId) => {
            stateModified = addYakuList(stateModified, getRequiredYaku(state, parseInt(pId, 10)), parseInt(pId, 10));
          });
          return stateModified;
        default:
          return state;
      }
    case REMOVE_YAKU:
      if (getRequiredYaku(state).indexOf(action.payload.id) !== -1) {
        // do not allow to disable required yaku
        return state;
      }

      switch (state.currentOutcome.selectedOutcome) {
        case 'ron':
        case 'tsumo':
          winProps = removeYakuFromProps(
            state.currentOutcome,
            state.currentOutcome.selectedOutcome,
            action.payload.id,
            state.currentOutcome.riichiBets
          );
          if (!winProps) {
            return state;
          }
          break;
        case 'multiron':
          winProps = removeYakuFromProps(
            state.currentOutcome.wins[action.payload.winner],
            state.currentOutcome.selectedOutcome,
            action.payload.id,
            state.currentOutcome.riichiBets
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
      playerId = action.payload;
      if (outcome.selectedOutcome === 'chombo') {
        return state;
      }

      const riichiList = outcome.riichiBets.indexOf(playerId) === -1
        ? [ ...outcome.riichiBets, playerId ]
        : outcome.riichiBets.filter((id) => id !== playerId);

      // Custom logic which disables tempai and/or riichi
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

      if (outcome.selectedOutcome === 'ron' || outcome.selectedOutcome === 'tsumo' || outcome.selectedOutcome === 'multiron') {
        return modifyWinOutcomeCommons(state, { riichiBets: riichiList });
      } else if (outcome.selectedOutcome === 'draw' || outcome.selectedOutcome === 'nagashi' || outcome.selectedOutcome === 'abort') {
        return modifyDrawOutcome(state, {
          riichiBets: riichiList
        });
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
      playerId = action.payload;
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
          for (let pId in state.currentOutcome.wins) {
            if (intersection(unpack(state.currentOutcome.wins[pId].yaku), action.payload.yakuWithPao).length !== 0) {
              newState = modifyWinOutcome(newState, {
                paoPlayerId: state.currentOutcome.wins[pId].paoPlayerId === action.payload.id ? null : action.payload.id
              }, () => parseInt(playerId.toString(), 10));
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
          if (state.currentOutcome.nagashi.indexOf(action.payload) === -1) {
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
