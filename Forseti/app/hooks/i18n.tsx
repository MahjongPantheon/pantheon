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
import { I18nService } from '../services/i18n';
import { storage } from './storage';

const i18n = new I18nService(storage);
i18n.init(
  (locale) => {
    storage.setLang(locale);
  },
  (err) => console.error(err)
);
export const i18nCtx = createContext(i18n);

export const useI18n = () => {
  return useContext(i18nCtx);
};

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <i18nCtx.Provider value={i18n}>{children}</i18nCtx.Provider>;
};
