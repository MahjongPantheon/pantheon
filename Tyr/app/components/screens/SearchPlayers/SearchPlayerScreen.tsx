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

import { IComponentProps } from '../../IComponentProps';
import {
  SELECT_NEWGAME_PLAYER_WEST,
  SELECT_NEWGAME_PLAYER_NORTH,
  SELECT_NEWGAME_PLAYER_SOUTH,
  SELECT_NEWGAME_PLAYER_EAST,
  GOTO_PREV_SCREEN,
  GET_ALL_PLAYERS_INIT,
} from '../../../store/actions/interfaces';
import { getPlayers } from '../../../store/selectors/newGame';
import { RegisteredPlayer } from 'tsclients/proto/atoms.pb';
import { useEffect } from 'react';
import { PlayersSearch } from '../../pages/PlayersSearch/PlayersSearch';

export const SearchPlayerScreen = (props: IComponentProps) => {
  useEffect(() => {
    props.dispatch({ type: GET_ALL_PLAYERS_INIT });
  }, []);

  const onUserClick = (user: RegisteredPlayer) => {
    if (props.state.newGameSelectedPlayerSide) {
      let actionType = '';
      switch (props.state.newGameSelectedPlayerSide) {
        case '東':
          actionType = SELECT_NEWGAME_PLAYER_EAST;
          break;
        case '南':
          actionType = SELECT_NEWGAME_PLAYER_SOUTH;
          break;
        case '西':
          actionType = SELECT_NEWGAME_PLAYER_WEST;
          break;
        case '北':
          actionType = SELECT_NEWGAME_PLAYER_NORTH;
          break;
      }
      props.dispatch({ type: actionType, payload: user.id });
    }

    props.dispatch({ type: GOTO_PREV_SCREEN });
  };

  const onBackClick = () => {
    props.dispatch({ type: GOTO_PREV_SCREEN });
  };

  const possiblePlayers = getPlayers(props.state) || [];

  return (
    <PlayersSearch users={possiblePlayers} onUserClick={onUserClick} onBackClick={onBackClick} />
  );
};
