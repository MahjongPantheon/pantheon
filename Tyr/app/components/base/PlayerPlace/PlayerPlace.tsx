import { Player, IProps as PlayerProps } from '../Player/Player';
import { PlayerPoints, IProps as PointsProps } from '../PlayerPoints/PlayerPoints';
import { PlayerButtons, IProps as ButtonsProps } from '../PlayerButtons/PlayerButtons';
import styles from './PlayerPlace.module.css';

export type IProps = Omit<PlayerProps, 'size'> &
  PointsProps & {
    buttons?: ButtonsProps;
    onPlayerClick?: () => void;
    upsideDown?: boolean;
  };

export const PlayerPlace = (props: IProps) => {
  return (
    <div className={styles.wrapper} onClick={props.onPlayerClick}>
      {props.buttons && (
        <PlayerButtons
          {...props.buttons}
          rotateActionIcons={props.upsideDown ? 'flip' : props.buttons.rotateActionIcons}
        />
      )}
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
          points={props.points}
          penaltyPoints={props.penaltyPoints}
          pointsMode={props.pointsMode}
          gotRiichiFromTable={props.gotRiichiFromTable}
          showInlineRiichi={props.showInlineRiichi}
          upsideDown={props.upsideDown}
        />
      )}
    </div>
  );
};
