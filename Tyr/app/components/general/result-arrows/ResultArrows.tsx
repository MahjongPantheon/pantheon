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

import * as React from 'react';
import './result-arrows.css';
import { START_ARROWS_OFFSET } from './vars';
import { BottomLeftArrow } from './sideArrows/BottomLeftArrow';
import { ArrowList } from './base';
import { BottomRightArrow } from './sideArrows/BottomRightArrow';
import { TopBottomArrow } from './sideArrows/TopBottomArrow';
import { LeftRightArrow } from './sideArrows/LeftRightArrow';
import { TopLeftArrow } from './sideArrows/TopLeftArrow';
import { TopRightArrow } from './sideArrows/TopRightArrow';
import {
  PlayerSide,
  ResultArrowsProps,
} from '#/components/general/result-arrows/ResultArrowsProps';

declare var frame: any;

type IState = {
  width: number;
  height: number;
};

export class ResultArrows extends React.PureComponent<ResultArrowsProps, IState> {
  state = {
    width: 0,
    height: 0,
  };

  containerRef = React.createRef<HTMLDivElement>();

  componentDidMount(): void {
    this.onFrameHeightChanged();
    frame.addEventListener('resize', this.onFrameHeightChanged.bind(this));
  }

  componentWillUnmount(): void {
    frame.removeEventListener('resize', this.onFrameHeightChanged.bind(this));
  }

  private onFrameHeightChanged() {
    const svgContainer = this.containerRef.current;
    if (svgContainer) {
      this.setState({
        width: svgContainer.clientWidth,
        height: svgContainer.clientHeight,
      });
    }
  }

  render() {
    const { width, height } = this.state;
    const { arrows } = this.props;
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
      <div className='result-arrows'>
        <div className='result-arrows__inner' ref={this.containerRef}>
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
  }
}
