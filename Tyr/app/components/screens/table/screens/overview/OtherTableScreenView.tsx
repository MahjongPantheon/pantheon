import React from 'react';
import { GameInfo } from '#/components/general/game-info/GameInfo';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { Overview } from '#/components/screens/table/screens/overview/Overview';
import { PlayerData } from '#/components/screens/table/screens/types/PlayerData';

interface CurrentGameScreenProps {
  topPlayer: PlayerData;
  leftPlayer: PlayerData;
  rightPlayer: PlayerData;
  bottomPlayer: PlayerData;

  topRotated: boolean;

  round: string;
  riichiCount: number;
  honbaCount: number;

  diffById?: number;
  onScoreClick: (id: number) => void;

  onHomeClick: () => void;
  onRefreshClick: () => void;
  onLogClick: () => void;

  onRotateCwClick: () => void;
  onRotateCcwClick: () => void;
}

export const OtherTableScreenView: React.FC<CurrentGameScreenProps> = (props) => {
  const {
    round,
    riichiCount,
    honbaCount,
    onHomeClick,
    onRefreshClick,
    onLogClick,
    onRotateCwClick,
    onRotateCcwClick,
    ...restProps
  } = props;

  return (
    <Overview
      {...restProps}
      gameInfo={
        <GameInfo>
          <GameInfo.RotateControls onCwClick={onRotateCwClick} onCcwClick={onRotateCcwClick} />
          <GameInfo.Round>{round}</GameInfo.Round>
          <GameInfo.Honba value={honbaCount} />
          <GameInfo.Riichi value={riichiCount} />
        </GameInfo>
      }
      bottomBar={
        <Toolbar>
          <Toolbar.Home onClick={onHomeClick} />
          <Toolbar.Refresh onClick={onRefreshClick} />
          <Toolbar.Log onClick={onLogClick} />
        </Toolbar>
      }
    />
  );
};
