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

import { IAppState } from '../interfaces';
import { memoize } from '../../helpers/memoize';
import { RegisteredPlayer } from 'tsclients/proto/atoms.pb';

const DEFAULT_ID = -1;
export const defaultPlayer: Readonly<RegisteredPlayer> = {
  id: DEFAULT_ID,
  title: '',
  tenhouId: '',
  ignoreSeating: false,
  hasAvatar: false,
  lastUpdate: '',
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
