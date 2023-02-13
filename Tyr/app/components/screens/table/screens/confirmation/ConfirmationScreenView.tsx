import React, { useContext } from 'react';
import { GameScreen } from '#/components/general/game-screen/GameScreen';
import { Player } from '#/components/general/player/Player';
import { Toolbar } from '#/components/general/toolbar/Toolbar';
import { PlayerArrow } from '#/components/general/result-arrows/ResultArrowsProps';
import { ResultArrows } from '#/components/general/result-arrows/ResultArrows';
import { i18n } from '#/components/i18n';

type ConfirmationScreenPlayer = {
  id: number;
  wind: string;
  displayName: string;

  scoreDelta?: number;
  riichi?: boolean;
  penalty?: boolean;
};

export type ConfirmationScreenViewProps = {
  topPlayer: ConfirmationScreenPlayer;
  leftPlayer: ConfirmationScreenPlayer;
  rightPlayer: ConfirmationScreenPlayer;
  bottomPlayer: ConfirmationScreenPlayer;

  topRotated: boolean;

  payments: PlayerArrow[];

  outcomeTitle: string;

  onSaveClick: () => void;
  onBackClick: () => void;
};

type ScoreDeltaProps = {
  player: ConfirmationScreenPlayer;
  rotated?: 0 | 90 | 180 | 270;
};

const Status: React.FC<ScoreDeltaProps> = ({ player, rotated }) => {
  const loc = useContext(i18n);

  if (player.penalty) {
    return (
      <Player.Status rotated={rotated} variant='danger'>
        {loc._t('Penalty')}
      </Player.Status>
    );
  }
  if (player.scoreDelta === undefined) {
    return <Player.Status rotated={rotated} />;
  }

  const scoreStr = player.scoreDelta > 0 ? `+${player.scoreDelta}` : player.scoreDelta.toString();

  const riichiElement = player.riichi ? <Player.InlineRiichi /> : undefined;

  return (
    <Player.Status
      variant={player.scoreDelta > 0 ? 'success' : 'danger'}
      rotated={rotated}
      after={riichiElement}
    >
      {scoreStr}
    </Player.Status>
  );
};

export const ConfirmationScreenView: React.FC<ConfirmationScreenViewProps> = (props) => {
  const {
    topPlayer,
    leftPlayer,
    rightPlayer,
    bottomPlayer,
    topRotated,
    payments,
    outcomeTitle,
    onBackClick,
    onSaveClick,
  } = props;

  return (
    <GameScreen>
      <GameScreen.Table
        top={[
          <Player.Name inlineWind={topPlayer.wind} rotated={topRotated ? 180 : 0}>
            {topPlayer.displayName}
          </Player.Name>,
          <Status player={topPlayer} rotated={topRotated ? 180 : 0} />,
        ]}
        left={[
          <Player.Name inlineWind={leftPlayer.wind} rotated={90}>
            {leftPlayer.displayName}
          </Player.Name>,
          <Status player={leftPlayer} rotated={90} />,
        ]}
        right={[
          <Status player={rightPlayer} rotated={270} />,
          <Player.Name inlineWind={rightPlayer.wind} rotated={270}>
            {rightPlayer.displayName}
          </Player.Name>,
        ]}
        bottom={[
          <Status player={bottomPlayer} />,
          <Player.Name inlineWind={bottomPlayer.wind}>{bottomPlayer.displayName}</Player.Name>,
        ]}
        center={<ResultArrows arrows={payments} />}
      />
      <GameScreen.Bottom>
        <Toolbar>
          <Toolbar.Back onClick={onBackClick} />
          <Toolbar.Text>{outcomeTitle}</Toolbar.Text>
          <Toolbar.Save onClick={onSaveClick} />
        </Toolbar>
      </GameScreen.Bottom>
    </GameScreen>
  );
};
