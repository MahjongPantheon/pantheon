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

import { Direction } from '../base';
import { TEXT_HEIGHT, TEXT_PATH_OFFSET } from '../vars';
import { memo } from 'react';

type IProps = {
  payment: string;
  pathId: string;
  withPao: boolean;
  isTextAbove: boolean;
  direction: Direction;
};

export const ArrowText = memo(function ArrowText(props: IProps) {
  const { payment, pathId, withPao, isTextAbove, direction } = props;

  if (payment === '0' && !withPao) {
    return null;
  }

  const textOffset = TEXT_PATH_OFFSET + (isTextAbove ? 0 : TEXT_HEIGHT);

  const lx = [Direction.TOP_RIGHT, Direction.BOTTOM_RIGHT].includes(direction) ? 1 : -1;
  const ly = [Direction.BOTTOM_RIGHT, Direction.BOTTOM_LEFT].includes(direction) ? 1 : -1;

  const offsetX = textOffset * lx;
  const offsetY = textOffset * ly;

  const text = payment !== '0' ? payment + (withPao ? ' (pao)' : '') : 'pao';

  return (
    <text transform={`translate(${offsetX} ${offsetY})`}>
      <textPath
        xlinkHref={'#' + pathId}
        startOffset={'50%'}
        textAnchor='middle'
        fill='currentColor'
      >
        {text}
      </textPath>
    </text>
  );
});
