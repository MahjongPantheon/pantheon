import * as React from 'react';
import { createContext, useContext } from 'react';
import { Storage } from '../../../Common/storage';

/**
 * @deprecated Please don't use it directly. Use useStorage() instead.
 */
export const storage = new Storage();
export const storageCtx = createContext(storage);

export const useStorage = () => {
  return useContext(storageCtx);
};

export const StorageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <storageCtx.Provider value={storage}>{children}</storageCtx.Provider>;
};
