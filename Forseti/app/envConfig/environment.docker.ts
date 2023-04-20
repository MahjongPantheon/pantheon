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

import { EnvConfig } from '#/envConfig/interface';

export const environment: EnvConfig = {
  production: false,
  apiUrl: 'http://localhost:4001',
  uaUrl: 'http://localhost:4004',
  guiUrl: 'http://localhost:4002',
  rootUrl: 'riichimahjong.org',
  adminEmail: 'me@ctizen.dev',
  guiFix: (src: string) => src,
  cookieDomain: null, // when working on localhost this must be omitted!
  statDomain: '',
  siteId: '123456', // for testing
};
