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
import { Storage } from '../../../Common/storage';
import { StorageStrategyClient } from '../../../Common/storageStrategyClient';
import { env } from '../env';

const storageStrategy = new StorageStrategyClient(env.cookieDomain);
/**
 * @deprecated Please don't use it directly. Use useStorage() instead.
 */
export const storage = new Storage();
storage.setStrategy(storageStrategy);
export const storageCtx = createContext(storage);

export const useStorage = () => {
  return useContext(storageCtx);
};

export const StorageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <storageCtx.Provider value={storage}>{children}</storageCtx.Provider>;
};
