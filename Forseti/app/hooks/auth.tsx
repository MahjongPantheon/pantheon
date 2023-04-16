import { createContext } from 'react';

export const auth = { isLoggedIn: false, setIsLoggedIn: (_val: boolean) => {} };
export const authCtx = createContext(auth);
