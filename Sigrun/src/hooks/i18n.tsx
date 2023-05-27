import * as React from 'react';
import { createContext, useContext } from 'react';
import { I18nService } from '../services/i18n';
import { storage } from './storage';

const i18n = new I18nService(storage);
export const i18nCtx = createContext(i18n);

export const useI18n = () => {
  return useContext(i18nCtx);
};

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <i18nCtx.Provider value={i18n}>{children}</i18nCtx.Provider>;
};
