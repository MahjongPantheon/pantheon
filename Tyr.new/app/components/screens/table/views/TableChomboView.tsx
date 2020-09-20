import * as React from 'react';
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableScreen} from '#/components/screens/table/base/TableScreen';
import {TableMode} from '#/components/types/TableMode';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {BottomPanelPropsBase} from '#/components/general/bottom-panel/BottomPanelProps';

export type PlayerPropsChombo =  Pick<PlayerProps, 'name' | 'wind' | 'rotated' | 'loseButtonMode'>

type IProps = {
  topPlayer: PlayerPropsChombo
  leftPlayer: PlayerPropsChombo
  rightPlayer: PlayerPropsChombo
  bottomPlayer: PlayerPropsChombo
  tableInfo: TableInfoProps
  bottomPanelInfo: BottomPanelPropsBase
}

function getPlayer(player: PlayerPropsChombo): PlayerProps {
  return {
    ...player,
    inlineWind: true,
    points: undefined,
    pointsMode: undefined,
    winButtonMode: undefined,
    riichiButtonMode: undefined,
    showDeadButton: false,
    penaltyPoints: undefined,
  }
}

export const TableChomboView = React.memo(function (props: IProps) {
  const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, tableInfo, bottomPanelInfo} = props;

  return (
    <TableScreen
      topPlayer={getPlayer(topPlayer)}
      leftPlayer={getPlayer(leftPlayer)}
      rightPlayer={getPlayer(rightPlayer)}
      bottomPlayer={getPlayer(bottomPlayer)}
      tableMode={TableMode.SELECT_PLAYERS}
      outcomeMode={OutcomeTableMode.CHOMBO}
      tableInfo={tableInfo}
      bottomPanelInfo={bottomPanelInfo}
    />
  );
})
