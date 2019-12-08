import { initialState } from "../state";
import { AppActionTypes, SET_DORA_COUNT } from "../actions/interfaces";
import { IAppState } from "../interfaces";

export function doraReducer(
  state = initialState,
  action: AppActionTypes
): IAppState {
  switch (action.type) {
    case SET_DORA_COUNT:
      switch (state.currentOutcome.selectedOutcome) {
        case "ron":
        case "tsumo":
          return {
            ...state,
            currentOutcome: {
              ...state.currentOutcome,
              dora: action.payload.count,
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
                  dora: action.payload.count
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
