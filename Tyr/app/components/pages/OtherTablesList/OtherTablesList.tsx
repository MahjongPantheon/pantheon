import { useContext } from 'react';
import { i18n } from '../../i18n';
import { Button } from '../../base/Button/Button';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import { Player } from '../../base/Player/Player';
import styles from './OtherTablesList.module.css';
import { PlayerDescriptor } from '../../../helpers/interfaces';

type IProps = {
  tables: Array<{
    sessionHash: string;
    currentRoundIndex: number;
    players: Array<PlayerDescriptor & { title?: string }>;
    scores: Array<{ score: number }>;
  }>;
  onTableClick: (hash: string) => void;
  onBackClick: () => void;
};

const roundsMap: { [key: number]: string } = {
  1: '東1',
  2: '東2',
  3: '東3',
  4: '東4',
  5: '南1',
  6: '南2',
  7: '南3',
  8: '南4',
  9: '西1',
  10: '西2',
  11: '西3',
  12: '西4',
};

export const OtherTablesList = ({ onTableClick, onBackClick, tables }: IProps) => {
  const loc = useContext(i18n);
  return (
    <div className={styles.wrapper}>
      <Button variant='light' icon={<BackIcon />} size='lg' onClick={onBackClick} />
      <div className={styles.list}>
        {tables.length === 0 && (
          <div className={styles.empty}>{loc._t('No tables are playing right now')}</div>
        )}
        {tables.map((table) => (
          <div
            key={table.sessionHash}
            className={styles.table}
            onClick={() => onTableClick(table.sessionHash)}
          >
            <div className={styles.wind}>{roundsMap[table.currentRoundIndex]}</div>
            <div className={styles.playersList}>
              {table.players.map((player, idx) => (
                <div key={player.id} className={styles.listItem}>
                  <Player
                    {...player}
                    playerName={`${player.playerName ?? player.title}: ${table.scores[idx].score}`}
                    size='md'
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
