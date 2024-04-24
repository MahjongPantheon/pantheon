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

import { initBlankOutcome } from '../state';
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
  TOGGLE_WINNER,
} from '../actions/interfaces';
import { IAppState } from '../interfaces';
import {
  addYakuToProps,
  modifyDrawOutcome,
  modifyLoseOutcome,
  modifyMultiwin,
  modifyWinOutcome,
  modifyWinOutcomeCommons,
  removeYakuFromProps,
} from './util';
import { AppOutcome } from '../../interfaces/app';
import { getRequiredYaku } from '../selectors/yaku';
import { YakuId } from '../../primitives/yaku';
import { PlayerInSession, RoundOutcome } from '../../clients/proto/atoms.pb';

/**
 * Get id of player who is dealer in this round
 */
function getDealerId(outcome: AppOutcome, playersList: PlayerInSession[]): number {
  return playersList[(outcome.roundIndex - 1) % 4].id;
}

function addYakuList(state: IAppState, yakuToAdd: YakuId[], targetPlayer?: number) {
  let stateUpdated = state;
  let winProps;
  yakuToAdd.forEach((yId) => {
    switch (stateUpdated.currentOutcome?.selectedOutcome) {
      case RoundOutcome.ROUND_OUTCOME_TSUMO:
        winProps = addYakuToProps(
          stateUpdated.currentOutcome,
          stateUpdated.currentOutcome.selectedOutcome,
          yId,
          stateUpdated.gameConfig?.rulesetConfig.allowedYaku ?? [],
          stateUpdated.yakuList,
          stateUpdated.currentOutcome.riichiBets
        );
        if (!winProps) {
          return;
        }
        break;
      case RoundOutcome.ROUND_OUTCOME_RON:
        if (!targetPlayer) {
          return;
        }
        winProps = addYakuToProps(
          stateUpdated.currentOutcome.wins[targetPlayer],
          stateUpdated.currentOutcome.selectedOutcome,
          yId,
          stateUpdated.gameConfig?.rulesetConfig.allowedYaku ?? [],
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

export function outcomeReducer(state: IAppState, action: AppActionTypes): IAppState {
  let winProps;
  let playerId: number;
  switch (action.type) {
    case INIT_BLANK_OUTCOME:
      return {
        ...state,
        currentOutcome: initBlankOutcome(state.sessionState?.roundIndex ?? 0, action.payload),
      };
    case SET_DORA_COUNT:
      return modifyWinOutcome(state, { dora: action.payload.count }, () => action.payload.winner);
    case SET_FU_COUNT:
      return modifyWinOutcome(state, { fu: action.payload.count }, () => action.payload.winner);
    case ADD_YAKU:
      return addYakuList(
        state,
        [action.payload.id].concat(getRequiredYaku(state)),
        action.payload.winner
      );
    case INIT_REQUIRED_YAKU:
      switch (state.currentOutcome?.selectedOutcome) {
        case RoundOutcome.ROUND_OUTCOME_TSUMO:
          return addYakuList(state, getRequiredYaku(state), state.multironCurrentWinner);
        case RoundOutcome.ROUND_OUTCOME_RON:
          let stateModified = state;
          Object.keys(state.currentOutcome.wins).forEach((pId) => {
            stateModified = addYakuList(
              stateModified,
              getRequiredYaku(state, parseInt(pId, 10)),
              parseInt(pId, 10)
            );
          });
          return stateModified;
        default:
          return state;
      }
    case REMOVE_YAKU:
      if (getRequiredYaku(state).includes(action.payload.id)) {
        // do not allow to disable required yaku
        return state;
      }

      switch (state.currentOutcome?.selectedOutcome) {
        case RoundOutcome.ROUND_OUTCOME_TSUMO:
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
        case RoundOutcome.ROUND_OUTCOME_RON:
          winProps = removeYakuFromProps(
            state.currentOutcome.wins[action.payload.winner!],
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
      if (outcome && outcome.selectedOutcome === RoundOutcome.ROUND_OUTCOME_CHOMBO) {
        return state;
      }

      const riichiList = outcome?.riichiBets.includes(playerId)
        ? outcome?.riichiBets.filter((id) => id !== playerId)
        : [...(outcome?.riichiBets ?? []), playerId];

      // Custom logic which disables tempai and/or riichi
      if (
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_DRAW ||
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_NAGASHI
      ) {
        if (!outcome.tempai.includes(playerId) && !outcome.deadhands.includes(playerId)) {
          return modifyDrawOutcome(state, {
            tempai: [...outcome.tempai, playerId],
            riichiBets: riichiList,
          });
        }

        if (outcome.riichiBets.includes(playerId) && outcome.deadhands.includes(playerId)) {
          return modifyDrawOutcome(state, {
            deadhands: outcome.deadhands.filter((id) => id !== playerId),
            riichiBets: outcome.riichiBets.filter((id) => id !== playerId),
          });
        }
      }

      if (
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON ||
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO
      ) {
        return modifyWinOutcomeCommons(state, { riichiBets: riichiList });
      } else if (
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_DRAW ||
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_NAGASHI ||
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_ABORT
      ) {
        return modifyDrawOutcome(state, {
          riichiBets: riichiList,
        });
      }

      return state;
    case TOGGLE_WINNER:
      switch (state.currentOutcome?.selectedOutcome) {
        case RoundOutcome.ROUND_OUTCOME_TSUMO:
          return modifyWinOutcome(state, {
            winner: state.currentOutcome.winner === action.payload ? undefined : action.payload,
            winnerIsDealer:
              state.currentOutcome.winner === undefined &&
              state.players !== undefined &&
              getDealerId(state.currentOutcome, state.players) === action.payload,
          });
        case RoundOutcome.ROUND_OUTCOME_DRAW:
        case RoundOutcome.ROUND_OUTCOME_NAGASHI: // select tempai players for nagashi or draw
          if (!state.currentOutcome.riichiBets.includes(action.payload)) {
            if (!state.currentOutcome.tempai.includes(action.payload)) {
              return modifyDrawOutcome(state, {
                tempai: [...state.currentOutcome.tempai, action.payload],
              });
            }

            return modifyDrawOutcome(state, {
              tempai: state.currentOutcome.tempai.filter((id) => id !== action.payload),
            });
          } else {
            if (
              state.currentOutcome.tempai.includes(action.payload) &&
              !state.currentOutcome.deadhands.includes(action.payload)
            ) {
              return modifyDrawOutcome(state, {
                deadhands: [...state.currentOutcome.deadhands, action.payload],
                tempai: state.currentOutcome.tempai.filter((id) => id !== action.payload),
              });
            } else {
              throw Error('Tempai button cannot exist while deadhand button pressed');
            }
          }
        case RoundOutcome.ROUND_OUTCOME_RON:
          return modifyMultiwin(
            state,
            action.payload,
            state.players !== undefined &&
              getDealerId(state.currentOutcome, state.players) === action.payload,
            !!state.currentOutcome.wins[action.payload]
          );
        default:
          throw new Error('No winners exist on this outcome');
      }
    case TOGGLE_LOSER:
      switch (state.currentOutcome?.selectedOutcome) {
        case RoundOutcome.ROUND_OUTCOME_RON:
        case RoundOutcome.ROUND_OUTCOME_CHOMBO:
          return modifyLoseOutcome(state, {
            loser: state.currentOutcome.loser === action.payload ? undefined : action.payload,
            loserIsDealer:
              state.currentOutcome.loser === undefined &&
              state.players !== undefined &&
              getDealerId(state.currentOutcome, state.players) === action.payload,
          });
        default:
          throw new Error('No losers exist on this outcome');
      }
    case TOGGLE_PAO:
      playerId = action.payload;
      switch (state.currentOutcome?.selectedOutcome) {
        case RoundOutcome.ROUND_OUTCOME_TSUMO:
          return modifyWinOutcome(state, {
            paoPlayerId: state.currentOutcome.paoPlayerId === playerId ? undefined : playerId,
          });
        case RoundOutcome.ROUND_OUTCOME_RON:
          if (state.multironCurrentWinner) {
            return modifyWinOutcome(
              state,
              {
                paoPlayerId:
                  state.currentOutcome.wins[state.multironCurrentWinner].paoPlayerId === playerId
                    ? undefined
                    : playerId,
              },
              () => state.multironCurrentWinner
            );
          }
          return state;
        default:
          throw new Error('No pao exist on this outcome');
      }
    case TOGGLE_DEADHAND:
      switch (state.currentOutcome?.selectedOutcome) {
        case RoundOutcome.ROUND_OUTCOME_DRAW:
        case RoundOutcome.ROUND_OUTCOME_NAGASHI:
          if (state.currentOutcome.riichiBets.includes(action.payload)) {
            if (
              !state.currentOutcome.tempai.includes(action.payload) &&
              state.currentOutcome.deadhands.includes(action.payload)
            ) {
              return modifyDrawOutcome(state, {
                deadhands: state.currentOutcome.deadhands.filter((id) => id !== action.payload),
                tempai: [...state.currentOutcome.tempai, action.payload],
              });
            } else {
              throw Error('Deadhand button cannot exist while tempai button pressed');
            }
          } else {
            throw new Error('Deadhand button cannot exist without pressed riichi');
          }
        default:
          throw new Error('No losers exist on this outcome');
      }
    case TOGGLE_NAGASHI:
      switch (state.currentOutcome?.selectedOutcome) {
        case RoundOutcome.ROUND_OUTCOME_NAGASHI:
          if (!state.currentOutcome.nagashi.includes(action.payload)) {
            return modifyDrawOutcome(state, {
              nagashi: [...state.currentOutcome.nagashi, action.payload],
            });
          } else {
            return modifyDrawOutcome(state, {
              nagashi: state.currentOutcome.nagashi.filter((id) => id !== action.payload),
            });
          }
        default:
          throw new Error('No nagashi exist on this outcome');
      }
    default:
      return state;
  }
}
