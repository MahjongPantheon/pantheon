import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { i18n } from '#/components/i18n';
import { Flex } from '#/components/general/flex/Flex';
import { useClickHandler } from '#/components/screens/table/screens/select-plyers/useClickHandler';
import { PlayerTextProps } from '#/components/general/player/partials/PlayerText';

type PaoScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  loseButtonPressed: boolean;
};

export type PaoScreenViewProps = {
  topPlayer: PaoScreenPlayer;
  leftPlayer: PaoScreenPlayer;
  rightPlayer: PaoScreenPlayer;
  bottomPlayer: PaoScreenPlayer;

  winnerId: number;
  loserId?: number;

  onLoseClick: (id: number) => void;

  isNextDisabled?: boolean;
  onNextClick: () => void;
  onBackClick: () => void;
};

const WinnerOrLoser: React.FC<{
  id: number;
  winnerId: number;
  rotated?: PlayerTextProps['rotated'];
}> = ({ id, winnerId, rotated }) =>
  id === winnerId ? (
    <Player.Status variant='success' rotated={rotated}>
      Winner
    </Player.Status>
  ) : (
    <Player.Status variant='danger'>Loser</Player.Status>
  );

export const PaoScreenView: React.FC<PaoScreenViewProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    winnerId,
    loserId,
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
            {topPlayer.id !== winnerId && topPlayer.id !== loserId ? (
              <Player.LoseButton
                size='large'
                pressed={topPlayer.loseButtonPressed}
                onClick={playerTopLoseClick}
              />
            ) : (
              <WinnerOrLoser id={topPlayer.id} winnerId={winnerId} />
            )}
          </Flex>,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          <Flex direction='column' justify='center' maxHeight>
            {leftPlayer.id !== winnerId && leftPlayer.id !== loserId ? (
              <Player.LoseButton
                size='large'
                pressed={leftPlayer.loseButtonPressed}
                onClick={playerLeftLoseClick}
              />
            ) : (
              <WinnerOrLoser id={leftPlayer.id} winnerId={winnerId} rotated={90} />
            )}
          </Flex>,
        ]}
        right={[
          <Flex direction='column' justify='center' maxHeight>
            {rightPlayer.id !== winnerId && rightPlayer.id !== loserId ? (
              <Player.LoseButton
                size='large'
                pressed={rightPlayer.loseButtonPressed}
                onClick={playerLeftLoseClick}
              />
            ) : (
              <WinnerOrLoser id={rightPlayer.id} winnerId={winnerId} rotated={270} />
            )}
          </Flex>,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          <Flex justify='center'>
            {bottomPlayer.id !== winnerId && bottomPlayer.id !== loserId ? (
              <Player.LoseButton
                size='large'
                pressed={bottomPlayer.loseButtonPressed}
                onClick={playerLeftLoseClick}
              />
            ) : (
              <WinnerOrLoser id={bottomPlayer.id} winnerId={winnerId} />
            )}
          </Flex>,
          <Player.Name inlineWind={bottomPlayer.wind}>{bottomPlayer.displayName}</Player.Name>,
        ]}
      />
      <GameScreen.Bottom>
        <Toolbar>
          <Toolbar.Back onClick={onBackClick} />
          <Toolbar.Text>{loc._t('Select pao')}</Toolbar.Text>
          <Toolbar.Next disabled={isNextDisabled} onClick={onNextClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
