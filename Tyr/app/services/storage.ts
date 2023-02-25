export interface IStorage {
  set(key: string, type: 'int' | 'string' | 'object', value: any): boolean;
  get(key: string, type: 'int' | 'string' | 'object'): any;
  delete(keys: string[]): void;
  clear(): void;
}

// Cookie storage driver. Should be compatible with Rheda cookie interface
export class Storage implements IStorage {
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
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      [
        window.location.hostname,
        '.' + window.location.hostname.split('.').slice(1).join('.'),
      ].forEach((domain) => {
        document.cookie =
          encodeURIComponent(cookie.split(';')[0].split('=')[0]) +
          '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' +
          domain +
          ' ;path=/';
      });
    }
    this.meta = {};
    this.set('__meta', 'object', {});
  }

  private updateMeta() {
    return this.set('__meta', 'object', this.meta);
  }
}
