import * as React from 'react';
import { createContext, useContext, useEffect } from 'react';

export const auth = { isLoggedIn: false, setIsLoggedIn: (_val: boolean) => {} };
export const authCtx = createContext(auth);
export const useAuth = () => {
  return useContext(authCtx);
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <authCtx.Provider value={auth}>{children}</authCtx.Provider>;
};
