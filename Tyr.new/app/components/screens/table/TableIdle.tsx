import * as React from "react";
import {IComponentProps} from '#/components/IComponentProps';
import {PlayerPropsIdle, TableIdleView} from '#/components/screens/table/views/TableIdleView';
import {TableInfoProps} from '#/components/screens/table/base/TableInfo';
import {roundToString} from '#/components/helpers/Utils';
import {PlayerPointsMode} from '#/components/types/PlayerEnums';
import {
  getKamicha,
  getSeatKamicha,
  getSeatSelf,
  getSeatShimocha,
  getSeatToimen,
  getSelf, getShimocha, getToimen,
} from '#/store/selectors/roundPreviewSchemeSelectors';

export class TableIdle extends React.Component<IComponentProps> {

  render() {
    const {state} = this.props;
    if (!state.players || state.players.length !== 4) {
      return null
    }

    let topPlayer = getToimen(state, 'overview')
    let topPlayerInfo = {
      name: topPlayer.displayName,
      wind: getSeatToimen(state, 'overview'),
      points: topPlayer.score,
      penaltyPoints: topPlayer.penalties, //todo check
      pointsMode: PlayerPointsMode.IDLE, //todo check
      rotated: false, //todo singleDeviceMode
    } as PlayerPropsIdle;

    let leftPlayer = getKamicha(state, 'overview')
    let leftPlayerInfo = {
      name: leftPlayer.displayName,
      wind: getSeatKamicha(state, 'overview'),
      points: leftPlayer.score,
      penaltyPoints: leftPlayer.penalties,
      pointsMode: PlayerPointsMode.IDLE,
    } as PlayerPropsIdle;

    let rightPlayer = getShimocha(state, 'overview')
    let rightPlayerInfo = {
      name: rightPlayer.displayName,
      wind: getSeatShimocha(state, 'overview'),
      points: rightPlayer.score,
      penaltyPoints: rightPlayer.penalties,
      pointsMode: PlayerPointsMode.IDLE,
    } as PlayerPropsIdle;

    let bottomPlayer = getSelf(state, 'overview')
    let bottomPlayerInfo = {
      name: bottomPlayer.displayName,
      wind: getSeatSelf(state, 'overview'),
      points: bottomPlayer.score,
      penaltyPoints: bottomPlayer.penalties,
      pointsMode: PlayerPointsMode.IDLE,
    } as PlayerPropsIdle;

    let tableInfo = {
      showRoundInfo: true,
      showTableNumber: false,
      showTimer: false,
      gamesLeft: undefined,
      round: roundToString(state.currentRound),
      honbaCount: state.honba,
      riichiCount: state.riichiOnTable,
      currentTime: undefined,
      tableNumber: undefined,
    } as TableInfoProps;


    return (
      <TableIdleView
        topPlayer={topPlayerInfo}
        leftPlayer={leftPlayerInfo}
        rightPlayer={rightPlayerInfo}
        bottomPlayer={bottomPlayerInfo}
        tableInfo={tableInfo}
      />
    );
  }
}
