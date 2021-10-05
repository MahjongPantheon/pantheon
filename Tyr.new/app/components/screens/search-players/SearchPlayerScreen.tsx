import * as React from "react";
import './page-search-player.css'
import {SearchPlayerView} from '#/components/screens/search-players/SearchPlayerView';
import {IComponentProps} from '#/components/IComponentProps';
import {
  SELECT_NEWGAME_PLAYER_WEST,
  SELECT_NEWGAME_PLAYER_NORTH,
  SELECT_NEWGAME_PLAYER_SOUTH,
  SELECT_NEWGAME_PLAYER_EAST,
  GOTO_PREV_SCREEN,
} from '#/store/actions/interfaces';
import {LUser} from '#/interfaces/local';
import {getPlayers} from '#/store/selectors/screenNewGameSelectors';

export class SearchPlayerScreen extends React.Component<IComponentProps> {
  private onUserClick(user: LUser) {
    const {dispatch, state} = this.props;
    if (state.newGameSelectedPlayerSide) {
      let actionType = ''
      switch (state.newGameSelectedPlayerSide) {
        case '東':
          actionType = SELECT_NEWGAME_PLAYER_EAST
          break;
        case '南':
          actionType = SELECT_NEWGAME_PLAYER_SOUTH
          break;
        case '西':
          actionType = SELECT_NEWGAME_PLAYER_WEST
          break;
        case '北':
          actionType = SELECT_NEWGAME_PLAYER_NORTH
          break;
      }
      dispatch({ type: actionType, payload: user.id})
    }

    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onBackClick() {
    this.props.dispatch({ type: GOTO_PREV_SCREEN });
  }

  render() {
    const {state} = this.props;
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
