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

import { createContext } from 'react';
import { PersonEx } from 'tsclients/proto/atoms.pb';

export const auth = {
  isLoggedIn: false,
  setIsLoggedIn: (_val: boolean) => {},
  isSuperadmin: false,
  setIsSuperadmin: (_val: boolean) => {},
  userInfo: null as PersonEx | null,
  setUserInfo: (_val: PersonEx | null) => {},
  ownEvents: [] as number[],
  setOwnEvents: (_val: number[]) => {},
};

export const authCtx = createContext(auth);
export type Auth = typeof auth;
