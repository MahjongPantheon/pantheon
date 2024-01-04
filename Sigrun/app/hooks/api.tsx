/*  Sigrun: rating tables and statistics frontend
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
import { ApiService } from '../services/api';
import { storage } from './storage';
import { analytics } from './analytics';
import { env } from '../env';

const api = new ApiService(
  import.meta.env.SSR ? import.meta.env.VITE_FREY_URL_SSR : env.urls.frey,
  import.meta.env.SSR ? import.meta.env.VITE_MIMIR_URL_SSR : env.urls.mimir
);

export const apiCtx = createContext(api);

export const useApi = () => {
  api
    .setAnalytics(analytics)
    .setCredentials(storage.getPersonId() ?? 0, storage.getAuthToken() ?? '');
  return useContext(apiCtx);
};

export const ApiProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <apiCtx.Provider value={api}>{children}</apiCtx.Provider>;
};
