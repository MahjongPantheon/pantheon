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

import { Fragment, FC, useContext } from 'react';
import { getRoundDescription } from './RoundSelectors';
import { IRoundOverviewInfo } from './RoundTypes';
import { i18n } from '../../../i18n';

export const RoundInfo: FC<IRoundOverviewInfo> = (props: IRoundOverviewInfo) => {
  const loc = useContext(i18n);
  const description = getRoundDescription(props, loc);
  const length = description.length;

  return (
    <div className='page-log__info'>
      {description.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i !== length - 1 && <br />}
        </Fragment>
      ))}
    </div>
  );
};
