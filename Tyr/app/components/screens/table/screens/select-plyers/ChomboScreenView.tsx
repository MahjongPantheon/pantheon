import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { i18n } from '#/components/i18n';
import { Flex } from '#/components/general/flex/Flex';
import { RiichiButton } from '#/components/general/player/partials/RiichiButton';
import { useClickHandler } from '#/components/screens/table/screens/select-plyers/useClickHandler';

type ChomboScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  loseButtonPressed: boolean;
  loseButtonDisabled: boolean;
};

export type ChomboScreenViewProps = {
  topPlayer: ChomboScreenPlayer;
  leftPlayer: ChomboScreenPlayer;
  rightPlayer: ChomboScreenPlayer;
  bottomPlayer: ChomboScreenPlayer;

  onLoseClick: (id: number) => void;

  isNextDisabled: boolean;
  onNextClick: () => void;
  onBackClick: () => void;
};

export const ChomboScreenView: React.FC<ChomboScreenViewProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    onLoseClick,
    isNextDisabled,
    onNextClick,
    onBackClick,
  } = props;

  const loc = useContext(i18n);

  const playerIds = [topPlayer.id, leftPlayer.id, rightPlayer.id, bottomPlayer.id] as const;

  const [playerTopLoseClick, playerLeftLoseClick, playerRightLoseClick, playerBottomLoseClick] =
    useClickHandler(playerIds, onLoseClick);

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name inlineWind={topPlayer.wind}>{topPlayer.displayName}</Player.Name>,
          <Flex justify='center'>
            <Player.LoseButton
              size='large'
              pressed={topPlayer.loseButtonPressed}
              disabled={topPlayer.loseButtonDisabled}
              onClick={playerTopLoseClick}
            />
          </Flex>,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          <Flex direction='column' justify='center' maxHeight>
            <Player.LoseButton
              size='v-large'
              pressed={leftPlayer.loseButtonPressed}
              disabled={leftPlayer.loseButtonDisabled}
              onClick={playerLeftLoseClick}
            />
          </Flex>,
        ]}
        right={[
          <Flex direction='column' justify='center' maxHeight>
            <Player.LoseButton
              size='v-large'
              pressed={rightPlayer.loseButtonPressed}
              disabled={rightPlayer.loseButtonDisabled}
              onClick={playerRightLoseClick}
            />
          </Flex>,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          <Flex justify='center'>
            <Player.LoseButton
              size='large'
              pressed={bottomPlayer.loseButtonPressed}
              disabled={bottomPlayer.loseButtonDisabled}
              onClick={playerBottomLoseClick}
            />
          </Flex>,
          <Player.Name inlineWind={bottomPlayer.wind}>{bottomPlayer.displayName}</Player.Name>,
        ]}
      />
      <GameScreen.Bottom>
        <Toolbar>
          <Toolbar.Back onClick={onBackClick} />
          <Toolbar.Text>{loc._t('Chombo')}</Toolbar.Text>
          <Toolbar.Next disabled={isNextDisabled} onClick={onNextClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
