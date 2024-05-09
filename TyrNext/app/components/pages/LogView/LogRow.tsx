import { ReactNode, useCallback } from 'react';

import { LogCell } from './LogCell';
import styles from './LogView.module.css';
import { IRoundResult, PlayerDescriptor } from '../../../helpers/interfaces';

type LogRowProps = IRoundResult & {
  index: number;
  players: PlayerDescriptor[];
  selectRound: (index: number) => void;
  children: ReactNode;
};

export const LogRow = (props: LogRowProps) => {
  const { players, index, selectRound, round, scoresDelta, scores, children } = props;

  const onRoundClick = useCallback(() => {
    selectRound(index);
  }, [index, selectRound]);

  return (
    <div className={styles.logRowContainer} onClick={onRoundClick}>
      <div className={styles.logRow}>
        <div className={styles.roundCell}>{round}</div>
        {players.map((player, idx) => (
          <LogCell
            key={`plc_${idx}`}
            delta={scoresDelta.find((r) => r.playerId === player.id)?.score ?? 0}
            score={scores.find((r) => r.playerId === player.id)?.score ?? 0}
          />
        ))}
      </div>
      {children}
    </div>
  );
};
