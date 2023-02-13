import React, { useState } from 'react';
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
import { useSizeObserver } from '#/components/general/size-observer/useSizeObserver';
import { Flex } from '#/components/general/flex/Flex';

export const PaymentSVG: React.FC<ResultArrowsProps & { width: number; height: number }> = ({
  arrows,
  width,
  height,
}) => {
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
  );
};

export const ResultArrows: React.FC<ResultArrowsProps> = ({ arrows }) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const [width, height] = useSizeObserver(containerRef);

  console.log(width, height);

  return (
    <Flex className='result-arrows' maxHeight maxWidth ref={setContainerRef}>
      <div className='result-arrows__inner'>
        {width !== undefined && height !== undefined && (
          <PaymentSVG arrows={arrows} width={width} height={height} />
        )}
      </div>
    </Flex>
  );
};
