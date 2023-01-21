import { PlayerArrow } from '#/components/general/result-arrows/ResultArrowsProps';

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export enum Direction {
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
}

export type ArrowList = {
  TopLeft?: PlayerArrow;
  TopRight?: PlayerArrow;
  TopBottom?: PlayerArrow;

  LeftTop?: PlayerArrow;
  LeftRight?: PlayerArrow;
  LeftBottom?: PlayerArrow;

  RightTop?: PlayerArrow;
  RightLeft?: PlayerArrow;
  RightBottom?: PlayerArrow;

  BottomTop?: PlayerArrow;
  BottomLeft?: PlayerArrow;
  BottomRight?: PlayerArrow;
};
