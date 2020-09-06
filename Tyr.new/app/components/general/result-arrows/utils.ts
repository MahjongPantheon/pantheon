import {Point} from './base';
import {PlayerArrow} from '../../screens/table/base/ResultArrowsProps';

export function getCurvePoint(start: Point, center: Point, end: Point, t: number): Point {
  let bx = getBezierCurveCoordinate(start.x, center.x, end.x, t);
  let by = getBezierCurveCoordinate(start.y, center.y, end.y, t);
  return new Point(bx, by);
}

export function getBezierCurveCoordinate(p0: number, p1: number, p2: number, t: number) {
  //Quadratic Bezier curve
  return (1 - t)*(1 - t) * p0 +  2 * t * (1 - t) * p1 + t * t * p2;
}

export function getAngleForCurve(start: Point, point: Point): number {
  let l1 = point.x - start.x;
  let m1 = start.y - point.y;
  let l2 = 1;
  let m2 = 0;

  let cosA = (l1 * l2 + m1 * m2) / (Math.sqrt(l1 * l1 + m1 * m1) * Math.sqrt(l2 * l2 + m2 * m2));
  let angle =  Math.acos(cosA) * 180 / Math.PI;
  return angle;
}

export function getArrowAngle(start: Point, center: Point, end: Point): number {
  let t = 0.08;
  let point = getCurvePoint(start, center, end, t);

  let angle = getAngleForCurve(start, point);
  return angle;
}

export function getPayment(arrow: PlayerArrow): string {
  return arrow.honbaPoints ? `${arrow.points} + ${arrow.honbaPoints}` : arrow.points.toString();
}
