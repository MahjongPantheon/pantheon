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
import './top-panel.css';
import { SearchInput } from '../search-input/SearchInput';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import LogoutIcon from '../../../img/icons/logout.svg?react';

type IProps = {
  onBackClick?: () => void;
  showSearch?: boolean;
  showLogout?: boolean;
  onSearchChange?: (value: string) => void;
  onLogout?: () => void;
};

export const TopPanel = React.memo(function (props: IProps) {
  const { showSearch, showLogout, onBackClick, onSearchChange, onLogout } = props;

  return (
    <div className='top-panel' style={showLogout ? { justifyContent: 'space-between' } : undefined}>
      <div className='svg-button' onClick={onBackClick}>
        <BackIcon />
      </div>

      {showLogout && onLogout && (
        <div className='svg-button svg-button-right' onClick={onLogout}>
          <LogoutIcon />
        </div>
      )}

      {showSearch && onSearchChange && (
        <div className='top-panel__search'>
          <SearchInput onChange={onSearchChange} />
        </div>
      )}
    </div>
  );
});
