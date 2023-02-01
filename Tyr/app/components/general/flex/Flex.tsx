import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import './flex.css';

const MAIN_CLASS_NAME = 'flex-container';

export type FlexProps = PropsWithChildren<{
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  gap?: 2 | 4 | 8 | 12 | 16;
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  maxWidth?: boolean;
  maxHeight?: boolean;
  className?: string;
}>;

export const Flex: React.FC<FlexProps> = ({
  alignItems,
  direction,
  gap,
  justify,
  maxWidth,
  maxHeight,
  className,
  children,
}) => {
  const alignClassName = alignItems !== undefined ? `${MAIN_CLASS_NAME}--align-${alignItems}` : '';
  const directionClassName =
    direction !== undefined ? `${MAIN_CLASS_NAME}--direction-${direction}` : '';
  const gapClassName = gap !== undefined ? `${MAIN_CLASS_NAME}--gap-${gap}` : '';
  const justifyClassName = justify !== undefined ? `${MAIN_CLASS_NAME}--justify-${justify}` : '';

  return (
    <div
      className={classNames(
        MAIN_CLASS_NAME,
        alignClassName,
        directionClassName,
        gapClassName,
        justifyClassName,
        {
          [`${MAIN_CLASS_NAME}--max-width`]: maxWidth,
          [`${MAIN_CLASS_NAME}--max-height`]: maxHeight,
        },
        className
      )}
    >
      {children}
    </div>
  );
};
