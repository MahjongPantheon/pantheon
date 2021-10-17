// Единый интерфейс, который должны реализовывать как внешний
// адаптер, так и все конкретные драйверы
export interface IDBImpl {
  set(key: string, type: 'int' | 'string' | 'object', value: any): boolean;
  get(key: string, type: 'int' | 'string' | 'object'): any;
  delete(keys: string[]): void;
  clear(): void;
}
