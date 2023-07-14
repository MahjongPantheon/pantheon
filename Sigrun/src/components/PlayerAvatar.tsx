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

import { Avatar, MantineColor, MantineSize } from '@mantine/core';
import { crc32 } from '@foxglove/crc';
import * as React from 'react';

export const PlayerAvatar = ({
  p,
  size,
  radius,
}: {
  size?: MantineSize;
  radius?: MantineSize;
  p: { title: string; id: number; hasAvatar?: boolean; lastUpdate: string };
}) => {
  size = size ?? 'md';
  radius = radius ?? 'xl';

  if (p.hasAvatar) {
    return (
      <Avatar
        radius={radius}
        size={size}
        title={`#${p.id}`}
        src={`${import.meta.env.VITE_GULLVEIG_URL}/files/avatars/user_${p.id}.jpg?${p.lastUpdate}`}
      />
    );
  }

  return (
    <Avatar color={makeColor(p.title)} radius={radius} size={size} title={`#${p.id}`}>
      {makeInitials(p.title)}
    </Avatar>
  );
};

export function makeColor(input: string): MantineColor {
  const colors: MantineColor[] = [
    'red',
    'orange',
    'yellow',
    'green',
    'lime',
    'teal',
    'cyan',
    'blue',
    'purple',
    'grape',
    'pink',
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
