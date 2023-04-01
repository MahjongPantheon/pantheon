import * as React from 'react';
import { createContext, createRef } from 'react';

export const actionButtonRef: React.RefObject<HTMLDivElement> = createRef();
export const actionButtonCtx = createContext(actionButtonRef);
