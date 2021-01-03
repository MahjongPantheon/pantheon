import * as React from 'react';
import './page-table.css'
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {ResultArrowsProps} from '#/components/general/result-arrows/ResultArrowsProps';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableScreenStateless} from '#/components/screens/table/base/TableScreenStateless';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {BottomPanelProps} from '#/components/general/bottom-panel/BottomPanelProps';
import {SelectModalProps} from '#/components/general/select-modal/SelectModal';

type IProps = {
  topPlayer: PlayerProps
  leftPlayer: PlayerProps
  rightPlayer: PlayerProps
  bottomPlayer: PlayerProps

  tableInfo: TableInfoProps
  arrowsInfo?: ResultArrowsProps
  outcomeModal?: SelectModalProps
  bottomPanel: BottomPanelProps
}

export class TableScreen extends React.Component<IProps> {
  render() {
    const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, outcomeModal, arrowsInfo, tableInfo, bottomPanel} = this.props;

    return (
      <>
        <TableScreenStateless
          topPlayer={topPlayer}
          leftPlayer={leftPlayer}
          rightPlayer={rightPlayer}
          bottomPlayer={bottomPlayer}
          tableInfo={tableInfo}
          bottomPanel={bottomPanel}
          arrowsInfo={arrowsInfo}
          outcomeModal={outcomeModal}
        />
      </>
    );
  }
}
