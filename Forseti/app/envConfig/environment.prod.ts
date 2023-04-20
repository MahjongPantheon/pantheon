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
  production: true,
  apiUrl: 'https://gameapi.riichimahjong.org',
  uaUrl: 'https://userapi.riichimahjong.org',
  guiUrl: 'https://rating.riichimahjong.org',
  rootUrl: 'riichimahjong.org',
  adminEmail: 'me@ctizen.dev',
  cookieDomain: '.riichimahjong.org',
  statDomain: 'pl.riichimahjong.org',
  siteId: '767986b1-bac1-4ece-9beb-c61e094ab0ef',
  guiFix: (src: string) => src,
};
