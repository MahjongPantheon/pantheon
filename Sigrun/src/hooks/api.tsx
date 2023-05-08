import * as React from 'react';
import { createContext, useContext } from 'react';
import { ApiService } from '../services/api';
import { storage } from './storage';
import { analytics } from './analytics';

const api = new ApiService(
  import.meta.env.SSR ? import.meta.env.VITE_FREY_URL_SSR : import.meta.env.VITE_FREY_URL_CLIENT,
  import.meta.env.SSR ? import.meta.env.VITE_MIMIR_URL_SSR : import.meta.env.VITE_MIMIR_URL_CLIENT
);
api
  .setAnalytics(analytics)
  .setCredentials(storage.getPersonId() ?? 0, storage.getAuthToken() ?? '');
export const apiCtx = createContext(api);

export const useApi = () => {
  return useContext(apiCtx);
};

export const ApiProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <apiCtx.Provider value={api}>{children}</apiCtx.Provider>;
};
