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
import './page-table.css';
import { PlayerLeft } from '../../../general/players/PlayerLeft';
import { ResultArrowsProps } from '../../../general/result-arrows/ResultArrowsProps';
import { BottomPanelProps } from '../../../general/bottom-panel/BottomPanelProps';
import { PlayerProps } from '../../../general/players/PlayerProps';
import { PlayerBottom } from '../../../general/players/PlayerBottom';
import { PlayerTop } from '../../../general/players/PlayerTop';
import { BottomPanel } from '../../../general/bottom-panel/BottomPanel';
import { ResultArrows } from '../../../general/result-arrows/ResultArrows';
import { PlayerRight } from '../../../general/players/PlayerRight';
import { TableInfo, TableInfoProps } from './TableInfo';
import { SelectModal, SelectModalProps } from '../../../general/select-modal/SelectModal';

type IProps = {
  topPlayer: PlayerProps;
  leftPlayer: PlayerProps;
  bottomPlayer: PlayerProps;
  rightPlayer: PlayerProps;

  tableInfo?: TableInfoProps;
  arrowsInfo?: ResultArrowsProps;

  bottomPanel: BottomPanelProps;
  outcomeModal?: SelectModalProps;
};

export class TableScreenStateless extends React.Component<IProps> {
  render() {
    const {
      topPlayer,
      leftPlayer,
      rightPlayer,
      bottomPlayer,
      bottomPanel,
      outcomeModal,
      tableInfo,
      arrowsInfo,
    } = this.props;

    return (
      <div className='flex-container page-table'>
        <div className='flex-container__content flex-container'>
          <div className='flex-container__top'>
            <PlayerTop {...topPlayer} />
          </div>
          <div className='flex-container__content page-table__center'>
            <PlayerLeft {...leftPlayer} />

            {!!tableInfo && <TableInfo {...tableInfo} />}
            {!!arrowsInfo && <ResultArrows {...arrowsInfo} />}

            <PlayerRight {...rightPlayer} />
          </div>
          <div className='flex-container__bottom'>
            <PlayerBottom {...bottomPlayer} />
          </div>
        </div>
        <div className='flex-container__bottom'>
          <BottomPanel {...bottomPanel} />
        </div>
        {!!outcomeModal && <SelectModal {...outcomeModal} />}
      </div>
    );
  }
}
