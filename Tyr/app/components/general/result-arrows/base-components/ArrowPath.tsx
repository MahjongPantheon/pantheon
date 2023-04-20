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
import { Point } from '../base';

type IProps = {
  id: string;
  start: Point;
  center: Point;
  end: Point;
};

export const ArrowPath = React.memo(function ArrowPath(props: IProps) {
  const { id, start, center, end } = props;

  return (
    <g>
      <path
        id={id}
        d={`M ${start.x},${start.y} Q${center.x},${center.y} ${end.x},${end.y} `}
        stroke='currentColor'
      />
    </g>
  );
});
