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

import { MantineColor } from '@mantine/core';
import { crc32 } from '@foxglove/crc';

export function makeColor(input: string): MantineColor {
  const colors: MantineColor[] = [
    'gray',
    'red',
    'pink',
    'grape',
    'violet',
    'indigo',
    'blue',
    'cyan',
    'green',
    'lime',
    'yellow',
    'orange',
    'teal',
  ];
  return colors[crc32(Uint8Array.from(input, (x) => x.charCodeAt(0))) % colors.length];
}

export function makeInitials(input: string): string {
  const [word1, word2] = input.trim().split(/\s+/).slice(0, 2);
  if (!word2) {
    return word1[0].toUpperCase();
  }
  return word1[0].toUpperCase() + word2[0].toUpperCase();
}
