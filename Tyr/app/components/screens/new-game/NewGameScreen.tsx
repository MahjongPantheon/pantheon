import * as React from 'react';
import { IComponentProps } from '#/components/IComponentProps';
import {
  CLEAR_NEWGAME_PLAYERS,
  GOTO_PREV_SCREEN,
  RANDOMIZE_NEWGAME_PLAYERS,
  SEARCH_PLAYER,
  START_GAME_INIT,
} from '#/store/actions/interfaces';
import { NewGameScreenView } from '#/components/screens/new-game/NewGameScreenView';
import { Preloader } from '#/components/general/preloader/Preloader';

export class NewGameScreen extends React.PureComponent<IComponentProps> {
  private onBackClick() {
    this.props.dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onShuffleClick() {
    this.props.dispatch({ type: RANDOMIZE_NEWGAME_PLAYERS });
  }

  private onSaveClick() {
    const { dispatch, state } = this.props;
    if (this.canSave && state.newGameSelectedUsers) {
      dispatch({ type: START_GAME_INIT, payload: state.newGameSelectedUsers.map((p) => p.id) });
    }
  }

  private onPlayerClick(side: string) {
    this.props.dispatch({ type: SEARCH_PLAYER, payload: side });
  }

  private onClearClick() {
    this.props.dispatch({ type: CLEAR_NEWGAME_PLAYERS });
  }

  private get canSave() {
    const { state } = this.props;
    if (!state.newGameSelectedUsers) {
      return false;
    }

    return state.newGameSelectedUsers.every((player) => player.id !== -1);
  }

  render() {
    const { state } = this.props;
    if (
      !state.newGameSelectedUsers ||
      state.newGameSelectedUsers.length !== 4 ||
      state.loading.players
    ) {
      return <Preloader />;
    }

    return (
      <NewGameScreenView
        east={state.newGameSelectedUsers[0].displayName}
        south={state.newGameSelectedUsers[1].displayName}
        west={state.newGameSelectedUsers[2].displayName}
        north={state.newGameSelectedUsers[3].displayName}
        canSave={this.canSave}
        onBackClick={this.onBackClick.bind(this)}
        onShuffleClick={this.onShuffleClick.bind(this)}
        onSaveClick={this.onSaveClick.bind(this)}
        onClearClick={this.onClearClick.bind(this)}
        onPlayerClick={this.onPlayerClick.bind(this)}
      />
    );
  }
}
