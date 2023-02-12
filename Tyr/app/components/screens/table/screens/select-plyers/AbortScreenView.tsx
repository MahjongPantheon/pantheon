import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { i18n } from '#/components/i18n';
import { RiichiButton } from '#/components/general/player/partials/RiichiButton';
import { useClickHandler } from '#/components/screens/table/screens/select-plyers/useClickHandler';

type AbortScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  isRiichiPressed: boolean;
};

export type AbortScreenViewProps = {
  topPlayer: AbortScreenPlayer;
  leftPlayer: AbortScreenPlayer;
  rightPlayer: AbortScreenPlayer;
  bottomPlayer: AbortScreenPlayer;

  onRiichiClick: (id: number) => void;

  onNextClick: () => void;
  onBackClick: () => void;
};

export const AbortScreenView: React.FC<AbortScreenViewProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    onRiichiClick,
    onNextClick,
    onBackClick,
  } = props;

  const loc = useContext(i18n);

  const playerIds = [topPlayer.id, leftPlayer.id, rightPlayer.id, bottomPlayer.id] as const;

  const [
    playerTopRiichiClick,
    playerLeftRiichiClick,
    playerRightRiichiClick,
    playerBottomRiichiClick,
  ] = useClickHandler(playerIds, onRiichiClick);

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name inlineWind={topPlayer.wind}>{topPlayer.displayName}</Player.Name>,
          <RiichiButton pressed={topPlayer.isRiichiPressed} onClick={playerTopRiichiClick} />,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          <RiichiButton
            orientation='vertical'
            pressed={leftPlayer.isRiichiPressed}
            onClick={playerLeftRiichiClick}
          />,
        ]}
        right={[
          <RiichiButton
            orientation='vertical'
            pressed={rightPlayer.isRiichiPressed}
            onClick={playerRightRiichiClick}
          />,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          <RiichiButton pressed={bottomPlayer.isRiichiPressed} onClick={playerBottomRiichiClick} />,
          <Player.Name inlineWind={bottomPlayer.wind}>{bottomPlayer.displayName}</Player.Name>,
        ]}
      />
      <GameScreen.Bottom>
        <Toolbar>
          <Toolbar.Back onClick={onBackClick} />
          <Toolbar.Text>{loc._t('Abort')}</Toolbar.Text>
          <Toolbar.Next onClick={onNextClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
