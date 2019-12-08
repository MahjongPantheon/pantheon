import { initialState } from "../state";
import { AppActionTypes, SET_FU_COUNT } from "../actions/interfaces";
import { IAppState } from "../interfaces";

export function hanFuReducer(
  state = initialState,
  action: AppActionTypes
): IAppState {
  switch (action.type) {
    case SET_FU_COUNT:
      switch (state.currentOutcome.selectedOutcome) {
        case "ron":
        case "tsumo":
          return {
            ...state,
            currentOutcome: {
              ...state.currentOutcome,
              fu: action.payload.count,
            }
          };
        case "multiron":
          return {
            ...state,
            currentOutcome: {
              ...state.currentOutcome,
              wins: {
                ...state.currentOutcome.wins,
                [action.payload.winner]: {
                  ...state.currentOutcome.wins[action.payload.winner],
                  fu: action.payload.count
                }
              }
            }
          };
        default:
          throw new Error('No yaku may exist on this outcome');
      }
    default:
      return state;
  }
}
