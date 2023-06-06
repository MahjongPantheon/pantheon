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
import { IComponentProps } from '../../IComponentProps';
import { GOTO_PREV_SCREEN } from '../../../store/actions/interfaces';
import { TopPanel } from '../../general/top-panel/TopPanel';
import './page-donate.css';
import donate from '../../../img/donate.jpg';

export class DonateScreen extends React.PureComponent<IComponentProps> {
  private onBackClick() {
    const { dispatch } = this.props;
    dispatch({ type: GOTO_PREV_SCREEN });
  }

  render() {
    return (
      <div className='flex-container page-donate'>
        <div className='flex-container__content'>
          <TopPanel onBackClick={this.onBackClick.bind(this)} />
          <div className='page-donate__meme'>
            <img src={donate} alt='' />
          </div>
          <div className='page-donate__disclaimer'>
            Пантеон существует на голом энтузиазме, но разработчики никогда не откажутся от
            дополнительных средств на его содержание :)
          </div>
          <div className='page-donate__button'>
            <a
              className='flat-btn flat-btn--large'
              style={{ width: '100%' }}
              href='https://pay.cloudtips.ru/p/c9fd6eee'
              target='_blank'
            >
              Внести свою копеечку
            </a>
          </div>
        </div>
      </div>
    );
  }
}
