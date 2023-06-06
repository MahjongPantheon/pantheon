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

import { PlayerArrow } from './ResultArrowsProps';

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
