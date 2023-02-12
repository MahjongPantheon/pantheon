import React from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { GameInfo } from '#/components/general/game-info/GameInfo';
import { Toolbar } from '#/components/general/toolbar/Toolbar';

type BeforeStartProps = {
  topPlayer: {
    wind: string;
    displayName: string;
  };
  leftPlayer: {
    wind: string;
    displayName: string;
  };
  rightPlayer: {
    wind: string;
    displayName: string;
  };
  bottomPlayer: {
    wind: string;
    displayName: string;
  };

  topRotated: boolean;

  tableNumber?: number;

  timer?: string;

  onHomeClick: () => void;
  onRefreshClick: () => void;
};

export const BeforeStartScreenView: React.FC<BeforeStartProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    topRotated,
    tableNumber,
    timer,
    onHomeClick,
    onRefreshClick,
  } = props;

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name rotated={topRotated ? 180 : 0}>{topPlayer.displayName}</Player.Name>,
          <Player.StartWind rotated={topRotated ? 180 : 0}>{topPlayer.wind}</Player.StartWind>,
        ]}
        left={[
          <Player.Name rotated={90}>{leftPlayer.displayName}</Player.Name>,
          <Player.StartWind rotated={90}>{leftPlayer.wind}</Player.StartWind>,
        ]}
        center={
          <GameInfo>
            <GameInfo.TableNumber>{tableNumber}</GameInfo.TableNumber>
            {timer !== undefined && <GameInfo.StartInTimer>{timer}</GameInfo.StartInTimer>}
          </GameInfo>
        }
        right={[
          <Player.StartWind rotated={270}>{rightPlayer.wind}</Player.StartWind>,
          <Player.Name rotated={270}>{rightPlayer.displayName}</Player.Name>,
        ]}
        bottom={[
          <Player.StartWind>{bottomPlayer.wind}</Player.StartWind>,
          <Player.Name>{bottomPlayer.displayName}</Player.Name>,
        ]}
      />
      <GameScreen.Bottom>
        <Toolbar>
          <Toolbar.Home onClick={onHomeClick} />
          <Toolbar.Refresh onClick={onRefreshClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
