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

import styles from './ResultArrows.module.css';
import { START_ARROWS_OFFSET } from './vars';
import { BottomLeftArrow } from './SideArrows/BottomLeftArrow';
import { ArrowList } from './base';
import { BottomRightArrow } from './SideArrows/BottomRightArrow';
import { TopBottomArrow } from './SideArrows/TopBottomArrow';
import { LeftRightArrow } from './SideArrows/LeftRightArrow';
import { TopLeftArrow } from './SideArrows/TopLeftArrow';
import { TopRightArrow } from './SideArrows/TopRightArrow';
import { PlayerSide, ResultArrowsProps } from './ResultArrowsProps';

export const ResultArrows = ({ arrows, width, height }: ResultArrowsProps) => {
  const offsetX = 0.1 * (width / 2 - START_ARROWS_OFFSET * 2);
  const offsetY = 0.1 * (height / 2 - START_ARROWS_OFFSET * 2);

  const arrowList: ArrowList = {};
  arrows.forEach((arrow) => {
    let start = PlayerSide[arrow.start].toLowerCase();
    start = start[0].toUpperCase() + start.slice(1);
    let end = PlayerSide[arrow.end].toLowerCase();
    end = end[0].toUpperCase() + end.slice(1);
    // @ts-expect-error
    arrowList[start + end] = arrow;
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.svgContainer}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          fill='none'
          stroke='none'
        >
          <BottomLeftArrow
            offsetX={offsetX}
            offsetY={offsetY}
            arrows={arrowList}
            width={width}
            height={height}
          />
          <BottomRightArrow
            offsetX={offsetX}
            offsetY={offsetY}
            arrows={arrowList}
            width={width}
            height={height}
          />
          <TopLeftArrow
            offsetX={offsetX}
            offsetY={offsetY}
            arrows={arrowList}
            width={width}
            height={height}
          />
          <TopRightArrow
            offsetX={offsetX}
            offsetY={offsetY}
            arrows={arrowList}
            width={width}
            height={height}
          />
          <TopBottomArrow arrows={arrowList} width={width} height={height} />
          <LeftRightArrow arrows={arrowList} width={width} height={height} />
        </svg>
      </div>
    </div>
  );
};
