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

import * as React from 'react';
import { crc32 } from '@foxglove/crc';
import './avatar.css';
import { CSSProperties, useEffect, useState } from 'react';

export const PlayerAvatar = ({
  p,
  size,
  radius,
}: {
  size?: number;
  radius?: string;
  p: { title: string; id: number; hasAvatar?: boolean; lastUpdate: string };
}) => {
  size = size ?? 24;
  radius = radius ?? '24px';
  const [error, setError] = useState(!p.hasAvatar);
  useEffect(() => {
    setError(!p.hasAvatar);
  }, [p]);

  return (
    <div
      className='avatar__wrapper'
      style={{
        borderRadius: radius,
        height: `${size}px`,
        width: `${size}px`,
      }}
      title={`#${p.id}`}
    >
      {error ? (
        <div
          className='avatar__placeholder'
          style={{ ...makeColors(p.title), fontSize: size / 2 - 4 }}
        >
          {makeInitials(p.title)}
        </div>
      ) : (
        <img
          className='avatar__placeholder'
          alt=''
          src={`${import.meta.env.VITE_GULLVEIG_URL}/files/avatars/user_${p.id}.jpg?${
            p.lastUpdate
          }`}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

export function makeColors(input: string): Pick<CSSProperties, 'color' | 'backgroundColor'> {
  const colors = [
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
  const selected = colors[crc32(Uint8Array.from(input, (x) => x.charCodeAt(0))) % colors.length];
  return {
    color: 'var(--avatar-fg-' + selected + ')',
    backgroundColor: 'var(--avatar-bg-' + selected + ')',
  };
}

export function makeInitials(input: string): string {
  if (input.length === 0) {
    return '??';
  }
  const [word1, word2] = input.trim().split(/\s+/).slice(0, 2);
  if (!word2) {
    return word1[0].toUpperCase();
  }
  return word1[0].toUpperCase() + word2[0].toUpperCase();
}
