import * as React from 'react';
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableScreen} from '#/components/screens/table/base/TableScreen';
import {TableMode} from '#/components/types/TableMode';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {BottomPanelPropsBase} from '#/components/general/bottom-panel/BottomPanelProps';

export type PlayerPropsRon =  Pick<PlayerProps, 'name' | 'wind' | 'rotated' | 'winButtonMode' | 'loseButtonMode' | 'riichiButtonMode'>

type IProps = {
  topPlayer: PlayerPropsRon
  leftPlayer: PlayerPropsRon
  rightPlayer: PlayerPropsRon
  bottomPlayer: PlayerPropsRon
  tableInfo: TableInfoProps
  bottomPanelInfo: BottomPanelPropsBase
}

function getPlayer(player: PlayerPropsRon): PlayerProps {
  return {
    ...player,
    inlineWind: true,
    points: undefined,
    pointsMode: undefined,
    showDeadButton: false,
    penaltyPoints: undefined,
  }
}

export const TableRonView = React.memo(function (props: IProps) {
  const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, tableInfo, bottomPanelInfo} = props;

  return (
    <TableScreen
      topPlayer={getPlayer(topPlayer)}
      leftPlayer={getPlayer(leftPlayer)}
      rightPlayer={getPlayer(rightPlayer)}
      bottomPlayer={getPlayer(bottomPlayer)}
      tableMode={TableMode.SELECT_PLAYERS}
      outcomeMode={OutcomeTableMode.RON}
      tableInfo={tableInfo}
      bottomPanelInfo={bottomPanelInfo}
    />
  );
})
