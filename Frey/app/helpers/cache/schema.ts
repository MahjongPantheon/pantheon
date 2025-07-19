import { RowMajsoulPlatformAccount, RowPerson } from '../../database/schema';
import { Nullable } from '../types';

export const getSuperadminCacheKey = (personId: number) => `frey:superadmin:${personId}`;
export const getPersonalInfoCacheKey = (personId: number) => `frey:personal_info:${personId}`;
export type PersonalInfoData = Array<RowPerson & Nullable<RowMajsoulPlatformAccount>>;
