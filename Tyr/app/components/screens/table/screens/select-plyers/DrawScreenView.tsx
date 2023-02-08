import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { i18n } from '#/components/i18n';
import { Flex } from '#/components/general/flex/Flex';
import { RiichiButton } from '#/components/general/player/partials/RiichiButton';
import { useClickHandler } from '#/components/screens/table/screens/select-plyers/useClickHandler';

type DrawScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  winButtonPressed: boolean;
  deadButtonPressed: boolean;
  isRiichiPressed: boolean;
};

export type DrawScreenViewProps = {
  topPlayer: DrawScreenPlayer;
  leftPlayer: DrawScreenPlayer;
  rightPlayer: DrawScreenPlayer;
  bottomPlayer: DrawScreenPlayer;

  onWinClick: (id: number) => void;
  onRiichiClick: (id: number) => void;
  onDeadHandClick: (id: number) => void;

  onNextClick: () => void;
  onBackClick: () => void;
};

export const DrawScreenView: React.FC<DrawScreenViewProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    onWinClick,
    onRiichiClick,
    onDeadHandClick,
    onNextClick,
    onBackClick,
  } = props;

  const loc = useContext(i18n);

  const playerIds = [topPlayer.id, leftPlayer.id, rightPlayer.id, bottomPlayer.id] as const;

  const [playerTopWinClick, playerLeftWinClick, playerRightWinClick, playerBottomWinClick] =
    useClickHandler(playerIds, onWinClick);

  const [
    playerTopRiichiClick,
    playerLeftRiichiClick,
    playerRightRiichiClick,
    playerBottomRiichiClick,
  ] = useClickHandler(playerIds, onRiichiClick);

  const [playerTopDeadClick, playerLeftDeadClick, playerRightDeadClick, playerBottomDeadClick] =
    useClickHandler(playerIds, onDeadHandClick);

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name inlineWind={topPlayer.wind}>{topPlayer.displayName}</Player.Name>,
          <Flex justify='center'>
            {topPlayer.deadButtonPressed ? (
              <Player.DeadHandButton size='large' onClick={playerTopDeadClick} />
            ) : (
              <Player.WinButton
                size='large'
                pressed={topPlayer.winButtonPressed}
                onClick={playerTopWinClick}
              />
            )}
          </Flex>,
          <RiichiButton pressed={topPlayer.isRiichiPressed} onClick={playerTopRiichiClick} />,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          <Flex direction='column' justify='center' maxHeight>
            {leftPlayer.deadButtonPressed ? (
              <Player.DeadHandButton size='v-large' onClick={playerLeftDeadClick} />
            ) : (
              <Player.WinButton
                size='v-large'
                pressed={leftPlayer.winButtonPressed}
                onClick={playerLeftWinClick}
              />
            )}
          </Flex>,
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
          <Flex direction='column' justify='center' maxHeight>
            {rightPlayer.deadButtonPressed ? (
              <Player.DeadHandButton size='v-large' onClick={playerRightDeadClick} />
            ) : (
              <Player.WinButton
                size='v-large'
                pressed={rightPlayer.winButtonPressed}
                onClick={playerRightWinClick}
              />
            )}
          </Flex>,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          <RiichiButton pressed={bottomPlayer.isRiichiPressed} onClick={playerBottomRiichiClick} />,
          <Flex justify='center'>
            {bottomPlayer.deadButtonPressed ? (
              <Player.DeadHandButton size='large' onClick={playerBottomDeadClick} />
            ) : (
              <Player.WinButton
                size='large'
                pressed={bottomPlayer.winButtonPressed}
                onClick={playerBottomWinClick}
              />
            )}
          </Flex>,
          <Player.Name inlineWind={bottomPlayer.wind}>{bottomPlayer.displayName}</Player.Name>,
        ]}
      />
      <GameScreen.Bottom>
        <Toolbar>
          <Toolbar.Back onClick={onBackClick} />
          <Toolbar.Text>{loc._t('Draw')}</Toolbar.Text>
          <Toolbar.Next onClick={onNextClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
