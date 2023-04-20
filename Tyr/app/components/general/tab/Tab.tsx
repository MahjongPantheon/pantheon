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
import './tab.css';
import classNames from 'classnames';

type TabItem = {
  caption: string;
  isActive?: boolean;
  onClick: () => void;
};

type IProps = {
  items: TabItem[];
};

export class Tab extends React.Component<IProps> {
  render() {
    const { items } = this.props;

    return (
      <div className='tab-panel'>
        <div className='tab-panel__items'>
          {items.map((item, i) => (
            <div
              key={i}
              className={classNames('tab-panel__item', {
                'tab-panel__item--active': item.isActive,
              })}
              onClick={item.onClick}
            >
              {item.caption}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
