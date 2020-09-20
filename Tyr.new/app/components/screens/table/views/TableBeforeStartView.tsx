import * as React from "react";
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableScreen} from '#/components/screens/table/base/TableScreen';
import {TableMode} from '#/components/types/TableMode';
import {BottomPanelPropsBase} from '#/components/general/bottom-panel/BottomPanelProps';

export type PlayerPropsBeforeStart =  Pick<PlayerProps, 'name' | 'wind' | 'rotated'>

type IProps = {
  topPlayer: PlayerPropsBeforeStart
  leftPlayer: PlayerPropsBeforeStart
  rightPlayer: PlayerPropsBeforeStart
  bottomPlayer: PlayerPropsBeforeStart
  tableNumber: number
  bottomPanelInfo: BottomPanelPropsBase
}

function getPlayer(player: PlayerPropsBeforeStart): PlayerProps {
  return {
    ...player,
    inlineWind: false,
    points: undefined,
    pointsMode: undefined,
    winButtonMode: undefined,
    loseButtonMode: undefined,
    riichiButtonMode: undefined,
    showDeadButton: false,
    penaltyPoints: undefined,
  }
}

export const TableBeforeStartView = React.memo(function (props: IProps) {
  const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, tableNumber, bottomPanelInfo} = props;
  const tableInfo = {
    showTableNumber: true,
    tableNumber: tableNumber,
  }

  return (
    <TableScreen
      topPlayer={getPlayer(topPlayer)}
      leftPlayer={getPlayer(leftPlayer)}
      rightPlayer={getPlayer(rightPlayer)}
      bottomPlayer={getPlayer(bottomPlayer)}
      tableMode={TableMode.BEFORE_START}
      tableInfo={tableInfo}
      bottomPanelInfo={bottomPanelInfo}
    />
  );
})
