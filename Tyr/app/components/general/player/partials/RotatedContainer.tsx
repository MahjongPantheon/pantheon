import React, { PropsWithChildren, useRef, useState } from 'react';
import { Flex } from '#/components/general/flex/Flex';
import { VARIABLES } from '#/styles/variables';
import { useSizeObserver } from '#/components/general/size-observer/useSizeObserver';

export type StatusProps = PropsWithChildren<{
  rotated?: 0 | 90 | 180 | 270;
}>;

/**
 * line height is always lineHeightPrimary
 */
export const RotatedContainer: React.FC<StatusProps> = ({ rotated, children }) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const [containerWidth, containerHeight] = useSizeObserver(containerRef);

  const isVertical = rotated === 90 || rotated === 270;

  const width = (isVertical ? containerHeight : containerWidth) ?? 0;
  const height = VARIABLES.lineHeightPrimary;

  const translateSide = (width - height) / (rotated === 90 ? 2 : -2);

  const transform = isVertical
    ? { transform: `rotate(${rotated}deg) translate(${translateSide}px, ${translateSide}px)` }
    : rotated === 180
    ? { transform: 'rotate(180deg)' }
    : {};

  return (
    <div
      style={{
        height: isVertical ? '100%' : height,
        width: isVertical ? height : '100%',
        overflow: 'hidden',
      }}
      ref={setContainerRef}
    >
      {containerWidth !== undefined && containerHeight !== undefined && (
        <Flex
          style={{ width: width, height: height, ...transform }}
          className='player__rotated-container'
          justify='center'
          alignItems='center'
        >
          {children}
        </Flex>
      )}
    </div>
  );
};
