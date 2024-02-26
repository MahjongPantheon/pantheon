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

export interface StorageStrategy {
  get(key: string, type: "int" | "string"): any | null;
  set(key: string, type: "int" | "string", value: any): void;
  delete(key: string): void;
  clear(): void;
}

export interface IStorage {
  clear(): void;

  getAuthToken(): string | null;
  getPersonId(): number | null;
  getEventId(): number | null;
  getSessionId(): string | null;
  getLang(): string | null;
  getTheme(): string | null;
  getSingleDeviceMode(): boolean;
  getDimmed(): boolean;

  setAuthToken(token: string): IStorage;
  setPersonId(id: number): IStorage;
  setEventId(id: number): IStorage;
  setSessionId(id: string): IStorage;
  setLang(lang: string): IStorage;
  setTheme(theme: string): IStorage;
  setSingleDeviceMode(enabled: boolean): IStorage;
  setDimmed(enabled: boolean): IStorage;

  deleteAuthToken(): IStorage;
  deletePersonId(): IStorage;
  deleteSessionId(): IStorage;
  deleteEventId(): IStorage;
  deleteLang(): IStorage;
  deleteTheme(): IStorage;
  deleteSingleDeviceMode(): IStorage;
}

// These should be same as in Common/Storage.php cookie interface
const AUTH_TOKEN_KEY = "auth";
const PERSON_ID_KEY = "pid";
const EVENT_ID_KEY = "eid";
const LANG_KEY = "lng";
const SESSION_KEY = "sid";
const THEME_KEY = "thm";
const DIMMED_KEY = "dim";
const SINGLE_DEVICE_MODE_KEY = "sdm";

export class Storage implements IStorage {
  private strategy?: StorageStrategy;

  public setStrategy(strategy: StorageStrategy) {
    this.strategy = strategy;
  }

  public getAuthToken(): string | null {
    return this.get(AUTH_TOKEN_KEY, "string") as string | null;
  }

  public getPersonId(): number | null {
    return this.get(PERSON_ID_KEY, "int") as number | null;
  }

  public getEventId(): number | null {
    return this.get(EVENT_ID_KEY, "int") as number | null;
  }

  public getSessionId(): string | null {
    return this.get(SESSION_KEY, "string") as string | null;
  }

  public getLang(): string | null {
    return this.get(LANG_KEY, "string") as string | null;
  }

  public getTheme(): string | null {
    return this.get(THEME_KEY, "string") as string | null;
  }

  public getDimmed(): boolean {
    return !!this.get(DIMMED_KEY, "int");
  }

  public getSingleDeviceMode(): boolean {
    return !!this.get(SINGLE_DEVICE_MODE_KEY, "int");
  }

  public setAuthToken(token: string): IStorage {
    this.set(AUTH_TOKEN_KEY, "string", token);
    return this;
  }

  public setPersonId(id: number): IStorage {
    this.set(PERSON_ID_KEY, "int", id);
    return this;
  }

  public setEventId(id: number): IStorage {
    this.set(EVENT_ID_KEY, "int", id);
    return this;
  }

  public setSessionId(id: string): IStorage {
    this.set(SESSION_KEY, "string", id);
    return this;
  }

  public setLang(lang: string): IStorage {
    this.set(LANG_KEY, "string", lang);
    return this;
  }

  public setTheme(theme: string): IStorage {
    this.set(THEME_KEY, "string", theme);
    return this;
  }

  public setDimmed(dimmed: boolean): IStorage {
    this.set(DIMMED_KEY, "int", dimmed ? 1 : 0);
    return this;
  }

  public setSingleDeviceMode(enabled: boolean): IStorage {
    if (enabled) {
      this.set(SINGLE_DEVICE_MODE_KEY, "int", 1);
    } else {
      this.deleteSingleDeviceMode();
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

  public deleteSessionId(): IStorage {
    this.delete(SESSION_KEY);
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

  protected get(key: string, type: "int" | "string"): any | null {
    return this.strategy?.get(key, type);
  }

  protected set(key: string, type: "int" | "string", value: any): void {
    this.strategy?.set(key, type, value);
  }

  protected delete(key: string): void {
    this.strategy?.delete(key);
  }

  public clear(): void {
    this.strategy?.clear();
  }
}
