import { StorageStrategy } from "./storage";

export class StorageStrategyServer implements StorageStrategy {
  private _cookies: Record<string, string> = {};
  private _cookiesAdd: Record<string, string> = {};
  private _cookiesRemove: string[] = [];
  public fill(cookies: Record<string, string>) {
    this._cookies = cookies;
  }

  public getCookies() {
    return {
      add: this._cookiesAdd,
      remove: this._cookiesRemove,
    };
  }

  public get(key: string, type: "int" | "string"): any | null {
    if (this._cookies[key] === undefined) {
      return null;
    }
    return type === "int"
      ? parseInt(this._cookies[key], 10)
      : this._cookies[key].toString();
  }

  public set(key: string, type: "int" | "string", value: any): void {
    this._cookies[key] = value;
    this._cookiesAdd[key] = value;
  }

  public delete(key: string): void {
    this._cookiesRemove.push(key);
    delete this._cookies[key];
  }

  public clear(): void {
    this._cookiesRemove = Object.keys(this._cookies);
    this._cookies = {};
  }
}
