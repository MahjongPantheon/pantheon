import { styled } from '@stitches/react';
import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';

const MAIN_CLASS_NAME = 'grid-container__item';

const cellNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type CellNumber = (typeof cellNumbers)[number];

export type ItemProps = PropsWithChildren<{
  columnStart?: CellNumber;
  rowStart?: CellNumber;
  columnEnd?: CellNumber | -1;
  rowEnd?: CellNumber | -1;
  className?: string;
}>;

export const Item: React.FC<ItemProps> = ({
  columnStart,
  rowStart,
  columnEnd,
  rowEnd,
  className,
  children,
}) => {
  const columnStartClassName =
    columnStart !== undefined ? `${MAIN_CLASS_NAME}--column-start-${columnStart}` : '';
  const rowStartClassName =
    rowStart !== undefined ? `${MAIN_CLASS_NAME}--row-start-${rowStart}` : '';
  const columnEndClassName =
    columnEnd !== undefined ? `${MAIN_CLASS_NAME}--column-end-${columnEnd}` : '';
  const rowEndClassName = rowEnd !== undefined ? `${MAIN_CLASS_NAME}--row-end-${rowEnd}` : '';

  return (
    <div
      className={classNames(
        MAIN_CLASS_NAME,
        columnStartClassName,
        rowStartClassName,
        columnEndClassName,
        rowEndClassName,
        className
      )}
    >
      {children}
    </div>
  );
};
