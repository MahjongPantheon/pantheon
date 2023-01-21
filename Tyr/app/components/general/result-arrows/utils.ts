import { Point } from './base';
import { PlayerArrow } from './ResultArrowsProps';

export function getCurvePoint(start: Point, center: Point, end: Point, t: number): Point {
  const bx = getBezierCurveCoordinate(start.x, center.x, end.x, t);
  const by = getBezierCurveCoordinate(start.y, center.y, end.y, t);
  return new Point(bx, by);
}

export function getBezierCurveCoordinate(p0: number, p1: number, p2: number, t: number) {
  //Quadratic Bezier curve
  return (1 - t) * (1 - t) * p0 + 2 * t * (1 - t) * p1 + t * t * p2;
}

export function getAngleForCurve(start: Point, point: Point): number {
  const l1 = point.x - start.x;
  const m1 = start.y - point.y;
  const l2 = 1;
  const m2 = 0;

  const cosA = (l1 * l2 + m1 * m2) / (Math.sqrt(l1 * l1 + m1 * m1) * Math.sqrt(l2 * l2 + m2 * m2));
  const angle = (Math.acos(cosA) * 180) / Math.PI;
  return angle;
}

export function getArrowAngle(start: Point, center: Point, end: Point): number {
  const t = 0.08;
  const point = getCurvePoint(start, center, end, t);

  const angle = getAngleForCurve(start, point);
  return angle;
}

export function getPayment(arrow: PlayerArrow): string {
  return arrow.honbaPoints ? `${arrow.points} + ${arrow.honbaPoints}` : arrow.points.toString();
}
