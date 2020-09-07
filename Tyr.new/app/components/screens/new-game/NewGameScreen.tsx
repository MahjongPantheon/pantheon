import * as React from 'react';
import {IComponentProps} from '#/components/IComponentProps';
import {GOTO_PREV_SCREEN, SETTINGS_SAVE_LANG, SETTINGS_SAVE_THEME} from '#/store/actions/interfaces';
import {NewGameScreenView} from '#/components/screens/new-game/NewGameScreenView';

export class NewGameScreen extends React.PureComponent<IComponentProps>{
  private onBackClick() {
    const {dispatch} = this.props;
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onShuffleClick() {
    const {dispatch} = this.props;
    //todo
  }

  private onSaveClick() {
    const {dispatch} = this.props;
    if (this.canSave) {
      //todo
    }
  }

  private onPlayerClick(index: number) {

  }

  private get canSave() {
    const {state} = this.props;
    if (!state.newGameSelectedUsers) {
      return false;
    }

    state.allPlayers

    return state.newGameSelectedUsers.every(player => player.id !== -1)
  }

  render() {
    const {state} = this.props;
    if (!state.newGameSelectedUsers || state.newGameSelectedUsers.length !== 4) {
      return null;
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
        onPlayerClick={this.onPlayerClick.bind(this)}
      />
    )
  }
}
