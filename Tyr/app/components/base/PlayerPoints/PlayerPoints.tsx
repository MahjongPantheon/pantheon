import { PlayerPointsMode } from '../../../helpers/enums';
import RiichiBigIcon from '../../../img/icons/riichi-big.svg?react';
import styles from './PlayerPoints.module.css';
import clsx from 'classnames';

export type IProps = {
  gotRiichiFromTable?: number;
  showInlineRiichi?: boolean;
  points?: number | string;
  pointsMode?: PlayerPointsMode;
  penaltyPoints?: number;
  upsideDown?: boolean;
};

export const PlayerPoints = (props: IProps) => {
  const pointsClasses = {
    [PlayerPointsMode.ACTIVE]: styles.pointsActive,
    [PlayerPointsMode.IDLE]: styles.pointsIdle,
    [PlayerPointsMode.NEGATIVE]: styles.pointsNegative,
    [PlayerPointsMode.POSITIVE]: styles.pointsPositive,
  };

  return (
    <div
      className={styles.wrapper}
      style={props.upsideDown ? { transform: 'rotate(180deg)' } : undefined}
    >
      <div
        className={clsx(styles.points, pointsClasses[props.pointsMode ?? PlayerPointsMode.IDLE])}
      >
        {props.points}
      </div>
      {props.showInlineRiichi && <RiichiBigIcon className={styles.inlineRiichi} />}
      {!!props.gotRiichiFromTable && (
        <>
          <div className={styles.riichiWithLabel}>
            <span>+{props.gotRiichiFromTable} ×</span>
            <RiichiBigIcon className={styles.inlineRiichi} />
          </div>
        </>
      )}
      {!!props.penaltyPoints && (
        <div className={styles.penalty}>{`${props.penaltyPoints / 1000}k`}</div>
      )}
    </div>
  );
};
