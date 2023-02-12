import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { i18n } from '#/components/i18n';
import { Flex } from '#/components/general/flex/Flex';
import { RiichiButton } from '#/components/general/player/partials/RiichiButton';
import { useClickHandler } from '#/components/screens/table/screens/select-plyers/useClickHandler';

type NagashiScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  winButtonPressed: boolean;
  winButtonDisabled: boolean;
};

export type NagashiScreenViewProps = {
  topPlayer: NagashiScreenPlayer;
  leftPlayer: NagashiScreenPlayer;
  rightPlayer: NagashiScreenPlayer;
  bottomPlayer: NagashiScreenPlayer;

  onWinClick: (id: number) => void;

  isNextDisabled: boolean;
  onNextClick: () => void;
  onBackClick: () => void;
};

export const NagashiScreenView: React.FC<NagashiScreenViewProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    onWinClick,
    isNextDisabled,
    onNextClick,
    onBackClick,
  } = props;

  const loc = useContext(i18n);

  const playerIds = [topPlayer.id, leftPlayer.id, rightPlayer.id, bottomPlayer.id] as const;

  const [playerTopWinClick, playerLeftWinClick, playerRightWinClick, playerBottomWinClick] =
    useClickHandler(playerIds, onWinClick);

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name inlineWind={topPlayer.wind}>{topPlayer.displayName}</Player.Name>,
          <Flex justify='center'>
            <Player.WinButton
              size='large'
              pressed={topPlayer.winButtonPressed}
              disabled={topPlayer.winButtonDisabled}
              onClick={playerTopWinClick}
            />
          </Flex>,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          <Flex direction='column' justify='center' maxHeight>
            <Player.WinButton
              size='v-large'
              pressed={leftPlayer.winButtonPressed}
              disabled={leftPlayer.winButtonDisabled}
              onClick={playerLeftWinClick}
            />
          </Flex>,
        ]}
        right={[
          <Flex direction='column' justify='center' maxHeight>
            <Player.WinButton
              size='v-large'
              pressed={rightPlayer.winButtonPressed}
              disabled={rightPlayer.winButtonDisabled}
              onClick={playerRightWinClick}
            />
          </Flex>,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          <Flex justify='center'>
            <Player.WinButton
              size='large'
              pressed={bottomPlayer.winButtonPressed}
              disabled={bottomPlayer.winButtonDisabled}
              onClick={playerBottomWinClick}
            />
          </Flex>,
          <Player.Name inlineWind={bottomPlayer.wind}>{bottomPlayer.displayName}</Player.Name>,
        ]}
      />
      <GameScreen.Bottom>
        <Toolbar>
          <Toolbar.Back onClick={onBackClick} />
          <Toolbar.Text>{loc._t('Nagashi')}</Toolbar.Text>
          <Toolbar.Next disabled={isNextDisabled} onClick={onNextClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
