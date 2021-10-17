import * as React from 'react';
import {Direction, Point} from '../base';
import {getAngleForCurve, getCurvePoint} from '../utils';
import {RIICHI_HEIGHT, RIICHI_POINT_RADIUS, RIICHI_STROKE, RIICHI_WIDTH} from '../vars';

type IProps = {
  offsetX: number
  offsetY: number
  angle: number
}

export const RiichiBet = React.memo(function RiichiBet(props: IProps) {
  const {offsetX, offsetY, angle} = props

  return (
    <g transform={`translate(${offsetX} ${offsetY})`}>
      <g transform={`rotate(${angle})`}>
        <rect width={RIICHI_WIDTH} height={RIICHI_HEIGHT} x={RIICHI_STROKE / 2 - RIICHI_WIDTH / 2} y={RIICHI_STROKE / 2 - RIICHI_HEIGHT / 2} rx="4" ry="4" stroke="currentColor" strokeWidth={RIICHI_STROKE} />
        <circle r={RIICHI_POINT_RADIUS} cx={RIICHI_STROKE / 2} cy={RIICHI_STROKE / 2} style={{fill: "var(--color-danger)"}}  />
      </g>
    </g>
  )
})


type IPropsByCurve = {
  start: Point
  center: Point
  end: Point
  inverted: boolean
  direction: Direction
}

export const RiichiBetByCurve = React.memo(function RiichiBetByCurve(props: IPropsByCurve) {
  const {start, center, end, inverted, direction} = props
  let t = inverted ? 0.5 : 0.5;
  let curvePoint1 = getCurvePoint(start, center, end, t);
  let curvePoint2 = getCurvePoint(start, center, end, t + 0.02);

  let la = [Direction.TOP_RIGHT, Direction.BOTTOM_LEFT].includes(direction) ? 1 : -1;
  let angle = getAngleForCurve(curvePoint1, curvePoint2) * la;

  let lx = [Direction.TOP_RIGHT, Direction.BOTTOM_RIGHT].includes(direction) ? -1 : 1;
  let ly = [Direction.BOTTOM_RIGHT, Direction.BOTTOM_LEFT].includes(direction) ? -1 : 1;
  let pathOffset = 6;
  let offsetX = curvePoint1.x + pathOffset * lx;
  let offsetY = curvePoint1.y + pathOffset * ly;

  return <RiichiBet offsetX={offsetX} offsetY={offsetY} angle={angle} />
})
