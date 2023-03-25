import * as React from 'react';
import { createContext, useContext } from 'react';
import { ApiService } from '#/services/api';
import { storage } from '#/hooks/storage';

const api = new ApiService();
api.setCredentials(storage.getPersonId() ?? 0, storage.getAuthToken() ?? '');
export const apiCtx = createContext(api);

export const useApi = () => {
  return useContext(apiCtx);
};

export const ApiProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <apiCtx.Provider value={api}>{children}</apiCtx.Provider>;
};
