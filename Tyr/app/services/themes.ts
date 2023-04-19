/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
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

export const supportedThemes = ['day', 'night'];

const dayTheme = {
  name: 'day',
  backgroundColor: '#F4F5F7',
  primaryColor: '#1565C0',
  secondaryColor: '#B8C0D1',
  textColor: '#000000',
} as Theme;

const nightTheme = {
  name: 'night',
  backgroundColor: '#282C34',
  primaryColor: '#1565C0',
  secondaryColor: '#37445C',
  textColor: '#E6E6E6',
} as Theme;

export const themes = [dayTheme, nightTheme];

export type Theme = {
  name: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
};
