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
import { TableTenbou } from './TableTenbou';
import { useContext } from 'react';
import { i18n } from '../../../i18n';
import RiichiIcon from '../../../../img/icons/riichi-small.svg?react';
import HonbaIcon from '../../../../img/icons/honba.svg?react';
import RotateCWIcon from '../../../../img/icons/rotate-cw.svg?react';
import RotateCCWIcon from '../../../../img/icons/rotate-ccw.svg?react';

export type TableInfoProps = {
  showRoundInfo?: boolean;
  showTableNumber?: boolean;
  showTimer?: boolean;
  isAutostartTimer?: boolean;
  gamesLeft?: number;
  round?: string;
  honbaCount?: number;
  riichiCount?: number;
  currentTime?: string;
  tableNumber?: number | null;
  showRotators?: boolean;
  timerWaiting?: boolean;
  onRotateCwClick?: () => void;
  onRotateCcwClick?: () => void;
  onTableInfoToggle?: () => void;
};

export const TableInfo = React.memo(function (props: TableInfoProps) {
  const loc = useContext(i18n);
  const {
    showRoundInfo,
    showTableNumber,
    showRotators,
    showTimer,
    // isAutostartTimer,
    gamesLeft,
    round,
    honbaCount,
    riichiCount,
    currentTime,
    tableNumber,
    timerWaiting,
    onTableInfoToggle,
    onRotateCcwClick,
    onRotateCwClick,
  } = props;

  if (!showRoundInfo && !showTableNumber) {
    return null;
  }

  return (
    <div className='table-info'>
      {showRotators && (
        <>
          <div className='table-info__rotator_ccw' onClick={onRotateCcwClick}>
            <RotateCWIcon />
          </div>
          <div className='table-info__rotator_cw' onClick={onRotateCwClick}>
            <RotateCCWIcon />
          </div>
        </>
      )}
      <div className='table-info__info' onClick={onTableInfoToggle}>
        {showRoundInfo && (
          <>
            {!!round && <div className='table-info__round'>{round}</div>}
            {riichiCount !== undefined && <TableTenbou icon={<RiichiIcon />} count={riichiCount} />}
            {honbaCount !== undefined && <TableTenbou icon={<HonbaIcon />} count={honbaCount} />}
            {showTimer && <div className='table-info__timer'>{currentTime}</div>}
            {gamesLeft && (
              <div className='table-info__games-left'>
                <div className='table-info__games-left-count'>
                  {loc._nt(['%1 deal left', '%1 deals left'], gamesLeft, [gamesLeft])}
                </div>
              </div>
            )}
          </>
        )}
        {showTableNumber && (
          <>
            <div className='table-info__table-caption'>{loc._t('Table #%1', [tableNumber])}</div>
            {/*TODO*/}
            {/*{showTimer && isAutostartTimer && (*/}
            {/*  <>*/}
            {/*    <hr className='table-info__autostart-separator' />*/}
            {/*    <div className='table-info__autostart-hint'>*/}
            {/*      {loc._t('Time before game start:')}*/}
            {/*    </div>*/}
            {/*  </>*/}
            {/*)}*/}
            {showTimer && !timerWaiting && <div className='table-info__timer'>{currentTime}</div>}
          </>
        )}
      </div>
    </div>
  );
});
