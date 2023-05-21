import { createContext } from 'react';

export const globals: { eventId: number | null; setEventId: (id: null | number) => void } = {
  eventId: null,
  setEventId: () => {},
};
export const globalsCtx = createContext(globals);
