import * as React from 'react';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableScreen} from '#/components/screens/table/base/TableScreen';
import {TableMode} from '#/components/types/TableMode';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {BottomPanelPropsBase} from '#/components/general/bottom-panel/BottomPanelProps';
import {SelectModalProps} from '#/components/general/select-modal/SelectModal';

export type PlayerPropsIdle =  Pick<PlayerProps, 'name' | 'wind' | 'rotated' | 'points' | 'pointsMode' | 'penaltyPoints'>

type IProps = {
  topPlayer: PlayerPropsIdle
  leftPlayer: PlayerPropsIdle
  rightPlayer: PlayerPropsIdle
  bottomPlayer: PlayerPropsIdle
  tableInfo: TableInfoProps
  bottomPanelInfo: BottomPanelPropsBase
  outcomeModal?: SelectModalProps
}

function getPlayer(player: PlayerPropsIdle): PlayerProps {
  return {
    ...player,
    inlineWind: true,
    winButtonMode: undefined,
    loseButtonMode: undefined,
    riichiButtonMode: undefined,
    showDeadButton: false,
  }
}


export const TableIdleView = React.memo(function (props: IProps) {
  const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, tableInfo, outcomeModal, bottomPanelInfo} = props;

  return (
    <TableScreen
      topPlayer={getPlayer(topPlayer)}
      leftPlayer={getPlayer(leftPlayer)}
      rightPlayer={getPlayer(rightPlayer)}
      bottomPlayer={getPlayer(bottomPlayer)}
      tableMode={TableMode.GAME}
      tableInfo={tableInfo}
      bottomPanelInfo={bottomPanelInfo}
      outcomeModal={outcomeModal}
    />
  );
})
