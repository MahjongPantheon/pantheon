import * as React from 'react';
import {IComponentProps} from '#/components/IComponentProps';
import {OPEN_SETTINGS} from '#/store/actions/interfaces';
import {START_NEW_GAME, UPDATE_CURRENT_GAMES_INIT,
} from '../../../../../Tyr/src/app/services/store/actions/interfaces';
import {HomeScreenView} from '#/components/screens/home/HomeScreenView';

export class HomeScreen extends React.PureComponent<IComponentProps> {
  private onSettingClick() {
    const {dispatch} = this.props;
    dispatch({ type: OPEN_SETTINGS });
  }

  private onRefreshClick() {
    const {dispatch} = this.props;
    dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
  }

  private onOtherTablesClick() {
    const {dispatch} = this.props;
    //todo
  }

  private onPrevGameClick() {
    const {dispatch} = this.props;
    //todo
  }

  private onNewGameClick() {
    const {dispatch} = this.props;
    dispatch({ type: START_NEW_GAME });
  }

  private onCurrentGameClick() {
    const {dispatch} = this.props;
    //todo
  }

  private onStatClick() {
    const {dispatch} = this.props;
    //todo
  }

  render() {
    const {state} = this.props;
    if (!state.gameConfig) {
      return null;
    }

    const playerName = state.gameConfig.eventTitle || 'title';

    return (
      <HomeScreenView
        eventName={playerName}
        canStartGame={!state.gameConfig.autoSeating && !state.isUniversalWatcher}
        hasStartedGame={false}
        hasPrevGame={!state.isUniversalWatcher && state.lastResults !== undefined}
        canSeeOtherTables={true}
        hasStat={!!state.gameConfig.eventStatHost && !state.isUniversalWatcher}
        onSettingClick={this.onSettingClick.bind(this)}
        onRefreshClick={this.onRefreshClick.bind(this)}
        onOtherTablesClick={this.onOtherTablesClick.bind(this)}
        onPrevGameClick={this.onPrevGameClick.bind(this)}
        onNewGameClick={this.onNewGameClick.bind(this)}
        onCurrentGameClick={this.onCurrentGameClick.bind(this)}
        onStatClick={this.onStatClick.bind(this)}
      />
    )
  }
}
