import { IAppState } from '../interfaces';
import { memoize } from '#/primitives/memoize';
import { RegisteredPlayer } from '#/clients/atoms.pb';

const DEFAULT_ID = -1;
export const defaultPlayer: Readonly<RegisteredPlayer> = {
  id: DEFAULT_ID,
  title: '',
  tenhouId: '',
  ignoreSeating: false,
};

function _getPlayers(state: IAppState) {
  const players = [...(state.allPlayers ?? [])];
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
      return a.title < b.title ? -1 : 1;
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
