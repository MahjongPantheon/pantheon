import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { i18n } from '#/components/i18n';
import { Flex } from '#/components/general/flex/Flex';
import { RiichiButton } from '#/components/general/player/partials/RiichiButton';
import { useClickHandler } from '#/components/screens/table/screens/select-plyers/useClickHandler';

type TsumoScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  winButtonPressed: boolean;
  winButtonDisabled: boolean;

  isRiichiPressed: boolean;
};

export type TsumoScreenViewProps = {
  topPlayer: TsumoScreenPlayer;
  leftPlayer: TsumoScreenPlayer;
  rightPlayer: TsumoScreenPlayer;
  bottomPlayer: TsumoScreenPlayer;

  onWinClick: (id: number) => void;
  onRiichiClick: (id: number) => void;

  isNextDisabled?: boolean;
  onNextClick: () => void;
  onBackClick: () => void;
};

export const TsumoScreenView: React.FC<TsumoScreenViewProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    onWinClick,
    onRiichiClick,
    isNextDisabled = false,
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
          <RiichiButton pressed={topPlayer.isRiichiPressed} onClick={playerTopRiichiClick} />,
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
          <RiichiButton pressed={bottomPlayer.isRiichiPressed} onClick={playerBottomRiichiClick} />,
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
          <Toolbar.Text>{loc._t('Tsumo')}</Toolbar.Text>
          <Toolbar.Next disabled={isNextDisabled} onClick={onNextClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
