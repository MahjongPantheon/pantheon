import React from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { PlayerData } from '#/components/screens/table/screens/types/PlayerData';
import { usePlayerScores } from '#/components/screens/table/screens/overview/usePlayerScores';

interface CurrentGameScreenProps {
  topPlayer: PlayerData;
  leftPlayer: PlayerData;
  rightPlayer: PlayerData;
  bottomPlayer: PlayerData;

  topRotated: boolean;

  diffById?: number;
  onScoreClick: (id: number) => void;

  gameInfo: JSX.Element;
  bottomBar: JSX.Element;
}

export const Overview: React.FC<CurrentGameScreenProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    topRotated,
    diffById,
    onScoreClick,
    gameInfo,
    bottomBar,
  } = props;

  const [topScoreElement, leftScoreElement, rightScoreElement, bottomScoreElement] =
    usePlayerScores(
      topPlayer,
      leftPlayer,
      rightPlayer,
      bottomPlayer,
      topRotated,
      diffById,
      onScoreClick
    );

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name inlineWind={topPlayer.wind} rotated={topRotated ? 180 : 0}>
            {topPlayer.displayName}
          </Player.Name>,
          topScoreElement,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          leftScoreElement,
        ]}
        center={gameInfo}
        right={[
          rightScoreElement,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          bottomScoreElement,
          <Player.Name inlineWind={bottomPlayer.wind}>{bottomPlayer.displayName}</Player.Name>,
        ]}
      />
      <GameScreen.Bottom>{bottomBar}</GameScreen.Bottom>
    </GameScreen>
  );
};
