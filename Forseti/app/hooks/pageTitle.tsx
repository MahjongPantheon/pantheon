import * as React from 'react';
import { createContext, SetStateAction, useContext, useEffect, useState } from 'react';

export const ctxValue = { pageTitle: '', setPageTitle: (_v: SetStateAction<string>) => {} };
export const pageTitleCtx = createContext(ctxValue);

export const usePageTitle = (title: string) => {
  const { setPageTitle } = useContext(pageTitleCtx);
  useEffect(() => setPageTitle(title));
};

export const PageTitleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <pageTitleCtx.Provider value={ctxValue}>{children}</pageTitleCtx.Provider>;
};
