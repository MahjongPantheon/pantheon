/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.net>
 *
 * This file is part of Tyr.
 *
 * Tyr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tyr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tyr.  If not, see <http://www.gnu.org/licenses/>.
 */

import { EnvConfig } from '#/envConfig/interface';

export const environment: EnvConfig = {
  production: true,
  apiUrl: 'https://gameapi.riichimahjong.org/',
  uaUrl: 'https://userapi.riichimahjong.org/',
  guiUrl: 'https://rating.riichimahjong.org/',
  idbTokenKey: 'pantheon_authToken',
  idbIdKey: 'pantheon_currentPersonId',
  idbEventKey: 'pantheon_currentEventId',
  idbLangKey: 'pantheon_currentLanguage',
  idbThemeKey: 'pantheon_currentTheme',
  idbDeviceModeKey: 'pantheon_singleDeviceMode',
  cookieDomain: '.riichimahjong.org',
  guiFix: (src: string) => src,
  metrikaId: 64318630,

  // Do not change this unless you really know what are you doing
  apiVersion: [1, 0],
};
