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

import { Direction, Point } from '../base';
import { getAngleForCurve, getCurvePoint } from '../utils';
import { RIICHI_HEIGHT, RIICHI_POINT_RADIUS, RIICHI_STROKE, RIICHI_WIDTH } from '../vars';
import { memo } from 'react';

type IProps = {
  offsetX: number;
  offsetY: number;
  angle: number;
};

export const RiichiBet = memo(function RiichiBet(props: IProps) {
  const { offsetX, offsetY, angle } = props;

  return (
    <g transform={`translate(${offsetX} ${offsetY})`}>
      <g transform={`rotate(${angle})`}>
        <rect
          width={RIICHI_WIDTH}
          height={RIICHI_HEIGHT}
          x={RIICHI_STROKE / 2 - RIICHI_WIDTH / 2}
          y={RIICHI_STROKE / 2 - RIICHI_HEIGHT / 2}
          rx='4'
          ry='4'
          stroke='currentColor'
          strokeWidth={RIICHI_STROKE}
          style={{ fill: 'var(--riichi-fill-color)' }}
        />
        <circle
          r={RIICHI_POINT_RADIUS}
          cx={RIICHI_STROKE / 2}
          cy={RIICHI_STROKE / 2}
          style={{ fill: 'var(--color-riichi-point)' }}
        />
      </g>
    </g>
  );
});

type IPropsByCurve = {
  start: Point;
  center: Point;
  end: Point;
  inverted: boolean;
  direction: Direction;
};

export const RiichiBetByCurve = memo(function RiichiBetByCurve(props: IPropsByCurve) {
  const { start, center, end, inverted, direction } = props;
  const t = inverted ? 0.5 : 0.5;
  const curvePoint1 = getCurvePoint(start, center, end, t);
  const curvePoint2 = getCurvePoint(start, center, end, t + 0.02);

  const la = [Direction.TOP_RIGHT, Direction.BOTTOM_LEFT].includes(direction) ? 1 : -1;
  const angle = getAngleForCurve(curvePoint1, curvePoint2) * la;

  const lx = [Direction.TOP_RIGHT, Direction.BOTTOM_RIGHT].includes(direction) ? -1 : 1;
  const ly = [Direction.BOTTOM_RIGHT, Direction.BOTTOM_LEFT].includes(direction) ? -1 : 1;
  const pathOffset = 6;
  const offsetX = curvePoint1.x + pathOffset * lx;
  const offsetY = curvePoint1.y + pathOffset * ly;

  return <RiichiBet offsetX={offsetX} offsetY={offsetY} angle={angle} />;
});
