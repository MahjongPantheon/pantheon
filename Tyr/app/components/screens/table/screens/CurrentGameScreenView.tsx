import React from 'react';
import { GameInfo } from '#/components/general/game-info/GameInfo';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { Overview } from '#/components/screens/table/screens/Overview';
import { PlayerData } from '#/components/screens/table/screens/types/PlayerData';

interface CurrentGameScreenProps {
  topPlayer: PlayerData;
  leftPlayer: PlayerData;
  rightPlayer: PlayerData;
  bottomPlayer: PlayerData;

  round: string;
  riichiCount: number;
  honbaCount: number;

  diffById?: number;
  onScoreClick: (id: number) => void;

  onHomeClick: () => void;
  onAddClick: () => void;
  onRefreshClick: () => void;
  onLogClick: () => void;
}

export const CurrentGameScreenView: React.FC<CurrentGameScreenProps> = (props) => {
  const {
    round,
    riichiCount,
    honbaCount,
    onHomeClick,
    onAddClick,
    onRefreshClick,
    onLogClick,
    ...restProps
  } = props;

  return (
    <Overview
      {...restProps}
      gameInfo={
        <GameInfo>
          <GameInfo.Round>{round}</GameInfo.Round>
          <GameInfo.Honba value={honbaCount} />
          <GameInfo.Riichi value={riichiCount} />
        </GameInfo>
      }
      bottomBar={
        <>
          {/* todo add modal */}
          <Toolbar>
            <Toolbar.Home onClick={onHomeClick} />
            <Toolbar.Refresh onClick={onRefreshClick} />
            <Toolbar.Plus onClick={onAddClick} />
            <Toolbar.Log onClick={onLogClick} />
          </Toolbar>
        </>
      }
    />
  );
};
