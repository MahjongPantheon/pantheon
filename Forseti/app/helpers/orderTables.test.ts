// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { GameConfig, TableState } from 'tsclients/proto/atoms.pb';
import { orderTables } from './orderTables';

describe('games management table order', () => {
  const tables = [10, 2, 1].map((tableIndex) => TableState.initialize({ tableIndex }));

  it('orders tournament tables by numeric table index without changing the source order', () => {
    const result = orderTables(tables, GameConfig.initialize({ syncStart: true }));

    expect(result.map((table) => table.tableIndex)).toEqual([1, 2, 10]);
    expect(tables.map((table) => table.tableIndex)).toEqual([10, 2, 1]);
  });

  it('preserves the existing order for other events', () => {
    expect(orderTables(tables, GameConfig.initialize({ syncStart: false }))).toEqual(tables);
  });

  it('preserves the existing order until the event configuration loads', () => {
    expect(orderTables(tables, null)).toEqual(tables);
  });
});
