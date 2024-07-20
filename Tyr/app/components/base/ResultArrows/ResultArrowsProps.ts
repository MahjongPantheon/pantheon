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

export type ResultArrowsProps = {
  arrows: PlayerArrow[];
  width: number;
  height: number;
};

export type PlayerArrow = {
  points: number;
  honbaPoints: number;
  withRiichi: boolean;
  withPao: boolean;
  start: PlayerSide;
  end: PlayerSide;
};

export enum PlayerSide {
  TOP,
  LEFT,
  RIGHT,
  BOTTOM,
}