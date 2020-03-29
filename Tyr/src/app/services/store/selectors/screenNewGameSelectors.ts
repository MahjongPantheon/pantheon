import { IAppState } from "../interfaces";
import { LUser } from "../../../interfaces/local";
import { memoize, uniq } from 'lodash';

const DEFAULT_ID = -1;
export const defaultPlayer: Readonly<LUser> = {
  displayName: '--- ? ---',
  id: DEFAULT_ID,
  tenhouId: null,
  ident: null,
  alias: null
};

function _getPlayers(state: IAppState) {
  const players = state.allPlayers || [];
  let currentUserIndex = players.findIndex((element) => element.id == state.currentPlayerId);
  let currentPlayer = players.splice(currentUserIndex, 1);

  return [defaultPlayer].concat(currentPlayer,
    players.filter(
      (p) => state.newGameSelectedUsers && state.newGameSelectedUsers.map((u) => u.id).includes(p.id)
    ).sort((a, b) => {
      if (a == b) {
        return 0;
      }
      return (a.displayName < b.displayName ? -1 : 1);
    })
  );
}

export const getPlayers = memoize(_getPlayers);

function _playersValid(state: IAppState) {
  if (!state.newGameSelectedUsers) {
    return false;
  }

  const ids = state.newGameSelectedUsers.map((p) => p.id);

  // all players should have initialized ids
  if (ids.indexOf(DEFAULT_ID) !== -1) {
    return false;
  }

  // There must be Current Player
  if (ids.indexOf(state.currentPlayerId) == -1) {
    return false;
  }

  // all players should be unique
  return uniq(ids).length == 4;
}

export const playersValid = memoize(_playersValid);
