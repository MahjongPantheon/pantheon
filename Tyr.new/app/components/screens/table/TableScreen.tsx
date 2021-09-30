import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {
  getOutcomeModalInfo, getPlayerBottomInfo,
  getPlayerLeftInfo,
  getPlayerRightInfo,
  getPlayerTopInfo, getBottomPanel, getArrowsInfo, getTableInfo,
} from '#/components/screens/table/TableHelper';
import {TableScreenStateless} from '#/components/screens/table/base/TableScreenStateless';
import {Preloader} from '#/components/general/preloader/Preloader';

export class TableScreen extends React.Component<IComponentProps> {

  render() {
    const {state, dispatch} = this.props;
    const isLoading = state.loading.events
      || (state.currentScreen === 'overview' && !state.gameOverviewReady)
      || state.loading.addRound
      || state.loading.overview;
    if (!state.players || state.players.length !== 4 || isLoading) {
      return <Preloader />
    }

    const topPlayerInfo = getPlayerTopInfo(state, dispatch);
    const leftPlayerInfo = getPlayerLeftInfo(state, dispatch);
    const rightPlayerInfo = getPlayerRightInfo(state, dispatch);
    const bottomPlayerInfo = getPlayerBottomInfo(state, dispatch);

    const tableInfo = getTableInfo(state, dispatch);

    const outcomeModalInfo = getOutcomeModalInfo(state, dispatch);
    const buttonPanelInfo = getBottomPanel(state, dispatch);

    const arrowsInfo = getArrowsInfo(state);

    return (
      <TableScreenStateless
        topPlayer={topPlayerInfo}
        leftPlayer={leftPlayerInfo}
        rightPlayer={rightPlayerInfo}
        bottomPlayer={bottomPlayerInfo}
        tableInfo={tableInfo}
        arrowsInfo={arrowsInfo}
        outcomeModal={outcomeModalInfo}
        bottomPanel={buttonPanelInfo}
      />
    );
  }
}
