/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import './other-tables-list.css';
import { TopPanel } from '../../general/top-panel/TopPanel';
import { useContext } from 'react';
import { i18n } from '../../i18n';
import { TableState } from '../../../clients/proto/atoms.pb';
import { PlayerAvatar } from '../../general/avatar/Avatar';

type IProps = {
  tables: TableState[];
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
            key={table.sessionHash}
            className='page-other-tables-list__table'
            onClick={() => onTableClick(table.sessionHash)}
          >
            <div className='page-other-tables-list__wind'>{roundsMap[table.currentRoundIndex]}</div>
            {table.players.map((player, idx) => (
              <div key={player.id} className='page-other-tables-list__item'>
                <PlayerAvatar p={player} size={32} />
                {player.title}: {table.scores[idx].score}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
