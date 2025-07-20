import type { ColumnType } from 'kysely';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export interface MajsoulPlatformAccount {
  account_id: number;
  friend_id: number;
  id: Generated<number>;
  nickname: string;
  person_id: number;
}

export type RowMajsoulPlatformAccount = Omit<MajsoulPlatformAccount, 'id'>;

export interface Person {
  auth_hash: string;
  /**
   * This field stores temporary secure token if user requests changing his password
   */
  auth_reset_token: string | null;
  /**
   * App-level salt to make client-side permanent token
   */
  auth_salt: string;
  city: string | null;
  country: string;
  disabled: number;
  /**
   * PERSONAL DATA
   */
  email: string;
  has_avatar: number | null;
  id: Generated<number>;
  is_superadmin: number | null;
  last_update: Date | null;
  notifications: string | null;
  /**
   * PERSONAL DATA
   */
  phone: string | null;
  telegram_id: string | null;
  tenhou_id: string | null;
  title: string;
}

export type RowPerson = Omit<Person, 'id'>;

export interface PersonAccess {
  /**
   * ACL item recognizable name to differentiate this one from others
   */
  acl_name: string;
  /**
   * ACL value 1 or 0
   */
  acl_value: number;
  event_id: number | null;
  id: Generated<number>;
  person_id: number;
}

export type RowPersonAccess = Omit<PersonAccess, 'id'>;

export interface Registrant {
  approval_code: string;
  auth_hash: string;
  /**
   * App-level salt to make client-side permanent token
   */
  auth_salt: string;
  email: string;
  id: Generated<number>;
  title: Generated<string>;
}

export type RowRegistrant = Omit<Registrant, 'id'>;

export interface Database {
  majsoul_platform_account: MajsoulPlatformAccount;
  person: Person;
  person_access: PersonAccess;
  registrant: Registrant;
}
