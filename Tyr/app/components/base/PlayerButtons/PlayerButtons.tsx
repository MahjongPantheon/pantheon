import { PlayerButtonMode } from '../../../helpers/enums';
import { Toggle } from '../Toggle/Toggle';
import IconPlus from '../../../img/icons/plus.svg?react';
import IconMinus from '../../../img/icons/minus.svg?react';
import IconDead from '../../../img/icons/dead.svg?react';
import RiichiBigIcon from '../../../img/icons/riichi-big.svg?react';
import clsx from 'classnames';
import styles from './PlayerButtons.module.css';

export type IProps = {
  winButton?: PlayerButtonMode;
  onWinButtonClick?: () => void;
  loseButton?: PlayerButtonMode;
  onLoseButtonClick?: () => void;
  riichiButton?: PlayerButtonMode;
  onRiichiButtonClick?: () => void;
  deadButton?: PlayerButtonMode;
  onDeadButtonClick?: () => void;
  rotateActionIcons?: 'cw' | 'ccw' | 'flip';
};

export const PlayerButtons = (props: IProps) => {
  const actionStyles = [
    props.rotateActionIcons === 'cw' ? styles.rotateClockwise : null,
    props.rotateActionIcons === 'ccw' ? styles.rotateCounterClockwise : null,
  ];

  return (
    <div
      className={styles.wrapper}
      style={
        props.rotateActionIcons === 'flip'
          ? { transform: 'rotate(180deg)', flexDirection: 'column-reverse' }
          : undefined
      }
    >
      {!!props.riichiButton && (
        <RiichiBigIcon
          onClick={props.onRiichiButtonClick}
          className={clsx(
            styles.riichiButton,
            props.riichiButton === PlayerButtonMode.DISABLE ||
              props.riichiButton !== PlayerButtonMode.PRESSED
              ? styles.riichiInactive
              : null
          )}
        />
      )}
      <div
        className={clsx(
          styles.iconButtons,
          props.rotateActionIcons === 'cw' ? styles.buttonsReverse : null
        )}
      >
        {!!props.winButton && (
          <Toggle
            size='lg'
            disabled={props.winButton === PlayerButtonMode.DISABLE}
            selected={props.winButton === PlayerButtonMode.PRESSED}
            onChange={props.onWinButtonClick}
          >
            <IconPlus className={clsx(styles.actionIcon, ...actionStyles)} />
          </Toggle>
        )}
        {!!props.loseButton && (
          <Toggle
            size='lg'
            disabled={props.loseButton === PlayerButtonMode.DISABLE}
            selected={props.loseButton === PlayerButtonMode.PRESSED}
            onChange={props.onLoseButtonClick}
          >
            <IconMinus className={clsx(styles.actionIcon, ...actionStyles)} />
          </Toggle>
        )}
        {!!props.deadButton && (
          <Toggle
            size='lg'
            disabled={props.deadButton === PlayerButtonMode.DISABLE}
            selected={props.deadButton === PlayerButtonMode.PRESSED}
            onChange={props.onDeadButtonClick}
          >
            <IconDead className={clsx(styles.actionIcon, ...actionStyles)} />
          </Toggle>
        )}
      </div>
    </div>
  );
};
