import * as React from 'react';
import './other-tables-list.css';
import { TopPanel } from '#/components/general/top-panel/TopPanel';
import { Table } from '#/interfaces/common';
import { useContext } from 'react';
import { i18n } from '#/components/i18n';

type IProps = {
  tables: Table[];
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

export const OtherTablesListView: React.FC<IProps> = ({ onTableClick, onBackClick, tables }) => {
  const loc = useContext(i18n);
  return (
    <div className='page-other-tables-list'>
      <TopPanel onBackClick={onBackClick} />
      <div className='page-other-tables-list__content'>
        {tables.length === 0 && (
          <div className='page-other-tables-list__empty'>
            {loc._t('No tables are playing right now')}
          </div>
        )}
        {tables.map((table) => (
          <div
            key={table.hash}
            className='page-other-tables-list__table'
            onClick={() => onTableClick(table.hash)}
          >
            {roundsMap[table.currentRound]}
            {table.players.map((player) => (
              <div key={player.id}>
                {player.displayName}: {player.score}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
