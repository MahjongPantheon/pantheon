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

import { Direction, Point, ArrowList } from '../base';
import { getPayment } from '../utils';
import { ArrowText } from '../BaseComponents/ArrowText';
import { ArrowPath } from '../BaseComponents/ArrowPath';
import { RiichiBetByCurve } from '../BaseComponents/RiichiBet';
import { START_ARROWS_OFFSET } from '../vars';
import { ArrowEnd } from '../BaseComponents/ArrowEnd';
import { PlayerSide } from '../ResultArrowsProps';
import { memo } from 'react';

type IProps = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  arrows: ArrowList;
};

export const TopLeftArrow = memo(function TopLeftArrow(props: IProps) {
  const { offsetX, offsetY, width, height, arrows } = props;
  const arrow = arrows.TopLeft ?? arrows.LeftTop;

  if (!arrow) {
    return null;
  }

  const fromLeftToTop = arrow.start === PlayerSide.LEFT;
  const showRiichi = arrow.withRiichi;
  const payment = getPayment(arrow);
  const id = 'top-left';
  const direction = Direction.TOP_LEFT;

  const start = new Point(0, height / 2 - START_ARROWS_OFFSET);
  const center = new Point(
    width / 2 - START_ARROWS_OFFSET - offsetX,
    height / 2 - START_ARROWS_OFFSET - offsetY
  );
  const end = new Point(width / 2 - START_ARROWS_OFFSET, 0);

  return (
    <g>
      <ArrowPath id={id} start={start} center={center} end={end} />
      <ArrowEnd
        start={start}
        center={center}
        end={end}
        inverted={!fromLeftToTop}
        direction={direction}
      />

      {showRiichi && (
        <RiichiBetByCurve
          start={start}
          center={center}
          end={end}
          inverted={!fromLeftToTop}
          direction={direction}
        />
      )}
      <ArrowText
        payment={payment}
        pathId={id}
        withPao={arrow.withPao}
        isTextAbove={true}
        direction={direction}
      />
    </g>
  );
});
