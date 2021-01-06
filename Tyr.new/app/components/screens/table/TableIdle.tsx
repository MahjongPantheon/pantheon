import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {roundToString} from '#/components/helpers/Utils';
import {
  getOutcomeModalInfo, getPlayerBottomInfo,
  getPlayerLeftInfo,
  getPlayerRightInfo,
  getPlayerTopInfo, getBottomPanel
} from '#/components/screens/table/TableHelper';
import {TableScreenStateless} from '#/components/screens/table/base/TableScreenStateless';

export class TableIdle extends React.Component<IComponentProps> {
  render() {
    const {state, dispatch} = this.props;
    if (!state.players || state.players.length !== 4) {
      return null
    }

    const topPlayerInfo = getPlayerTopInfo(state, dispatch)
    const leftPlayerInfo = getPlayerLeftInfo(state, dispatch)
    const rightPlayerInfo = getPlayerRightInfo(state, dispatch)
    const bottomPlayerInfo = getPlayerBottomInfo(state, dispatch)

    const tableInfo = {
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

    const outcomeModalInfo = getOutcomeModalInfo(state, dispatch)
    const buttonPanelInfo = getBottomPanel(state, dispatch)

    return (
      <TableScreenStateless
        topPlayer={topPlayerInfo}
        leftPlayer={leftPlayerInfo}
        rightPlayer={rightPlayerInfo}
        bottomPlayer={bottomPlayerInfo}
        tableInfo={tableInfo}
        outcomeModal={outcomeModalInfo}
        bottomPanel={buttonPanelInfo}
      />
    );
  }
}
