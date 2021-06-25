import * as React from 'react';
import {IComponentProps} from '#/components/IComponentProps';
import {
  GO_TO_CURRENT_GAME,
  OPEN_SETTINGS,
  SHOW_LAST_RESULTS,
  START_NEW_GAME,
  UPDATE_CURRENT_GAMES_INIT,
} from '#/store/actions/interfaces';
import {HomeScreenView} from '#/components/screens/home/HomeScreenView';
import {Preloader} from '#/components/general/preloader/Preloader';

export class HomeScreen extends React.PureComponent<IComponentProps> {
  private onSettingClick() {
    this.props.dispatch({ type: OPEN_SETTINGS });
  }

  private onRefreshClick() {
    this.props.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
  }

  private onOtherTablesClick() {
    const {dispatch} = this.props;
    //todo
  }

  private onPrevGameClick() {
    this.props.dispatch({ type: SHOW_LAST_RESULTS });
  }

  private onNewGameClick() {
    this.props.dispatch({ type: START_NEW_GAME });
  }

  private onCurrentGameClick() {
    const {dispatch} = this.props;
    dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    dispatch({ type: GO_TO_CURRENT_GAME });
  }

  private onStatClick() {
    const {dispatch} = this.props;
    //todo
  }

  render() {
    const {state} = this.props;
    if (!state.gameConfig || !state.gameOverviewReady) {
      return <Preloader />;
    }

    const playerName = state.gameConfig.eventTitle || 'title';

    return (
      <HomeScreenView
        eventName={playerName}
        canStartGame={!state.gameConfig.autoSeating && !state.isUniversalWatcher && !state.currentSessionHash}
        hasStartedGame={!!state.currentSessionHash}
        hasPrevGame={!state.isUniversalWatcher /*&& state.lastResults !== undefined*/}
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
