import { useCallback, useContext, useState } from 'react';
import { i18n } from '../../i18n';
import { LogRow } from './LogRow';
import { LogDetailsRow } from './LogDetailsRow';
import { BottomPanel } from '../../base/BottomPanel/BottomPanel';
import { Button } from '../../base/Button/Button';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import styles from './LogView.module.css';
import { IRoundOverviewInfo, IRoundResult, PlayerDescriptor } from '../../../helpers/interfaces';

type IProps = {
  players: (PlayerDescriptor & { title?: string })[];
  results: IRoundResult[];
  rounds: IRoundOverviewInfo[];
  onBackClick: () => void;
  startScore: number;
};

export const LogView = (props: IProps) => {
  const loc = useContext(i18n);
  const { players, results, rounds, onBackClick } = props;
  const [selectedRoundIndex, setRoundIndex] = useState<number | undefined>(undefined);

  const selectRound = useCallback(
    (index: number) => {
      if (selectedRoundIndex === index) {
        setRoundIndex(undefined);
      } else {
        setRoundIndex(index);
      }
    },
    [selectedRoundIndex, setRoundIndex]
  );

  return (
    <div className={styles.wrapper}>
      {!results.length && <div className={styles.noResults}>{loc._t('No results found')}</div>}
      {!!results.length && (
        <>
          <div className={styles.header}>
            <div className={styles.roundCell}>&nbsp;</div>
            {players.map((player, idx) => (
              <div key={`pl_${idx}`} className={styles.headerCell}>
                {player.playerName ?? player.title}
              </div>
            ))}
          </div>

          <div className={styles.rounds}>
            <div className={styles.logRowContainer}>
              <div className={styles.logRow}>
                <div className={styles.roundCell}>&nbsp;</div>
                {/* Four similar starting point cells for clarity */}
                {[props.startScore, props.startScore, props.startScore, props.startScore].map(
                  (v, idx) => (
                    <div className={styles.logCell} key={idx}>
                      <div className={styles.logScore}>{v}</div>
                    </div>
                  )
                )}
              </div>
            </div>
            {results.map((roundResult, i) => (
              <LogRow
                key={i}
                players={players}
                index={i}
                scoresDelta={roundResult.scoresDelta}
                scores={roundResult.scores}
                round={roundResult.round}
                selectRound={selectRound}
              >
                {selectedRoundIndex === i && <LogDetailsRow {...rounds[i]} />}
              </LogRow>
            ))}
          </div>
        </>
      )}
      <BottomPanel>
        <Button variant='light' icon={<BackIcon />} size='lg' onClick={onBackClick} />
        <div className={styles.bottomTitle}>{loc._t('Game log')}</div>
      </BottomPanel>
    </div>
  );
};
