import * as React from 'react';
import { createContext, useContext } from 'react';
import { Storage, StorageStrategy } from '../../../Common/storage';

/**
 * @deprecated Please don't use it directly. Use useStorage() instead.
 */
export const storage = new Storage();
export const storageCtx = createContext(storage);

export const useStorage = () => {
  return useContext(storageCtx);
};

export const StorageProvider: React.FC<React.PropsWithChildren & { strategy: StorageStrategy }> = ({
  children,
  strategy,
}) => {
  storage.setStrategy(strategy);
  return <storageCtx.Provider value={storage}>{children}</storageCtx.Provider>;
};
