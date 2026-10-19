import { GameConfig, TableState } from 'tsclients/proto/atoms.pb';

export function orderTables(tables: TableState[], eventConfig: GameConfig | null): TableState[] {
  return eventConfig?.syncStart
    ? [...tables].sort((a, b) => (a.tableIndex ?? 0) - (b.tableIndex ?? 0))
    : tables;
}
