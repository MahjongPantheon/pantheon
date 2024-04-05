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

import Yakitori from '../../../img/yakitori.svg?react';

export const YakitoriIndicator = () => {
  return (
    <div
      style={{
        backgroundColor: '#e57b1e',
        color: '#000',
        borderRadius: '6px',
        width: '36px',
        height: '28px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: ' 1px 1px 3px 0px rgba(0,0,0,0.75)',
      }}
    >
      <Yakitori />
    </div>
  );
};
