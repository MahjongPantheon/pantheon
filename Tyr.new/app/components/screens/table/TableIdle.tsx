import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {roundToString} from '#/components/helpers/Utils';
import {BottomPanelPropsBase} from '#/components/general/bottom-panel/BottomPanelProps';
import {GOTO_NEXT_SCREEN, GOTO_PREV_SCREEN, UPDATE_CURRENT_GAMES_INIT} from '#/store/actions/interfaces';
import {
  getOutcomeModalInfo, getPlayerBottomInfo,
  getPlayerLeftInfo,
  getPlayerRightInfo,
  getPlayerTopInfo,
} from '#/components/screens/table/TableHelper';
import {TableMode} from '#/components/types/TableMode';
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {TableScreen} from '#/components/screens/table/base/TableScreen';

export class TableIdle extends React.Component<IComponentProps> {
  private onLogClick() {
    //todo
  }

  private onAddClick() {
    const {state, dispatch} = this.props
    if (state.currentScreen === 'currentGame') {
      dispatch({ type: GOTO_NEXT_SCREEN });
    } else if (state.currentScreen === 'outcomeSelect') {
      dispatch({ type: GOTO_PREV_SCREEN });
    }
  }

  private onHomeClick() {
    this.props.dispatch({ type: GOTO_PREV_SCREEN });
  }

  private onRefreshClick() {
    this.props.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
  }

  render() {
    const {state, dispatch} = this.props;
    if (!state.players || state.players.length !== 4) {
      return null
    }

    let topPlayerInfo = getPlayerTopInfo(state)
    let leftPlayerInfo = getPlayerLeftInfo(state)
    let rightPlayerInfo = getPlayerRightInfo(state)
    let bottomPlayerInfo = getPlayerBottomInfo(state)

    let tableInfo = {
      showRoundInfo: true,
      showTableNumber: false,
      showTimer: false,
      gamesLeft: undefined,
      round: roundToString(state.currentRound),
      honbaCount: state.honba,
      riichiCount: state.riichiOnTable,
      currentTime: undefined,
      tableNumber: undefined,
    } as TableInfoProps;

    let bottomPanelInfo =  {
      onLogClick: this.onLogClick.bind(this),
      onAddClick: this.onAddClick.bind(this),
      onHomeClick: this.onHomeClick.bind(this),
      onRefreshClick: this.onRefreshClick.bind(this),
    } as BottomPanelPropsBase;

    const outcomeModalInfo = getOutcomeModalInfo(state, dispatch)
    const tableMode = state.currentScreen === 'currentGame' ? TableMode.GAME : TableMode.SELECT_PLAYERS
    const outcomeMode = state.currentScreen === 'currentGame' ? undefined: OutcomeTableMode.RON

    return (
      <TableScreen
        topPlayer={topPlayerInfo}
        leftPlayer={leftPlayerInfo}
        rightPlayer={rightPlayerInfo}
        bottomPlayer={bottomPlayerInfo}
        tableInfo={tableInfo}
        bottomPanelInfo={bottomPanelInfo}
        outcomeModal={outcomeModalInfo}
        tableMode={tableMode}
        outcomeMode={outcomeMode}
      />
    );
  }
}
