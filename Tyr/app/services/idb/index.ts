import { IDBImpl } from './interface';
import { IDBStorageImpl } from './localstorageImpl';
import { IDBCookieImpl } from './cookiestorageImpl';
import { MetrikaService } from '../metrika';
import {environment} from "#config";

/**
 * Implementation of persistent storage with synchronization
 * between different engines. Supports cookies and localStorage for now.
 */
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

  constructor(private metrika: MetrikaService) {
    // Assume we always have at least cookies.
    this.cookieEngine = new IDBCookieImpl(environment.cookieDomain);
    this.activeStorages.push(this.cookieEngine);

    try { // check is local storage is sane
      localStorage.setItem('testStorageItem', '1');
      if (localStorage.getItem('testStorageItem') !== '1') {
        this.metrika.track(MetrikaService.LOCAL_ERROR, { message: 'Local storage not supported on device' });
        throw new Error();
      }
      localStorage.removeItem('testStorageItem');
      this.storageEngine = new IDBStorageImpl();
      this.activeStorages.push(this.storageEngine);
    } catch (e) {
      this.storageEngine = this.cookieEngine; // so .get() will work with its current logic
    }
  }

  /**
   * Set value by key
   *
   * @param {string} key Arbitrary key
   * @param type
   * @param {any} value  Any serializable value
   * @return bool Success
   */
  public set(key: string, type: 'int' | 'string' | 'object', value: any): boolean {
    return this.activeStorages.reduce<boolean>(
      (acc: boolean, s: IDBImpl) => acc && s.set(key, type, value),
      true
    );
  }

  /**
   * Get value by key.
   * Synchronizes storages while getting values.
   *
   * @param {string} key Arbitrary key
   * @param type
   * @return any|null Received value or null if not found
   */
  public get(key: string, type: 'int' | 'string' | 'object'): any | null {
    let valuePrimary = this.storageEngine.get(key, type);
    let valueSecondary = this.cookieEngine.get(key, type);

    if (valuePrimary === valueSecondary) {
      return valuePrimary;
    }

    if (valuePrimary === null) {
      this.storageEngine.set(key, type, valueSecondary);
      return valueSecondary;
    }

    // We come here in case of values conflict only or absence of secondary value -> use primary value.
    this.cookieEngine.set(key, type, valuePrimary);
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
