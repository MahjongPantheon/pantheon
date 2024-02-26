/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { createContext, useContext } from 'react';
import { Analytics } from '../services/analytics';
import { storage } from './storage';
import { v4 } from 'uuid';

/**
 * Marked as deprecated to avoid using this in components. Use hook instead.
 * @deprecated
 */
export const analytics = new Analytics();
const sid = storage.getSessionId() ?? v4();
storage.setSessionId(sid);
analytics.setUserId(storage.getPersonId() ?? 0);
analytics.setEventId(storage.getEventId() ?? 0);
analytics.setSessionId(sid);
export const analyticsCtx = createContext(analytics);

export const useAnalytics = () => {
  return useContext(analyticsCtx);
};

export const AnalyticsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <analyticsCtx.Provider value={analytics}>{children}</analyticsCtx.Provider>;
};
