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
import { EndingPolicy } from 'tsclients/proto/atoms.pb';

export const TableStatus = (props: TableStatusProps) => {
  const loc = useContext(i18n);

  const tableIndex = roundToString(
    props.tableStatus.roundIndex ?? 0,
    props.tableStatus.playersCount
  );

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
      data-testid='tyr-table-status'
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
              testId='tyr-table-call-referee'
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
                testId='tyr-table-rotate-counterclockwise'
              />
              <Button
                variant='light'
                icon={<RotateCwIcon />}
                onClick={() => {
                  props.onCwRotateClick?.();
                  return false;
                }}
                size='lg'
                testId='tyr-table-rotate-clockwise'
              />
            </div>
          )}
          <div className={styles.roundIndex} data-testid='tyr-table-round'>
            {tableIndex}
          </div>
          <div className={styles.sticks}>
            <div data-testid='tyr-table-riichi-count'>
              <RiichiIcon /> {props.tableStatus.riichiCount || '0'}
            </div>
            <div data-testid='tyr-table-honba-count'>
              <HonbaIcon /> {props.tableStatus.honbaCount || '0'}
            </div>
          </div>
          {props.timerState.useTimer && (
            <div className={styles.timer} data-testid='tyr-table-timer'>
              {currentTime}
            </div>
          )}
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
