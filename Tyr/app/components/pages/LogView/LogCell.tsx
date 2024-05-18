import clsx from 'classnames';
import styles from './LogView.module.css';

type LogCellProps = {
  delta: number;
  score: number;
};

export const LogCell = (props: LogCellProps) => {
  const { delta, score } = props;

  return (
    <div className={styles.logCell}>
      <div
        className={clsx(
          styles.logDelta,
          delta > 0 ? styles.logDeltaSuccess : null,
          delta < 0 ? styles.logDeltaDanger : null
        )}
      >
        {delta > 0 ? `+${delta}` : delta}
      </div>
      <div className={styles.logScore}>{score + delta}</div>
    </div>
  );
};
