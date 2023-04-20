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
import { Point, ArrowList } from '../base';
import { getPayment } from '../utils';
import { RiichiBet } from '../base-components/RiichiBet';
import { RIICHI_HEIGHT, RIICHI_WIDTH, TEXT_PATH_OFFSET } from '../vars';
import { ArrowEndByAngle } from '../base-components/ArrowEnd';
import { PlayerSide } from '#/components/general/result-arrows/ResultArrowsProps';

type IProps = {
  width: number;
  height: number;
  arrows: ArrowList;
};

export const LeftRightArrow = React.memo(function LeftRightArrow(props: IProps) {
  const { width, height, arrows } = props;
  const arrow = arrows.LeftRight ?? arrows.RightLeft;

  if (!arrow) {
    return null;
  }

  const fromLeftToRight = arrow.start === PlayerSide.LEFT;
  const getTextAnchor = (fromStart: boolean) => (fromStart ? 'start' : 'end');
  const getStartOffset = (fromStart: boolean) => (fromStart ? '5%' : '95%');
  const riichiOffsetX = width * 0.05 + RIICHI_WIDTH / 2;
  const riichiOffsetY = height / 2 + RIICHI_HEIGHT / 2 + TEXT_PATH_OFFSET;

  const payment = getPayment(arrow);
  const id = 'left-right';

  return (
    <g>
      <path id={id} d={`M ${0} ${height / 2} H ${width}`} stroke='currentColor' fill='none' />
      {!fromLeftToRight && <ArrowEndByAngle offset={new Point(0, height / 2)} angle={0} />}
      {fromLeftToRight && <ArrowEndByAngle offset={new Point(width, height / 2)} angle={180} />}

      {payment !== '0' && (
        <text transform={`translate(${0} ${-TEXT_PATH_OFFSET})`}>
          <textPath
            xlinkHref={'#' + id}
            startOffset={getStartOffset(!fromLeftToRight)}
            textAnchor={getTextAnchor(!fromLeftToRight)}
            fill='currentColor'
          >
            {payment}
          </textPath>
        </text>
      )}
      {arrow.withRiichi && <RiichiBet offsetX={riichiOffsetX} offsetY={riichiOffsetY} angle={0} />}

      {arrow.withPao && (
        <text transform={`translate(${0} ${-TEXT_PATH_OFFSET})`}>
          <textPath
            xlinkHref={'#' + id}
            startOffset={getStartOffset(fromLeftToRight)}
            textAnchor={getTextAnchor(fromLeftToRight)}
            fill='currentColor'
          >
            pao
          </textPath>
        </text>
      )}
    </g>
  );
});
