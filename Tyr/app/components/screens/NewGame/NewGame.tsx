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
  CLEAR_NEWGAME_PLAYERS,
  GOTO_PREV_SCREEN,
  RANDOMIZE_NEWGAME_PLAYERS,
  SEARCH_PLAYER,
  START_GAME_INIT,
} from '../../../store/actions/interfaces';
import { Loader } from '../../base/Loader/Loader';
import { NewGame as NewGamePage } from '../../pages/NewGame/NewGame';

export const NewGame = (props: IComponentProps) => {
  const canSave = () => {
    if (!props.state.newGameSelectedUsers) {
      return false;
    }

    return props.state.newGameSelectedUsers.every((player) => player.id !== -1);
  };

  const onBackClick = () => {
    props.dispatch({ type: GOTO_PREV_SCREEN });
  };

  const onShuffleClick = () => {
    props.dispatch({ type: RANDOMIZE_NEWGAME_PLAYERS });
  };

  const onSaveClick = () => {
    const { dispatch, state } = props;
    if (canSave() && state.newGameSelectedUsers) {
      dispatch({ type: START_GAME_INIT, payload: state.newGameSelectedUsers.map((p) => p.id) });
    }
  };

  const onPlayerClick = (side: string) => {
    props.dispatch({ type: SEARCH_PLAYER, payload: side });
  };

  const onClearClick = () => {
    props.dispatch({ type: CLEAR_NEWGAME_PLAYERS });
  };

  if (
    !props.state.newGameSelectedUsers ||
    props.state.newGameSelectedUsers.length !== 4 ||
    props.state.loading.players
  ) {
    return <Loader />;
  }

  return (
    <NewGamePage
      east={props.state.newGameSelectedUsers[0].title}
      south={props.state.newGameSelectedUsers[1].title}
      west={props.state.newGameSelectedUsers[2].title}
      north={props.state.newGameSelectedUsers[3].title}
      canSave={canSave()}
      onBackClick={onBackClick}
      onShuffleClick={onShuffleClick}
      onSaveClick={onSaveClick}
      onClearClick={onClearClick}
      onPlayerClick={onPlayerClick}
    />
  );
};
