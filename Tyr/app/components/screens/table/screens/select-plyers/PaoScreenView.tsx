import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { i18n } from '#/components/i18n';
import { Flex } from '#/components/general/flex/Flex';
import { useClickHandler } from '#/components/screens/table/screens/select-plyers/useClickHandler';
import './pao-screen.css';

type PaoScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  // todo lose disabled?
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

const ButtonOrStatus: React.FC<{
  player: PaoScreenPlayer;
  winnerId: number;
  loserId?: number;
  rotated?: 0 | 90 | 180 | 270;
  onClick: () => void;
}> = ({ player, winnerId, loserId, rotated, onClick }) => {
  const isVertical = rotated === 90 || rotated === 270;
  const direction = isVertical ? 'column' : 'row';

  if (player.id !== winnerId && player.id !== loserId) {
    return (
      <Flex direction={direction} maxHeight={isVertical} justify='center'>
        <Player.LoseButton
          size={isVertical ? 'v-large' : 'large'}
          pressed={player.loseButtonPressed}
          onClick={onClick}
        />
      </Flex>
    );
  }

  return (
    <Flex
      direction={direction}
      maxHeight={isVertical}
      justify='center'
      alignItems='end'
      className={isVertical ? 'pao-screen__status-vertical' : 'pao-screen__status-horizontal'}
    >
      {player.id === winnerId ? (
        <Player.Status variant='success' rotated={rotated}>
          Winner
        </Player.Status>
      ) : (
        <Player.Status variant='danger'>Loser</Player.Status>
      )}
    </Flex>
  );
};

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
          <ButtonOrStatus
            player={topPlayer}
            onClick={playerTopLoseClick}
            winnerId={winnerId}
            loserId={loserId}
          />,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          <ButtonOrStatus
            player={leftPlayer}
            onClick={playerLeftLoseClick}
            winnerId={winnerId}
            loserId={loserId}
            rotated={90}
          />,
        ]}
        right={[
          <ButtonOrStatus
            player={rightPlayer}
            onClick={playerRightLoseClick}
            winnerId={winnerId}
            loserId={loserId}
            rotated={270}
          />,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          <ButtonOrStatus
            player={bottomPlayer}
            onClick={playerBottomLoseClick}
            winnerId={winnerId}
            loserId={loserId}
          />,
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
