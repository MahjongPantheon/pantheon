export interface IStorage {
  clear(): void;

  getAuthToken(): string | null;
  getPersonId(): number | null;
  getEventId(): number | null;
  getLang(): string | null;
  getTheme(): string | null;
  getSingleDeviceMode(): boolean;
  getTwirpEnabled(): boolean;

  setAuthToken(token: string): IStorage;
  setPersonId(id: number): IStorage;
  setEventId(id: number): IStorage;
  setLang(lang: string): IStorage;
  setTheme(theme: string): IStorage;
  setSingleDeviceMode(enabled: boolean): IStorage;
  setTwirpEnabled(enabled: boolean): IStorage;

  deleteAuthToken(): IStorage;
  deletePersonId(): IStorage;
  deleteEventId(): IStorage;
  deleteLang(): IStorage;
  deleteTheme(): IStorage;
  deleteSingleDeviceMode(): IStorage;
  deleteTwirpEnabled(): IStorage;
}

// These should be same as in Common/Storage.php cookie interface
const AUTH_TOKEN_KEY = 'auth';
const PERSON_ID_KEY = 'pid';
const EVENT_ID_KEY = 'eid';
const LANG_KEY = 'lng';
const THEME_KEY = 'thm';
const SINGLE_DEVICE_MODE_KEY = 'sdm';
const TWIRP_ENABLED = 'twrp';

export class Storage implements IStorage {
  constructor(private readonly cookieDomain: string | null) {}

  public getAuthToken(): string | null {
    return this.get(AUTH_TOKEN_KEY, 'string') as string | null;
  }

  public getPersonId(): number | null {
    return this.get(PERSON_ID_KEY, 'int') as number | null;
  }

  public getEventId(): number | null {
    return this.get(EVENT_ID_KEY, 'int') as number | null;
  }

  public getLang(): string | null {
    return this.get(LANG_KEY, 'string') as string | null;
  }

  public getTheme(): string | null {
    return this.get(THEME_KEY, 'string') as string | null;
  }

  public getSingleDeviceMode(): boolean {
    return !!this.get(SINGLE_DEVICE_MODE_KEY, 'int');
  }

  public getTwirpEnabled(): boolean {
    return !!this.get(TWIRP_ENABLED, 'int');
  }

  public setAuthToken(token: string): IStorage {
    this.set(AUTH_TOKEN_KEY, 'string', token);
    return this;
  }

  public setPersonId(id: number): IStorage {
    this.set(PERSON_ID_KEY, 'int', id);
    return this;
  }

  public setEventId(id: number): IStorage {
    this.set(EVENT_ID_KEY, 'int', id);
    return this;
  }

  public setLang(lang: string): IStorage {
    this.set(LANG_KEY, 'string', lang);
    return this;
  }

  public setTheme(theme: string): IStorage {
    this.set(THEME_KEY, 'string', theme);
    return this;
  }

  public setSingleDeviceMode(enabled: boolean): IStorage {
    if (enabled) {
      this.set(SINGLE_DEVICE_MODE_KEY, 'int', 1);
    } else {
      this.deleteSingleDeviceMode();
    }
    return this;
  }

  public setTwirpEnabled(enabled: boolean): IStorage {
    if (enabled) {
      this.set(TWIRP_ENABLED, 'int', 1);
    } else {
      this.deleteTwirpEnabled();
    }
    return this;
  }

  public deleteAuthToken(): IStorage {
    this.delete(AUTH_TOKEN_KEY);
    return this;
  }

  public deletePersonId(): IStorage {
    this.delete(PERSON_ID_KEY);
    return this;
  }

  public deleteEventId(): IStorage {
    this.delete(EVENT_ID_KEY);
    return this;
  }

  public deleteLang(): IStorage {
    this.delete(LANG_KEY);
    return this;
  }

  public deleteTheme(): IStorage {
    this.delete(THEME_KEY);
    return this;
  }

  public deleteSingleDeviceMode(): IStorage {
    this.delete(SINGLE_DEVICE_MODE_KEY);
    return this;
  }

  public deleteTwirpEnabled(): IStorage {
    this.delete(TWIRP_ENABLED);
    return this;
  }

  protected get(key: string, type: 'int' | 'string'): any | null {
    const result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(
      document.cookie
    );

    try {
      return result ? (type === 'int' ? parseInt(result[1], 10) : result[1].toString()) : null;
    } catch (e) {
      return null;
    }
  }

  protected set(key: string, type: 'int' | 'string', value: any): void {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    const expires = ';expires=' + date.toUTCString();
    const domain = this.cookieDomain ? ';domain=' + this.cookieDomain : '';
    document.cookie = `${key}=${value}${expires}${domain}; path=/`;
  }

  protected delete(key: string): void {
    const date = new Date();
    date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000); // time in past
    const expires = ';expires=' + date.toUTCString();
    const domain = this.cookieDomain ? ';domain=' + this.cookieDomain : '';
    document.cookie = key + '=' + expires + domain + '; path=/';
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
  }
}
