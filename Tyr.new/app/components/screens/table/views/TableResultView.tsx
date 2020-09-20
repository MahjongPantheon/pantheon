import * as React from 'react';
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {ResultArrowsProps} from '#/components/general/result-arrows/ResultArrowsProps';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableScreen} from '#/components/screens/table/base/TableScreen';
import {TableMode} from '#/components/types/TableMode';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {BottomPanelPropsBase} from '#/components/general/bottom-panel/BottomPanelProps';

export type PlayerPropsResult =  Pick<PlayerProps, 'name' | 'wind' | 'rotated' | 'points' | 'pointsMode' | 'showInlineRiichi'>

type IProps = {
  topPlayer: PlayerPropsResult
  leftPlayer: PlayerPropsResult
  rightPlayer: PlayerPropsResult
  bottomPlayer: PlayerPropsResult
  tableInfo: TableInfoProps
  arrowsInfo?: ResultArrowsProps
  bottomPanelInfo: BottomPanelPropsBase
}

function getPlayer(player: PlayerPropsResult): PlayerProps {
  return {
    ...player,
    inlineWind: true,
    winButtonMode: undefined,
    loseButtonMode: undefined,
    riichiButtonMode: undefined,
    showDeadButton: false,
    penaltyPoints: undefined,
  }
}

export const TableResultView = React.memo(function (props: IProps) {
  const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, tableInfo, arrowsInfo, bottomPanelInfo} = props;

  return (
    <TableScreen
      topPlayer={getPlayer(topPlayer)}
      leftPlayer={getPlayer(leftPlayer)}
      rightPlayer={getPlayer(rightPlayer)}
      bottomPlayer={getPlayer(bottomPlayer)}
      tableMode={TableMode.RESULT}
      outcomeMode={OutcomeTableMode.RON}
      tableInfo={tableInfo}
      arrowsInfo={arrowsInfo}
      bottomPanelInfo={bottomPanelInfo}
    />
  );
})
