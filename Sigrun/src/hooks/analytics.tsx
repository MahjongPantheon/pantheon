import * as React from 'react';
import { createContext, useContext } from 'react';
import { Analytics } from '../services/analytics';
import { storage } from './storage';

/**
 * Marked as deprecated to avoid using this in components. Use hook instead.
 * @deprecated
 */
export const analytics = new Analytics(
  import.meta.env.VITE_STAT_HOST,
  import.meta.env.VITE_STAT_SITE_ID_SIGRUN
);
analytics.setUserId(storage.getPersonId() ?? 0);
analytics.setEventId(storage.getEventId() ?? 0);
export const analyticsCtx = createContext(analytics);

export const useAnalytics = () => {
  return useContext(analyticsCtx);
};

export const AnalyticsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <analyticsCtx.Provider value={analytics}>{children}</analyticsCtx.Provider>;
};
