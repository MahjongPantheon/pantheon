// Единый интерфейс, который должны реализовывать как внешний
// адаптер, так и все конкретные драйверы
export interface IDBImpl {
  set(key: string, value: any): boolean;
  get(key: string): any;
  delete(keys: string[]): void;
  clear(): void;
}
