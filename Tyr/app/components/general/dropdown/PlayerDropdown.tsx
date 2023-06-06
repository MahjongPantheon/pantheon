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
import './player-dropdown.css';
import { i18n } from '../../i18n';
import { I18nService } from '../../../services/i18n';

type IProps = {
  playerName?: string;
  wind: string;
  onPlayerClick: () => void;
};

export class PlayerDropdown extends React.Component<IProps> {
  static contextType = i18n;
  render() {
    const { playerName, wind, onPlayerClick } = this.props;
    const loc = this.context as I18nService;

    return (
      <div className='player-dropdown'>
        <div className='player-dropdown'>{wind}</div>
        <div className='player-dropdown__player' onClick={onPlayerClick}>
          {!!playerName && <div className='player-dropdown__player-name'>{playerName}</div>}
          {!playerName && (
            <div className='player-dropdown__placeholder'>{loc._t('select player')}</div>
          )}
        </div>
      </div>
    );
  }
}
