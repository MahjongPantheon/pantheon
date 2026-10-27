import { ActionButton } from '../ActionButton/ActionButton';
import { Player, IProps as PlayerProps } from '../Player/Player';
import { PlayerPoints, IProps as PointsProps } from '../PlayerPoints/PlayerPoints';
import { PlayerButtons, IProps as ButtonsProps } from '../PlayerButtons/PlayerButtons';
import styles from './PlayerPlace.module.css';

export type IProps = Omit<PlayerProps, 'size'> &
  PointsProps & {
    buttons?: ButtonsProps;
    onPlayerClick?: () => void;
    upsideDown?: boolean;
    testIdPrefix?: string;
  };

export const PlayerPlace = (props: IProps) => {
  const Details = props.onPlayerClick ? ActionButton : 'div';
  return (
    <div className={styles.wrapper} data-testid={props.testIdPrefix}>
      {props.buttons && (
        <PlayerButtons
          {...props.buttons}
          testIdPrefix={props.testIdPrefix}
          rotateActionIcons={props.upsideDown ? 'flip' : props.buttons.rotateActionIcons}
        />
      )}
      <Details className={styles.details} onClick={props.onPlayerClick}>
        {props.id && (
          <Player
            id={props.id}
            playerName={props.playerName}
            lastUpdate={props.lastUpdate}
            hasAvatar={props.hasAvatar}
            showYakitori={props.showYakitori}
            currentWind={props.currentWind}
            upsideDown={props.upsideDown}
            showChomboSign={props.showChomboSign}
            size='md'
          />
        )}
        {props.points !== undefined && (
          <PlayerPoints
            testId={props.testIdPrefix ? `${props.testIdPrefix}-points` : undefined}
            points={props.points}
            penaltyPoints={props.penaltyPoints}
            pointsMode={props.pointsMode}
            gotRiichiFromTable={props.gotRiichiFromTable}
            showInlineRiichi={props.showInlineRiichi}
            upsideDown={props.upsideDown}
          />
        )}
      </Details>
    </div>
  );
};
