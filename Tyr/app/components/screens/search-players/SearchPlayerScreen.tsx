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

import * as React from 'react';
import './page-search-player.css';
import { SearchPlayerView } from '#/components/screens/search-players/SearchPlayerView';
import { IComponentProps } from '#/components/IComponentProps';
import {
  SELECT_NEWGAME_PLAYER_WEST,
  SELECT_NEWGAME_PLAYER_NORTH,
  SELECT_NEWGAME_PLAYER_SOUTH,
  SELECT_NEWGAME_PLAYER_EAST,
  GOTO_PREV_SCREEN,
  GET_ALL_PLAYERS_INIT,
} from '#/store/actions/interfaces';
import { getPlayers } from '#/store/selectors/screenNewGameSelectors';
import { RegisteredPlayer } from '#/clients/proto/atoms.pb';

export class SearchPlayerScreen extends React.Component<IComponentProps> {
  private onUserClick(user: RegisteredPlayer) {
    const { dispatch, state } = this.props;
    if (state.newGameSelectedPlayerSide) {
      let actionType = '';
      switch (state.newGameSelectedPlayerSide) {
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
      dispatch({ type: actionType, payload: user.id });
    }

    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onBackClick() {
    this.props.dispatch({ type: GOTO_PREV_SCREEN });
  }

  componentDidMount() {
    this.props.dispatch({ type: GET_ALL_PLAYERS_INIT });
  }

  render() {
    const { state } = this.props;
    const possiblePlayers = getPlayers(state) || [];

    return (
      <SearchPlayerView
        users={possiblePlayers}
        onUserClick={this.onUserClick.bind(this)}
        onBackClick={this.onBackClick.bind(this)}
      />
    );
  }
}
