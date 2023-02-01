import { Grid } from '#/components/general/grid/Grid';
import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { CellNumber } from '#/components/general/grid/partials/Item';

const TABLE_GRID_CLASS_NAME = 'game-screen__table-grid';

type PlayerSlot =
  | [JSX.Element]
  | [JSX.Element, JSX.Element]
  | [JSX.Element, JSX.Element, JSX.Element];
export type TableProps<T extends PlayerSlot> = {
  top: [...T];
  left: [...T];
  right: [...T];
  bottom: [...T];

  center?: JSX.Element;
};

/**
 * to have a proper alignment top, left, right and bottom props should have the same length
 */
export function Table<T extends PlayerSlot>({
  top,
  left,
  right,
  bottom,
  center,
}: TableProps<T>): JSX.Element {
  const sideLength = top.length as CellNumber;

  const size = sideLength * 2 + 1;
  const sizeClassName = size !== undefined ? `${TABLE_GRID_CLASS_NAME}--size-${size}` : '';

  const leftRightSlotColumnStart = (top.length + 1) as CellNumber;

  const centerCellStart = (top.length + 1) as CellNumber;
  const centerCellEnd = (centerCellStart + 1) as CellNumber;

  return (
    <Grid.Item className='game-screen__table'>
      <Grid gap={6} className={classNames(TABLE_GRID_CLASS_NAME, sizeClassName)}>
        {top.map((element, i) => (
          <Grid.Item key={i} columnStart={1} columnEnd={-1}>
            {element}
          </Grid.Item>
        ))}

        {left.map((element, i) => (
          <Grid.Item key={i} rowStart={leftRightSlotColumnStart} rowEnd={-1}>
            {element}
          </Grid.Item>
        ))}

        <Grid.Item
          columnStart={centerCellStart}
          rowStart={centerCellStart}
          columnEnd={centerCellEnd}
          rowEnd={centerCellEnd}
        >
          {center}
        </Grid.Item>

        {right.map((element, i) => (
          <Grid.Item key={i} rowStart={leftRightSlotColumnStart} rowEnd={-1}>
            {element}
          </Grid.Item>
        ))}

        {bottom.map((element, i) => (
          <Grid.Item key={i} columnStart={1} columnEnd={-1}>
            {element}
          </Grid.Item>
        ))}
      </Grid>
    </Grid.Item>
  );
}

export type PlayerSlotProps = PropsWithChildren<{}>;

export const PlayerSlot: React.FC<PlayerSlotProps> = ({ children }) => {
  return <Grid.Item>{children}</Grid.Item>;
};
