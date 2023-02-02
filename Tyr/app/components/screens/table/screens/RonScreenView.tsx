import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { i18n } from '#/components/i18n';
import { Flex } from '#/components/general/flex/Flex';
import { RiichiButton } from '#/components/general/player/partials/RiichiButton';

type RonScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  winButtonPressed: boolean;
  winButtonDisabled: boolean;

  loseButtonPressed: boolean;
  loseButtonDisabled: boolean;

  isRiichiPressed: boolean;
};

export type RonScreenViewProps = {
  topPlayer: RonScreenPlayer;
  leftPlayer: RonScreenPlayer;
  rightPlayer: RonScreenPlayer;
  bottomPlayer: RonScreenPlayer;

  onWinClick: (id: number) => void;
  onLoseClick: (id: number) => void;
  onRiichiClick: (id: number) => void;

  isNextDisabled: boolean;
  onNextClick: () => void;
  onBackClick: () => void;
};

export const RonScreenView: React.FC<RonScreenViewProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    onWinClick,
    onLoseClick,
    onRiichiClick,
    isNextDisabled,
    onNextClick,
    onBackClick,
  } = props;

  const loc = useContext(i18n);

  // todo text

  const onRiichiClickHandler = () => {};
  const onWinClickHandler = () => {};
  const onLoseClickHandler = () => {};

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name inlineWind={topPlayer.wind}>{topPlayer.displayName}</Player.Name>,
          <Flex justify='center' gap={8}>
            <Player.WinButton
              size='small'
              pressed={topPlayer.winButtonPressed}
              disabled={topPlayer.winButtonDisabled}
              onClick={onWinClickHandler}
            />
            <Player.LoseButton
              size='small'
              pressed={topPlayer.loseButtonPressed}
              disabled={topPlayer.loseButtonDisabled}
              onClick={onLoseClickHandler}
            />
          </Flex>,
          <RiichiButton pressed={topPlayer.isRiichiPressed} onClick={onRiichiClickHandler} />,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          <Flex direction='column' justify='center' gap={8} maxHeight>
            <Player.WinButton
              size='small'
              pressed={leftPlayer.winButtonPressed}
              disabled={leftPlayer.winButtonDisabled}
              onClick={onWinClickHandler}
            />
            <Player.LoseButton
              size='small'
              pressed={leftPlayer.loseButtonPressed}
              disabled={leftPlayer.loseButtonDisabled}
              onClick={onLoseClickHandler}
            />
          </Flex>,
          <RiichiButton
            orientation='vertical'
            pressed={topPlayer.isRiichiPressed}
            onClick={onRiichiClickHandler}
          />,
        ]}
        right={[
          <RiichiButton
            orientation='vertical'
            pressed={rightPlayer.isRiichiPressed}
            onClick={onRiichiClickHandler}
          />,
          <Flex direction='column' justify='center' gap={8} maxHeight>
            <Player.WinButton
              size='small'
              pressed={rightPlayer.winButtonPressed}
              disabled={rightPlayer.winButtonDisabled}
              onClick={onWinClickHandler}
            />
            <Player.LoseButton
              size='small'
              pressed={rightPlayer.loseButtonPressed}
              disabled={rightPlayer.loseButtonDisabled}
              onClick={onLoseClickHandler}
            />
          </Flex>,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          <RiichiButton pressed={bottomPlayer.isRiichiPressed} onClick={onRiichiClickHandler} />,
          <Flex justify='center' gap={8}>
            <Player.WinButton
              size='small'
              pressed={bottomPlayer.winButtonPressed}
              disabled={bottomPlayer.winButtonDisabled}
              onClick={onWinClickHandler}
            />
            <Player.LoseButton
              size='small'
              pressed={bottomPlayer.loseButtonPressed}
              disabled={bottomPlayer.loseButtonDisabled}
              onClick={onLoseClickHandler}
            />
          </Flex>,
          <Player.Name inlineWind={bottomPlayer.wind}>{bottomPlayer.displayName}</Player.Name>,
        ]}
      />
      <GameScreen.Bottom>
        <Toolbar>
          <Toolbar.Back onClick={onBackClick} />
          <Toolbar.Text>{loc._t('Ron')}</Toolbar.Text>
          <Toolbar.Next disabled={isNextDisabled} onClick={onNextClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
