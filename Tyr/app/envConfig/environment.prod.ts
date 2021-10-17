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

import {EnvConfig} from "#/envConfig/interface";

const defaultUrl = 'https://api.mjtop.net/';
let url: string;
let guiFix: (src: string) => string;

// TODO: make this more flexible; left as quick hack
switch (window.location.host) {
  case 'm1.mjtop.net':
    url = 'http://api1.mjtop.net';
    guiFix = (src: string) => src.replace(/gui\./ig, 'gui1.');
    break;
  case 'm2.mjtop.net':
    url = 'http://api2.mjtop.net';
    guiFix = (src: string) => src.replace(/gui\./ig, 'gui2.');
    break;
  case 'm3.mjtop.net':
    url = 'http://api3.mjtop.net';
    guiFix = (src: string) => src.replace(/gui\./ig, 'gui3.');
    break;
  case 'm4.mjtop.net':
    url = 'http://api4.mjtop.net';
    guiFix = (src: string) => src.replace(/gui\./ig, 'gui4.');
    break;
  default:
    url = defaultUrl;
    guiFix = (src: string) => src;
}

export const environment: EnvConfig = {
  production: true,
  apiUrl: url,
  uaUrl: 'https://u.mjtop.net/',
  guiUrl: 'https://gui.mjtop.net/',
  idbTokenKey: 'pantheon_authToken',
  idbIdKey: 'pantheon_currentPersonId',
  idbEventKey: 'pantheon_currentEventId',
  idbLangKey: 'pantheon_currentLanguage',
  idbThemeKey: 'pantheon_currentTheme',
  cookieDomain: 'mjtop.net',
  guiFix: guiFix,
  metrikaId: 64318630,

  // Do not change this unless you really know what are you doing
  apiVersion: [1, 0]
};
