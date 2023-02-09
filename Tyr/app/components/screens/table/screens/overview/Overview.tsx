import React, { useCallback } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { StatusProps } from '#/components/general/player/partials/Status';
import { PlayerData } from '#/components/screens/table/screens/types/PlayerData';
import { Penalty } from '#/components/general/player/partials/Penalty';

function getDiffScore(
  topPlayer: PlayerData,
  leftPlayer: PlayerData,
  rightPlayer: PlayerData,
  bottomPlayer: PlayerData,
  diffById: number | undefined
) {
  switch (diffById) {
    case topPlayer.id:
      return topPlayer.score;
    case leftPlayer.id:
      return leftPlayer.score;
    case rightPlayer.id:
      return rightPlayer.score;
    case bottomPlayer.id:
      return bottomPlayer.score;
    default:
      return undefined;
  }
}

type ScoreMode = StatusProps['variant'];

type ScoreInfo = {
  value: string;
  mode: ScoreMode;
};

function getScoreData(score: number, diffScore: number | undefined): ScoreInfo {
  if (diffScore === undefined) {
    return {
      value: score.toString(),
      mode: 'idle',
    };
  }

  const points = score - diffScore;

  const value = points > 0 ? `+${points}` : points.toString();

  const mode: ScoreMode = points > 0 ? 'success' : points < 0 ? 'danger' : 'active';

  return {
    value,
    mode,
  };
}

export function usePlayerScores(
  topPlayer: PlayerData,
  leftPlayer: PlayerData,
  rightPlayer: PlayerData,
  bottomPlayer: PlayerData,
  diffById: number | undefined,
  onScoreClick: (id: number) => void
): [JSX.Element, JSX.Element, JSX.Element, JSX.Element] {
  const onTopScoreClick = useCallback(() => {
    onScoreClick(topPlayer.id);
  }, [onScoreClick, topPlayer.id]);

  const onLeftScoreClick = useCallback(() => {
    onScoreClick(leftPlayer.id);
  }, [onScoreClick, leftPlayer.id]);

  const onRightScoreClick = useCallback(() => {
    onScoreClick(rightPlayer.id);
  }, [onScoreClick, rightPlayer.id]);

  const onBottomScoreClick = useCallback(() => {
    onScoreClick(bottomPlayer.id);
  }, [onScoreClick, bottomPlayer.id]);

  const diffScore = getDiffScore(topPlayer, leftPlayer, rightPlayer, bottomPlayer, diffById);

  const topScore = getScoreData(topPlayer.score, diffScore);
  const leftScore = getScoreData(leftPlayer.score, diffScore);
  const rightScore = getScoreData(rightPlayer.score, diffScore);
  const bottomScore = getScoreData(bottomPlayer.score, diffScore);

  const topPenalty =
    topPlayer.penalties !== 0 ? <Penalty>{topPlayer.penalties}</Penalty> : undefined;
  const leftPenalty =
    leftPlayer.penalties !== 0 ? <Penalty rotated={90}>{leftPlayer.penalties}</Penalty> : undefined;
  const rightPenalty =
    rightPlayer.penalties !== 0 ? (
      <Penalty rotated={270}>{rightPlayer.penalties}</Penalty>
    ) : undefined;
  const bottomPenalty =
    bottomPlayer.penalties !== 0 ? <Penalty>{bottomPlayer.penalties}</Penalty> : undefined;

  return [
    <Player.Status variant={topScore.mode} after={topPenalty} onClick={onTopScoreClick}>
      {topScore.value}
    </Player.Status>,
    <Player.Status
      variant={leftScore.mode}
      rotated={90}
      after={leftPenalty}
      onClick={onLeftScoreClick}
    >
      {leftScore.value}
    </Player.Status>,
    <Player.Status
      variant={rightScore.mode}
      rotated={270}
      after={rightPenalty}
      onClick={onRightScoreClick}
    >
      {rightScore.value}
    </Player.Status>,
    <Player.Status variant={bottomScore.mode} after={bottomPenalty} onClick={onBottomScoreClick}>
      {bottomScore.value}
    </Player.Status>,
  ];
}

interface CurrentGameScreenProps {
  topPlayer: PlayerData;
  leftPlayer: PlayerData;
  rightPlayer: PlayerData;
  bottomPlayer: PlayerData;

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
    diffById,
    onScoreClick,
    gameInfo,
    bottomBar,
  } = props;

  const [topScoreElement, leftScoreElement, rightScoreElement, bottomScoreElement] =
    usePlayerScores(topPlayer, leftPlayer, rightPlayer, bottomPlayer, diffById, onScoreClick);

  // todo click on center to get table number

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name inlineWind={topPlayer.wind}>{topPlayer.displayName}</Player.Name>,
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
