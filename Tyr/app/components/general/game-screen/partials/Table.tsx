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

  const size = (sideLength * 2 + 1) as CellNumber;
  const sizeClassName = size !== undefined ? `${TABLE_GRID_CLASS_NAME}--size-${size}` : '';

  // todo check it updates on device rotate
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;

  const centerSlot = {
    rowStart: (sideLength + 1) as CellNumber,
    rowEnd: (sideLength + 2) as CellNumber,
    columnStart: (sideLength + 1) as CellNumber,
    columnEnd: (sideLength + 2) as CellNumber,
  };

  const topSlot = {
    rowStart: 1 as CellNumber,
    columnStart: 2 as CellNumber,
    columnEnd: size as CellNumber,
    firstItemColumnStart: isPortrait ? (1 as CellNumber) : (2 as CellNumber),
    firstItemColumnEnd: isPortrait ? ((size + 1) as CellNumber) : (size as CellNumber),
  };

  const leftSlot = {
    columnStart: 1,
    rowStart: centerSlot.rowStart,
    rowEnd: centerSlot.rowEnd,
    firstItemRowStart: isPortrait ? (2 as CellNumber) : (1 as CellNumber),
    firstItemRowEnd: isPortrait ? size : ((size + 1) as CellNumber),
  };

  const rightSlot = {
    columnStart: centerSlot.columnEnd,
    rowStart: leftSlot.rowStart,
    rowEnd: leftSlot.rowEnd,
    lastItemRowStart: leftSlot.firstItemRowStart,
    lastItemRowEnd: leftSlot.firstItemRowEnd,
  };

  const bottomSlot = {
    rowStart: centerSlot.rowEnd,
    columnStart: topSlot.columnStart,
    columnEnd: topSlot.columnEnd,
    lastItemColumnStart: topSlot.firstItemColumnStart,
    lastItemColumnEnd: topSlot.firstItemColumnEnd,
  };

  return (
    <Grid.Item className='game-screen__table'>
      <Grid gap={6} className={classNames(TABLE_GRID_CLASS_NAME, sizeClassName)}>
        {top.map((element, i) => (
          <Grid.Item
            key={i}
            rowStart={(topSlot.rowStart + i) as CellNumber}
            columnStart={i === 0 ? topSlot.firstItemColumnStart : topSlot.columnStart}
            columnEnd={i === 0 ? topSlot.firstItemColumnEnd : topSlot.columnEnd}
          >
            {element}
          </Grid.Item>
        ))}

        {left.map((element, i) => (
          <Grid.Item
            key={i}
            columnStart={(leftSlot.columnStart + i) as CellNumber}
            rowStart={i === 0 ? leftSlot.firstItemRowStart : leftSlot.rowStart}
            rowEnd={i === 0 ? leftSlot.firstItemRowEnd : leftSlot.rowEnd}
          >
            {element}
          </Grid.Item>
        ))}

        <Grid.Item
          columnStart={centerSlot.columnStart}
          rowStart={centerSlot.rowStart}
          columnEnd={centerSlot.columnEnd}
          rowEnd={centerSlot.rowEnd}
        >
          {center}
        </Grid.Item>

        {right.map((element, i) => (
          <Grid.Item
            key={i}
            columnStart={(rightSlot.columnStart + i) as CellNumber}
            rowStart={i === sideLength - 1 ? rightSlot.lastItemRowStart : rightSlot.rowStart}
            rowEnd={i === sideLength - 1 ? rightSlot.lastItemRowEnd : rightSlot.rowEnd}
          >
            {element}
          </Grid.Item>
        ))}

        {bottom.map((element, i) => (
          <Grid.Item
            key={i}
            rowStart={(bottomSlot.rowStart + i) as CellNumber}
            columnStart={
              i === sideLength - 1 ? bottomSlot.lastItemColumnStart : bottomSlot.columnStart
            }
            columnEnd={i === sideLength - 1 ? bottomSlot.lastItemColumnEnd : bottomSlot.columnEnd}
          >
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
