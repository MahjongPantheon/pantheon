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
import './page-set-hand.css';
import classNames from 'classnames';
import { YakuGroup, YakuItem } from '../YakuTypes';

type IProps = {
  yakuGroups: YakuGroup[];
};

export class SelectYakuPanel extends React.Component<IProps> {
  onYakuClick(yaku: YakuItem) {
    if (!yaku.disabled) {
      yaku.onClick();
    }
  }

  render() {
    const { yakuGroups } = this.props;

    return (
      <div className='select-yaku-panel'>
        {yakuGroups.map((yakuGroup, i) => (
          <div key={i} className='select-yaku-panel__group'>
            {yakuGroup.map((yaku, j) => (
              <div
                key={j}
                className={classNames(
                  'select-yaku-panel__button',
                  { 'select-yaku-panel__button--pressed': yaku.pressed },
                  { 'select-yaku-panel__button--disabled': yaku.disabled }
                )}
                onClick={() => this.onYakuClick(yaku)}
              >
                {yaku.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
