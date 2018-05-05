import { Injectable } from '@angular/core';
import { IDBImpl } from './interface';
import { IDBStorageImpl } from './localstorageImpl';
import { IDBCookieImpl } from './cookiestorageImpl';
import { environment } from '../../../environments/environment';

/**
 * Implementation of persistent storage with synchronization
 * between different engines. Supports cookies and localStorage for now.
 */
@Injectable()
export class IDB implements IDBImpl {
  /**
   * Local storage. Treated as primary storage.
   */
  private storageEngine: IDBImpl;
  /**
   * Cookie storage. Treated as secondary storage.
   */
  private cookieEngine: IDBImpl;
  private activeStorages: IDBImpl[] = [];

  constructor() {
    // Assume we always have at least cookies.
    this.cookieEngine = new IDBCookieImpl(environment.keyPrefix, environment.cookieDomain);
    this.activeStorages.push(this.cookieEngine);

    try { // check is local storage is sane
      localStorage.setItem('testStorageItem', '1');
      if (localStorage.getItem('testStorageItem') !== '1') {
        throw new Error();
      }
      localStorage.removeItem('testStorageItem');
      this.storageEngine = new IDBStorageImpl(environment.keyPrefix);
      this.activeStorages.push(this.storageEngine);

      this.migrate();
    } catch (e) {
      this.storageEngine = this.cookieEngine; // so .get() will work with its current logic
    }
  }

  /**
   * Migration code from old scheme.
   * TODO Remove this in some time...
   */
  private migrate(): void {
    let authTokenOld = localStorage.getItem('authToken');
    let currentLanguageOld = localStorage.getItem('currentLanguage');
    if (authTokenOld !== null) {
      this.set('authToken', authTokenOld);
      localStorage.removeItem('authToken');
    }
    if (currentLanguageOld !== null) {
      this.set('currentLanguage', currentLanguageOld);
      localStorage.removeItem('currentLanguage');
    }
  }

  /**
   * Set value by key
   *
   * @param {string} key Arbitrary key
   * @param {any} value  Any serializable value
   * @return bool Success
   */
  public set(key: string, value: any): boolean {
    return this.activeStorages.reduce<boolean>(
      (acc: boolean, s: IDBImpl) => acc && s.set(key, value),
      true
    );
  }

  /**
   * Get value by key.
   * Synchronizes storages while getting values.
   *
   * @param {string} key Arbitrary key
   * @return any|null Received value or null if not found
   */
  public get(key: string): any|null {
    let valuePrimary = this.storageEngine.get(key);
    let valueSecondary = this.cookieEngine.get(key);

    if (valuePrimary === valueSecondary) {
      return valuePrimary;
    }

    if (valuePrimary === null) {
      this.storageEngine.set(key, valueSecondary);
      return valueSecondary;
    }

    // We come here in case of values conflict only or absence of secondary value -> use primary value.
    this.cookieEngine.set(key, valuePrimary);
    return valuePrimary;
  }

  /**
   * Delete value by key
   *
   * @param {string[]} keys Abritrary key list
   * @return void
   */
  public delete(keys: string[]) {
    this.activeStorages.forEach((s: IDBImpl) => s.delete(keys));
  }

  /**
   * Clear the storage
   *
   * @return void
   */
  public clear() {
    this.activeStorages.forEach((s: IDBImpl) => s.clear());
  }
}
