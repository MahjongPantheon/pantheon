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

import { Point, ArrowList } from '../base';
import { getPayment } from '../utils';
import { RiichiBet } from '../BaseComponents/RiichiBet';
import { RIICHI_HEIGHT, RIICHI_WIDTH, TEXT_PATH_OFFSET } from '../vars';
import { ArrowEndByAngle } from '../BaseComponents/ArrowEnd';
import { PlayerSide } from '../ResultArrowsProps';
import { memo } from 'react';

type IProps = {
  width: number;
  height: number;
  arrows: ArrowList;
};

export const TopBottomArrow = memo(function TopBottomArrow(props: IProps) {
  const { width, height, arrows } = props;
  const arrow = arrows.BottomTop ?? arrows.TopBottom;

  if (!arrow) {
    return null;
  }

  const fromTopToBottom = arrow.start === PlayerSide.TOP;
  const getTextAnchor = (fromStart: boolean) => (fromStart ? 'start' : 'end');
  const getStartOffset = (fromStart: boolean) => (fromStart ? '5%' : '95%');
  const riichiOffsetX = width / 2 - RIICHI_HEIGHT / 2 - TEXT_PATH_OFFSET;
  const riichiOffsetY = height * 0.05 + RIICHI_WIDTH / 2;

  const payment = getPayment(arrow);
  const id = 'top-bottom';

  return (
    <g>
      <g>
        <path id={id} d={`M ${width / 2} ${0} V ${height}`} stroke='currentColor' fill='none' />
        {fromTopToBottom && <ArrowEndByAngle offset={new Point(width / 2, height)} angle={-90} />}
        {!fromTopToBottom && <ArrowEndByAngle offset={new Point(width / 2, 0)} angle={90} />}

        {payment !== '0' && (
          <text transform={`translate(${TEXT_PATH_OFFSET} ${0})`}>
            <textPath
              xlinkHref={'#' + id}
              startOffset={getStartOffset(!fromTopToBottom)}
              textAnchor={getTextAnchor(!fromTopToBottom)}
              fill='currentColor'
            >
              {payment}
            </textPath>
          </text>
        )}
        {arrow.withRiichi && (
          <RiichiBet offsetX={riichiOffsetX} offsetY={riichiOffsetY} angle={90} />
        )}

        {arrow.withPao && (
          <text transform={`translate(${TEXT_PATH_OFFSET} ${0})`}>
            <textPath
              xlinkHref={'#' + id}
              startOffset={getStartOffset(fromTopToBottom)}
              textAnchor={getTextAnchor(fromTopToBottom)}
              fill='currentColor'
            >
              pao
            </textPath>
          </text>
        )}
      </g>
    </g>
  );
});
