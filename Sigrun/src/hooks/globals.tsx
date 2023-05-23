import { createContext } from 'react';
import { EventType } from '../clients/proto/atoms.pb';

export type Globals = {
  eventId: number | null;
  type: EventType | null;
  isTeam: boolean;
  isPrescripted: boolean;
};
export const globals: { data: Globals; setData: (data: Partial<Globals>) => void } = {
  data: {
    eventId: null,
    type: null,
    isPrescripted: false,
    isTeam: false,
  },
  setData: () => {},
};
export const globalsCtx = createContext(globals);
