import { IAppState } from '../interfaces';
import { LUser } from '#/interfaces/local';
import { uniq } from '#/primitives/uniq';
import { memoize } from '#/primitives/memoize';

const DEFAULT_ID = -1;
export const defaultPlayer: Readonly<LUser> = {
  displayName: '',
  id: DEFAULT_ID,
  tenhouId: '',
};

function _getPlayers(state: IAppState) {
  const players = [...(state.allPlayers || [])];
  const currentUserIndex = players.findIndex((element) => element.id == state.currentPlayerId);
  const currentPlayer = players.splice(currentUserIndex, 1);
  const otherPlayers = players
    .filter(
      (p) =>
        state.newGameSelectedUsers && !state.newGameSelectedUsers.map((u) => u.id).includes(p.id)
    )
    .sort((a, b) => {
      if (a == b) {
        return 0;
      }
      return a.displayName < b.displayName ? -1 : 1;
    });

  return [
    defaultPlayer,
    // Do not add current player if they're already selected in any field
    ...(currentPlayer.length > 0 &&
    state.newGameSelectedUsers?.map((u) => u.id).includes(currentPlayer[0].id)
      ? []
      : currentPlayer),
    ...otherPlayers,
  ];
}

export const getPlayers = memoize(_getPlayers);

function _playersValid(state: IAppState) {
  if (!state.newGameSelectedUsers) {
    return false;
  }

  const ids = state.newGameSelectedUsers.map((p) => p.id);

  // all players should have initialized ids
  if (ids.includes(DEFAULT_ID)) {
    return false;
  }

  // There must be Current Player
  if (!state.currentPlayerId || !ids.includes(state.currentPlayerId)) {
    return false;
  }

  // all players should be unique
  return uniq(ids, false, false).length == 4;
}

export const playersValid = memoize(_playersValid);
