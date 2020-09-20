import * as React from 'react';
import './page-table.css'
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {ResultArrowsProps} from '#/components/general/result-arrows/ResultArrowsProps';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableMode} from '#/components/types/TableMode';
import {TableScreenStateless} from '#/components/screens/table/base/TableScreenStateless';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {BottomPanelProps, BottomPanelPropsBase} from '#/components/general/bottom-panel/BottomPanelProps';
import {SelectModalProps} from '#/components/general/select-modal/SelectModal';

type IProps = {
  tableMode: TableMode
  outcomeMode?: OutcomeTableMode

  topPlayer: PlayerProps
  leftPlayer: PlayerProps
  rightPlayer: PlayerProps
  bottomPlayer: PlayerProps

  tableInfo: TableInfoProps
  arrowsInfo?: ResultArrowsProps
  bottomPanelInfo: BottomPanelPropsBase
  outcomeModal?: SelectModalProps
}

export class TableScreen extends React.Component<IProps> {
  getBottomPanel(): BottomPanelProps {
    const {tableMode, outcomeMode, bottomPanelInfo} = this.props;

    let text = outcomeMode;
    let showBack = tableMode === TableMode.SELECT_PLAYERS || tableMode ===  TableMode.RESULT;
    let showNext = tableMode === TableMode.SELECT_PLAYERS;
    let isNextDisabled = bottomPanelInfo.isNextDisabled;
    let showSave = tableMode === TableMode.RESULT;
    let isSaveDisabled = bottomPanelInfo.isSaveDisabled;

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
      onNextClick: bottomPanelInfo.onNextClick,
      onBackClick: bottomPanelInfo.onBackClick,
      onSaveClick: bottomPanelInfo.onSaveClick,
      onLogClick: bottomPanelInfo.onLogClick,
      onAddClick: bottomPanelInfo.onAddClick,
      onHomeClick: bottomPanelInfo.onHomeClick,
      onRefreshClick: bottomPanelInfo.onRefreshClick,
    };
  }

  render() {
    const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, outcomeModal, arrowsInfo, tableInfo} = this.props;

    return (
      <>
        <TableScreenStateless
          topPlayer={topPlayer}
          leftPlayer={leftPlayer}
          rightPlayer={rightPlayer}
          bottomPlayer={bottomPlayer}
          tableInfo={tableInfo}
          bottomPanel={this.getBottomPanel()}
          arrowsInfo={arrowsInfo}
          outcomeModal={outcomeModal}
        />
      </>
    );
  }
}
