import React, { PropsWithChildren } from 'react';
import { Item } from '#/components/general/grid/partials/Item';
import classNames from 'classnames';
import './grid.css';

const MAIN_CLASS_NAME = 'grid-container';

export type GridProps = PropsWithChildren<{
  gap?: 6;
  columns?: string;
  rows?: string;
  className?: string;
}>;

export const Grid = (({ gap, columns, rows, className, children }: GridProps) => {
  const gapClassName = gap !== undefined ? `${MAIN_CLASS_NAME}--gap-${gap}` : '';
  return (
    <div
      className={classNames(MAIN_CLASS_NAME, gapClassName, className)}
      style={{ gridTemplateColumns: columns, gridTemplateRows: rows }}
    >
      {children}
    </div>
  );
}) as React.FC<GridProps> & Partials;

interface Partials {
  Item: typeof Item;
}

Grid.Item = Item;
