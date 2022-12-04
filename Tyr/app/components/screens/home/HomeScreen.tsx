import * as React from 'react';
import {IComponentProps} from '#/components/IComponentProps';
import {
  GET_OTHER_TABLES_LIST_INIT,
  GO_TO_CURRENT_GAME, GO_TO_DONATE,
  OPEN_SETTINGS,
  SHOW_LAST_RESULTS,
  START_NEW_GAME,
  UPDATE_CURRENT_GAMES_INIT,
} from '#/store/actions/interfaces';
import {HomeScreenView} from '#/components/screens/home/HomeScreenView';
import {Preloader} from '#/components/general/preloader/Preloader';
import {isLoading} from '#/store/selectors/screenConfirmationSelectors';
import {i18n} from "#/components/i18n";
import {I18nService} from "#/services/i18n";

export class HomeScreen extends React.PureComponent<IComponentProps> {
  static contextType = i18n;
  private onSettingClick() {
    this.props.dispatch({ type: OPEN_SETTINGS });
  }

  private onRefreshClick() {
    this.props.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
  }

  private onOtherTablesClick() {
    this.props.dispatch({ type: GET_OTHER_TABLES_LIST_INIT });
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
    const {gameConfig} = this.props.state;
    if (gameConfig) {
      window.open(`${(gameConfig.eventStatHost.startsWith('https://') || gameConfig.eventStatHost.startsWith('http://localhost:'))
        ? gameConfig.eventStatHost
        : 'https://' + gameConfig.eventStatHost}/last/`);
    }
  }

  private onDonateClick() {
    const {dispatch} = this.props;
    dispatch({ type: GO_TO_DONATE });
  }

  componentDidMount() {
    if (this.props.state.currentEventId) {
      const {dispatch} = this.props;
      dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
    }
  }

  render() {
    const {state} = this.props;
    const loc = this.context as I18nService;
    if (!state.gameConfig || isLoading(state)) {
      return <Preloader />;
    }

    const playerName = state.gameConfig.eventTitle || loc._t('Event title');

    // Show donate button only for russian locale and only for primary instance.
    // TODO: make this configurable
    const showDonate = this.props.state.settings.currentLang === 'ru' && (
      window.location.host.startsWith('localhost') || window.location.host === 'm.riichi.top'
    );

    return (
      <HomeScreenView
        eventName={playerName}
        canStartGame={!state.gameConfig.autoSeating && !state.isUniversalWatcher && !state.currentSessionHash && !state.gameConfig.isPrescripted}
        hasStartedGame={!!state.currentSessionHash && state.gameOverviewReady}
        hasPrevGame={!state.isUniversalWatcher /*&& state.lastResults !== undefined*/}
        canSeeOtherTables={true}
        showDonate={showDonate}
        hasStat={!!state.gameConfig.eventStatHost && !state.isUniversalWatcher}
        onDonateClick={this.onDonateClick.bind(this)}
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
