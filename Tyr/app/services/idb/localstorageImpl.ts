import { IDBImpl } from './interface';

// LocalStorage driver
export class IDBStorageImpl implements IDBImpl {
  private meta: { [key: string]: any } = {};

  constructor() {
    this.meta = this.get('__meta', 'object');
    if (this.meta === null) {
      this.meta = {};
      this.set('__meta', 'object', {});
    }
  }

  public get(key: string, type: 'int' | 'string' | 'object'): any | null {
    try {
      const v = localStorage.getItem(key);
      if (v === null) {
        // tslint:disable-line no-null-keyword
        throw new Error();
      }
      return type === 'object' ? JSON.parse(v) : type === 'int' ? parseInt(v, 10) : v;
    } catch (e) {
      return null;
    }
  }

  public set(key: string, type: 'int' | 'string' | 'object', value: any): boolean {
    try {
      const v = type === 'object' ? JSON.stringify(value) : value;
      this.meta[key] = true;
      localStorage.setItem(key, v);
      if (key !== '__meta') {
        this.updateMeta();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  public delete(keys: string[]): void {
    for (const key of keys) {
      delete this.meta[key];
      localStorage.removeItem(key);
    }
    this.updateMeta();
  }

  public clear(): void {
    for (const k in this.meta) {
      if (this.meta.hasOwnProperty(k)) {
        localStorage.removeItem(k);
      }
    }
    this.meta = {};
    this.updateMeta();
  }

  public export(): string {
    return window.btoa(
      JSON.stringify(
        Object.keys(this.get('__meta', 'object')).map((key) => [key, localStorage.getItem(key)])
      )
    );
  }

  public import(str: string) {
    try {
      const obj = JSON.parse(window.atob(str)) as Array<[string, string]>;
      obj.forEach(([key, value]) => localStorage.setItem(key, value));
    } catch (e) {}
  }

  public forEach(fn: (key: string, value: any) => void) {
    Object.keys(this.get('__meta', 'object')).forEach((key) => {
      const result = localStorage.get(key);
      if (result) {
        fn(key, result);
      }
    });
  }

  private updateMeta() {
    return this.set('__meta', 'object', this.meta);
  }
}
