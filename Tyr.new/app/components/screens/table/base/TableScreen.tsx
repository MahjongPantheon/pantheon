import * as React from 'react';
import './page-table.css'
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {ResultArrowsProps} from '#/components/general/result-arrows/ResultArrowsProps';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableMode} from '#/components/types/TableMode';
import {TableScreenStateless} from '#/components/screens/table/base/TableScreenStateless';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';

type IProps = {
  tableMode: TableMode
  outcomeMode?: OutcomeTableMode

  topPlayer: PlayerProps
  leftPlayer: PlayerProps
  rightPlayer: PlayerProps
  bottomPlayer: PlayerProps

  selectOutcome?: boolean

  tableInfo: TableInfoProps
  arrowsInfo?: ResultArrowsProps
}

export class TableScreen extends React.Component<IProps> {
  getBottomPanel() {
    const {tableMode, outcomeMode} = this.props;

    let text = outcomeMode;
    let showBack = tableMode === TableMode.SELECT_PLAYERS || tableMode ===  TableMode.RESULT;
    let showNext = tableMode === TableMode.SELECT_PLAYERS;
    let isNextDisabled = true;
    let showSave = tableMode === TableMode.RESULT;
    let isSaveDisabled = true;

    let showHome = [TableMode.GAME, TableMode.BEFORE_START, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);
    let showRefresh = [TableMode.GAME, TableMode.BEFORE_START, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);
    let showAdd = tableMode === TableMode.GAME;
    let showLog = [TableMode.GAME, TableMode.OTHER_PLAYER_TABLE].includes(tableMode);

    return {
      text: text,
      showBack: showBack,
      showNext: showNext,
      isNextDisabled: isNextDisabled,
      showHome: showHome,
      showRefresh: showRefresh,
      showAdd: showAdd,
      showLog: showLog,
      showSave: showSave,
      isSaveDisabled: isSaveDisabled,
    };
  }

  render() {
    const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, selectOutcome, arrowsInfo, tableInfo} = this.props;

    return (
      <>
        <TableScreenStateless
          topPlayer={topPlayer}
          leftPlayer={leftPlayer}
          rightPlayer={rightPlayer}
          bottomPlayer={bottomPlayer}
          tableInfo={tableInfo}
          bottomPanel={this.getBottomPanel()}
          showOutcomeModal={selectOutcome}
          arrowsInfo={arrowsInfo}
        />
      </>
    );
  }
}
