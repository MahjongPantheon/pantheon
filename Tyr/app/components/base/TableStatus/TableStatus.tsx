import { useContext } from 'react';
import { i18n } from '../../i18n';

import RiichiIcon from '../../../img/icons/riichi-small.svg?react';
import HonbaIcon from '../../../img/icons/honba.svg?react';
import RotateCcwIcon from '../../../img/icons/rotate-ccw.svg?react';
import RotateCwIcon from '../../../img/icons/rotate-cw.svg?react';
import CallRefereeIcon from '../../../img/icons/warning-icon.svg?react';
import { formatTime, getTimeRemaining } from '../../../store/selectors/overview';
import { roundToString } from '../../../helpers/roundToString';
import styles from './TableStatus.module.css';
import { Button } from '../Button/Button';
import { TableStatus as TableStatusProps } from '../../../helpers/interfaces';
import { EndingPolicy } from '../../../clients/proto/atoms.pb';

export const TableStatus = (props: TableStatusProps) => {
  const loc = useContext(i18n);

  const tableIndex = roundToString(props.tableStatus.roundIndex ?? 0);

  const timeRemaining = getTimeRemaining({
    useTimer: props.timerState.useTimer,
    secondsRemaining: props.timerState.secondsRemaining,
    waiting: props.timerState.timerWaiting,
  });

  let gamesLeft: number | undefined;
  let currentTime: string | undefined;
  if (timeRemaining !== undefined) {
    if (timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
      if (props.endingPolicy === EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND) {
        gamesLeft = props.tableStatus?.lastHandStarted ? 1 : 2;
      } else if (props.endingPolicy === EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND) {
        gamesLeft = 1;
      }
    } else {
      currentTime = formatTime(timeRemaining.minutes, timeRemaining.seconds);
    }
  }

  return (
    <div
      className={styles.wrapper}
      style={{ width: `${props.width}px`, height: `${props.height}px` }}
    >
      {props.tableIndex && (
        <div className={styles.tableIndex}>{loc._t('Table #%1', [props.tableIndex])}</div>
      )}
      {!props.timerState.timerWaiting && (
        <>
          {props.showCallReferee && (
            <Button
              variant='light'
              icon={<CallRefereeIcon />}
              onClick={() => {
                props.onCallRefereeClick?.();
                return false;
              }}
              size='lg'
            />
          )}
          {props.showRotateButtons && (
            <div className={styles.rotateButtons}>
              <Button
                variant='light'
                icon={<RotateCcwIcon />}
                onClick={() => {
                  props.onCcwRotateClick?.();
                  return false;
                }}
                size='lg'
              />
              <Button
                variant='light'
                icon={<RotateCwIcon />}
                onClick={() => {
                  props.onCwRotateClick?.();
                  return false;
                }}
                size='lg'
              />
            </div>
          )}
          <div className={styles.roundIndex}>{tableIndex}</div>
          <div className={styles.sticks}>
            <div>
              <RiichiIcon /> {props.tableStatus.riichiCount || '0'}
            </div>
            <div>
              <HonbaIcon /> {props.tableStatus.honbaCount || '0'}
            </div>
          </div>
          {props.timerState.useTimer && <div className={styles.timer}>{currentTime}</div>}
          {gamesLeft && (
            <div className={styles.gamesLeft}>
              {loc._nt(['%1 deal left', '%1 deals left'], gamesLeft, [gamesLeft])}
            </div>
          )}
        </>
      )}
    </div>
  );
};
