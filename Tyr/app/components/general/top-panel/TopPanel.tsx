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

type IProps = {
  onBackClick?: () => void;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
};

export const TopPanel = React.memo(function (props: IProps) {
  const { showSearch, onBackClick, onSearchChange } = props;

  return (
    <div className='top-panel'>
      <div className='svg-button' onClick={onBackClick}>
        <BackIcon />
      </div>

      {showSearch && onSearchChange && (
        <div className='top-panel__search'>
          <SearchInput onChange={onSearchChange} />
        </div>
      )}
    </div>
  );
});
