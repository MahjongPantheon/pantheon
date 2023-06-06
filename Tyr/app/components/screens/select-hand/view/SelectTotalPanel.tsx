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
import { NumberSelect } from '../../../general/number-select/NumberSelect';
import { i18n } from '../../../i18n';
import { I18nService } from '../../../../services/i18n';

type IProps = {
  isYakuman: boolean;

  yakuHan: number;

  doraCount: number;
  doraValues: number[];
  onDoraSelected: (value: number) => void;

  withUraDora?: boolean;
  uraDoraCount?: number;
  uraDoraValues?: number[];
  onUraDoraSelected: (value: number) => void;

  withRedFives?: boolean;
  redFivesCount?: number;
  redFivesValues?: number[];
  onRedFivesSelected: (value: number) => void;

  fuCount: number;
  fuValues: number[];
  onFuSelected: (value: number) => void;
};

export class SelectTotalPanel extends React.Component<IProps> {
  static contextType = i18n;
  private get hanCount(): number {
    const { yakuHan, doraCount, uraDoraCount = 0, redFivesCount = 0 } = this.props;
    return yakuHan + doraCount + uraDoraCount + redFivesCount;
  }

  render() {
    const loc = this.context as I18nService;
    const {
      isYakuman,
      yakuHan,
      doraCount,
      doraValues,
      onDoraSelected,
      withUraDora,
      uraDoraCount,
      uraDoraValues,
      onUraDoraSelected,
      withRedFives,
      redFivesCount,
      redFivesValues,
      onRedFivesSelected,
      fuCount,
      fuValues,
      onFuSelected,
    } = this.props;

    const totalHandAmount = fuCount
      ? loc._t('%1 han %2 fu', [this.hanCount, fuCount])
      : loc._t('%1 han', [this.hanCount]);

    return (
      <div className='select-total-panel'>
        {!isYakuman && (
          <>
            <div className='select-total-panel__top-group'>
              {loc._t('Han from yaku')} <span>{yakuHan}</span>
            </div>
            <div className='select-total-panel__max'>
              <div className='select-total-panel__select-group'>
                <div className='select-total-panel__select-group-caption'>{loc._t('Dora')}</div>
                <NumberSelect
                  value={doraCount}
                  possibleValues={doraValues}
                  onChange={onDoraSelected}
                />
              </div>
              {withUraDora && uraDoraCount !== undefined && uraDoraValues !== undefined && (
                <div className='select-total-panel__select-group'>
                  <div className='select-total-panel__select-group-caption'>
                    {loc._t('Ura dora')}
                  </div>
                  <NumberSelect
                    value={uraDoraCount}
                    possibleValues={uraDoraValues}
                    onChange={onUraDoraSelected}
                  />
                </div>
              )}
              {withRedFives && redFivesCount !== undefined && redFivesValues !== undefined && (
                <div className='select-total-panel__select-group'>
                  <div className='select-total-panel__select-group-caption'>
                    {loc._t('Red fives')}
                  </div>
                  <NumberSelect
                    value={redFivesCount}
                    possibleValues={redFivesValues}
                    onChange={onRedFivesSelected}
                  />
                </div>
              )}
              <div className='select-total-panel__select-group'>
                <div className='select-total-panel__select-group-caption'>{loc._t('Fu')}</div>
                <NumberSelect value={fuCount} possibleValues={fuValues} onChange={onFuSelected} />
              </div>
            </div>
            <div className='select-total-panel__bottom-group'>{totalHandAmount}</div>
          </>
        )}
        {isYakuman && <div className='select-total-panel__center'>{loc._t('Yakuman')}</div>}
      </div>
    );
  }
}
