import * as React from 'react';
import {OutcomeTableMode} from '#/components/types/OutcomeTypes';
import {PlayerProps} from '#/components/general/players/PlayerProps';
import {TableScreen} from '#/components/screens/table/base/TableScreen';
import {TableMode} from '#/components/types/TableMode';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';

export type PlayerPropsExhaustiveDraw =  Pick<PlayerProps, 'name' | 'wind' | 'rotated' | 'winButtonMode' | 'riichiButtonMode' | 'showDeadButton'>

type IProps = {
  topPlayer: PlayerPropsExhaustiveDraw
  leftPlayer: PlayerPropsExhaustiveDraw
  rightPlayer: PlayerPropsExhaustiveDraw
  bottomPlayer: PlayerPropsExhaustiveDraw
  tableInfo: TableInfoProps
}

function getPlayer(player: PlayerPropsExhaustiveDraw): PlayerProps {
  return {
    ...player,
    inlineWind: true,
    points: undefined,
    pointsMode: undefined,
    loseButtonMode: undefined,
    penaltyPoints: undefined,
  }
}

export const TableExhaustiveDrawView = React.memo(function (props: IProps) {
  const {topPlayer, leftPlayer, rightPlayer, bottomPlayer, tableInfo} = props;

  return (
    <TableScreen
      topPlayer={getPlayer(topPlayer)}
      leftPlayer={getPlayer(leftPlayer)}
      rightPlayer={getPlayer(rightPlayer)}
      bottomPlayer={getPlayer(bottomPlayer)}
      tableMode={TableMode.SELECT_PLAYERS}
      outcomeMode={OutcomeTableMode.EXHAUSTIVE_DRAW}
      tableInfo={tableInfo}
    />
  );
})
