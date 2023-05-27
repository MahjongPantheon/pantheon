/*  Pantheon common files
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
