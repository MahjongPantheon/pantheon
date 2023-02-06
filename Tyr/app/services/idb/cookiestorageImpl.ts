import { IDBImpl } from './interface';

// Cookie driver
export class IDBCookieImpl implements IDBImpl {
  private readonly cookieDomain: string | null;
  private meta: { [key: string]: any } = {};

  constructor(cookieDomain: string | null) {
    this.cookieDomain = cookieDomain;
    this.meta = this.get('__meta', 'object');
    if (this.meta === null) {
      this.meta = {};
      this.set('__meta', 'object', {});
    }
  }

  public get(key: string, type: 'int' | 'string' | 'object'): any | null {
    const result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(
      document.cookie
    );

    try {
      return result
        ? type === 'object'
          ? JSON.parse(result[1])
          : type === 'int'
          ? parseInt(result[1], 10)
          : result[1]
        : null;
    } catch (e) {
      return null;
    }
  }

  public set(key: string, type: 'int' | 'string' | 'object', value: any): boolean {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    const expires = ';expires=' + date.toUTCString();
    const domain = this.cookieDomain ? ';domain=' + this.cookieDomain : '';
    document.cookie = `${key}=${
      type === 'object' ? JSON.stringify(value) : value
    }${expires}${domain}; path=/`;
    if (key !== '__meta') {
      this.meta[key] = true;
      this.updateMeta();
    }
    return true;
  }

  public delete(keys: string[]): void {
    const date = new Date();
    date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000); // time in past
    const expires = ';expires=' + date.toUTCString();
    const domain = this.cookieDomain ? ';domain=' + this.cookieDomain : '';

    keys.forEach((key: string) => {
      document.cookie = key + '=' + expires + domain + '; path=/';
      delete this.meta[key];
    });
    this.updateMeta();
  }

  public clear(): void {
    this.delete(Object.keys(this.meta));
  }

  // not used now, might be useful for sync
  public forEach(fn: (key: string, value: any) => void) {
    Object.keys(this.get('__meta', 'object')).forEach((key) => {
      const result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(
        document.cookie
      );
      if (result) {
        fn(key, result[1]);
      }
    });
  }

  private updateMeta() {
    return this.set('__meta', 'object', this.meta);
  }
}
