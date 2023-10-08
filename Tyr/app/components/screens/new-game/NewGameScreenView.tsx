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
import './page-new-game.css';
import { TopPanel } from '../../general/top-panel/TopPanel';
import { PlayerDropdown } from '../../general/dropdown/PlayerDropdown';
import classNames from 'classnames';
import { i18n } from '../../i18n';
import CloseIcon from '../../../img/icons/close.svg?react';
import ShuffleIcon from '../../../img/icons/shuffle.svg?react';
import SaveIcon from '../../../img/icons/check.svg?react';

type IProps = {
  east?: string;
  south?: string;
  west?: string;
  north?: string;
  canSave: boolean;
  onBackClick: () => void;
  onShuffleClick: () => void;
  onSaveClick: () => void;
  onClearClick: () => void;
  onPlayerClick: (side: string) => void;
};

export const NewGameScreenView = React.memo(function (props: IProps) {
  const loc = React.useContext(i18n);
  const {
    east,
    south,
    west,
    north,
    canSave,
    onBackClick,
    onShuffleClick,
    onSaveClick,
    onClearClick,
    onPlayerClick,
  } = props;

  return (
    <div className='page-new-game'>
      <TopPanel onBackClick={onBackClick} />
      <div className='page-new-game__inner'>
        <div className='page-new-game__players'>
          <PlayerDropdown wind='東' playerName={east} onPlayerClick={() => onPlayerClick('東')} />
          <PlayerDropdown wind='南' playerName={south} onPlayerClick={() => onPlayerClick('南')} />
          <PlayerDropdown wind='西' playerName={west} onPlayerClick={() => onPlayerClick('西')} />
          <PlayerDropdown wind='北' playerName={north} onPlayerClick={() => onPlayerClick('北')} />
          <div className='page-new-game__buttons'>
            <div className='flat-btn' onClick={onClearClick}>
              <CloseIcon />
              <label>{loc._t('Clear players')}</label>
            </div>
            <div className='flat-btn' onClick={onShuffleClick}>
              <ShuffleIcon />
              <label>{loc._t('Shuffle players')}</label>
            </div>
            <div
              className={classNames('flat-btn', { 'flat-btn--disabled': !canSave })}
              onClick={onSaveClick}
            >
              <SaveIcon />
              <label>{loc._t('Start game')}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
