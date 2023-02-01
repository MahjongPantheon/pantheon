import React, { PropsWithChildren } from 'react';
import { Grid } from '#/components/general/grid/Grid';
import { PlayerSlot, Table } from '#/components/general/game-screen/partials/Table';
import './game-screen.css';

export type TableProps = PropsWithChildren;

export const GameScreen = (({ children }: TableProps) => (
  <Grid className='game-screen'>{children}</Grid>
)) as React.FC<TableProps> & Partials;

interface Partials {
  Table: typeof Table;
  TableItem: typeof Grid.Item;
  PlayerSlot: typeof PlayerSlot;
  Bottom: typeof Grid.Item;
}

GameScreen.Table = Table;
GameScreen.TableItem = Grid.Item;
GameScreen.PlayerSlot = PlayerSlot;
GameScreen.Bottom = Grid.Item;
